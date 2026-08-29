import { describe, expect, it } from 'vitest'
import { RuleBasedRiskAnalyzer } from '../src/ruleBasedAnalyzer'

const analyzer = new RuleBasedRiskAnalyzer()

const cases = [
  {
    name: 'ordinary appointment notice stays low risk',
    message: '건강검진 예약일은 9월 3일 오전 10시입니다.',
    expected: 'LOW',
  },
  {
    name: 'delivery link requires confirmation',
    message: '택배 주소가 잘못되었습니다. 아래 링크에서 주소 확인 바랍니다. https://example.com',
    expected: 'MEDIUM',
  },
  {
    name: 'safe account transfer is high risk',
    message: '검찰입니다. 계좌가 범죄에 연루됐습니다. 지금 안전계좌로 이체하세요.',
    expected: 'HIGH',
  },
  {
    name: 'verification code request is high risk',
    message: '은행 직원입니다. 본인 확인을 위해 인증번호를 알려주세요.',
    expected: 'HIGH',
  },
  {
    name: 'benefit link with urgency requires confirmation',
    message: '정부 지원금 대상자입니다. 오늘까지 링크에서 신청하세요. https://example.com',
    expected: 'MEDIUM',
  },
] as const

describe('RuleBasedRiskAnalyzer', () => {
  for (const testCase of cases) {
    it(testCase.name, async () => {
      const result = await analyzer.analyze(testCase.message)
      expect(result.level).toBe(testCase.expected)
    })
  }

  it('escalates high-risk results', async () => {
    const result = await analyzer.analyze('인증번호를 알려주고 지금 이체하세요.')
    expect(result.level).toBe('HIGH')
    expect(result.shouldEscalate).toBe(true)
  })
})
