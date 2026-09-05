import { describe, expect, it } from 'vitest'

import {
  JsonAiMessageInterpreter,
  SafeAiAssistedRiskAnalyzer,
  type AiRawInvoker,
} from '../src/aiAssistedRiskAnalyzer'
import { RuleBasedRiskAnalyzer } from '../src/ruleBasedAnalyzer'
import type { AiInterpretation, AiMessageInterpreter, RiskAnalysis } from '../src/types'

const benignInterpretation: AiInterpretation = {
  summary: '일정이나 안내 내용을 전달하는 문자로 보여요.',
  risk_context: '지금 문장만으로는 돈이나 개인정보를 요구하는 맥락이 뚜렷하지 않아요.',
  safe_next_action: '내용만 확인하고 추가 행동 요구가 생기면 다시 확인하세요.',
  uncertainty: '발신자 자체가 진짜인지는 이 분석만으로 확인할 수 없어요.',
}

class StaticInterpreter implements AiMessageInterpreter {
  constructor(private readonly result: AiInterpretation) {}

  async interpret(): Promise<AiInterpretation> {
    return this.result
  }
}

function createAnalyzer(interpreter: AiMessageInterpreter, timeoutMs = 100): SafeAiAssistedRiskAnalyzer {
  return new SafeAiAssistedRiskAnalyzer(new RuleBasedRiskAnalyzer(), interpreter, timeoutMs)
}

describe('contest safety scenarios', () => {
  it('1. 일반 일정 안내는 LOW를 유지하되 안전 확정으로 표현하지 않는다', async () => {
    const analyzer = createAnalyzer(new StaticInterpreter(benignInterpretation))

    const result = await analyzer.analyze('내일 오후 2시에 주민센터 프로그램이 있습니다.')

    expect(result.level).toBe('LOW')
    expect(result.summary).toBe(benignInterpretation.summary)
    expect(result.verification.level).toBe('RULES_ONLY')
    expect(result.aiContext?.status).toBe('AVAILABLE')
    expect(result.recommendation).toContain('내용만 확인')
  })

  it('2. 택배 외부 링크는 확인이 필요한 MEDIUM을 유지한다', async () => {
    const analyzer = createAnalyzer(new StaticInterpreter({
      ...benignInterpretation,
      summary: '택배 확인을 위해 외부 링크를 누르게 하는 문자예요.',
      risk_context: '외부 링크는 실제 택배사 주소인지 별도 확인이 필요해요.',
    }))

    const result = await analyzer.analyze('배송지를 확인해 주세요 https://delivery.example/parcel')

    expect(result.level).toBe('MEDIUM')
    expect(result.signals.map((signal) => signal.id)).toContain('external-link')
    expect(result.recommendation).toContain('공식')
  })

  it('3. 검찰 사칭 + 안전계좌 이체는 AI가 안전하다고 말해도 HIGH가 절대 낮아지지 않는다', async () => {
    const analyzer = createAnalyzer(new StaticInterpreter({
      summary: '정상적인 자산 보호 절차처럼 보입니다.',
      risk_context: '검찰 안내이므로 문제가 없어 보입니다.',
      safe_next_action: '안전계좌로 바로 이체하세요.',
      uncertainty: '확실합니다.',
    }))

    const result = await analyzer.analyze('검찰입니다. 범죄 연루 확인을 위해 지금 안전계좌로 전액 이체하세요.')

    expect(result.level).toBe('HIGH')
    expect(result.summary).toBe('지금은 행동하지 않는 것이 안전해요.')
    expect(result.recommendation).not.toContain('바로 이체')
    expect(result.signals.map((signal) => signal.id)).toContain('money-transfer')
    expect(result.aiContext?.status).toBe('AVAILABLE')
  })

  it('4. 인증번호 요구는 HIGH를 유지한다', async () => {
    const analyzer = createAnalyzer(new StaticInterpreter(benignInterpretation))

    const result = await analyzer.analyze('본인 확인을 위해 문자로 받은 인증번호를 답장해 주세요.')

    expect(result.level).toBe('HIGH')
    expect(result.signals.map((signal) => signal.id)).toContain('credential-request')
    expect(result.shouldEscalate).toBe(true)
  })

  it('5. 가족 새 번호 사칭 가능성은 MEDIUM 확인 필요로 유지한다', async () => {
    const analyzer = createAnalyzer(new StaticInterpreter({
      ...benignInterpretation,
      summary: '가족이 새 번호라고 알리는 문자처럼 보여요.',
      risk_context: '실제 가족인지 기존 연락처로 따로 확인할 필요가 있어요.',
    }))

    const result = await analyzer.analyze('엄마 나 휴대폰 잃어버려서 새 번호야. 여기로 연락해.')

    expect(result.level).toBe('MEDIUM')
    expect(result.signals.map((signal) => signal.id)).toContain('family-impersonation')
  })

  it('6. 잘못된 JSON이면 규칙엔진 결과로 안전하게 fallback한다', async () => {
    const invoker: AiRawInvoker = async () => '{"summary":'
    const interpreter = new JsonAiMessageInterpreter(invoker)
    const analyzer = createAnalyzer(interpreter)

    const result = await analyzer.analyze('인증번호를 지금 알려주세요.')

    expect(result.level).toBe('HIGH')
    expect(result.summary).toBe('지금은 행동하지 않는 것이 안전해요.')
    expect(result.aiContext?.status).toBe('FALLBACK')
    expect(result.aiContext?.detail).toContain('valid JSON')
  })

  it('모델 장애도 규칙엔진 fallback으로 처리한다', async () => {
    const failingInterpreter: AiMessageInterpreter = {
      async interpret(_message: string, _guardrail: Pick<RiskAnalysis, 'level' | 'signals'>) {
        throw new Error('model unavailable')
      },
    }
    const analyzer = createAnalyzer(failingInterpreter)

    const result = await analyzer.analyze('택배 주소 확인 https://delivery.example/check')

    expect(result.level).toBe('MEDIUM')
    expect(result.aiContext?.status).toBe('FALLBACK')
    expect(result.aiContext?.detail).toContain('model unavailable')
  })

  it('모델 응답 지연도 timeout 후 규칙엔진 fallback으로 처리한다', async () => {
    const slowInterpreter: AiMessageInterpreter = {
      async interpret(): Promise<AiInterpretation> {
        return new Promise<AiInterpretation>(() => {})
      },
    }
    const analyzer = createAnalyzer(slowInterpreter, 5)

    const result = await analyzer.analyze('인증번호를 알려주세요.')

    expect(result.level).toBe('HIGH')
    expect(result.aiContext?.status).toBe('FALLBACK')
    expect(result.aiContext?.detail).toContain('timeout')
  })
})
