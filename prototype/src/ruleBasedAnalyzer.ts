import type { RiskAnalysis, RiskAnalyzer, RiskLevel, RiskSignal } from './types'

type Rule = {
  id: string
  label: string
  level: RiskLevel
  patterns: RegExp[]
}

const rules: Rule[] = [
  {
    id: 'money-transfer',
    label: '송금·입금 요청',
    level: 'HIGH',
    patterns: [/송금/i, /입금/i, /이체/i, /안전계좌/i, /계좌로 보내/i],
  },
  {
    id: 'credential-request',
    label: '인증정보 요구',
    level: 'HIGH',
    patterns: [/인증번호/i, /비밀번호/i, /보안카드/i, /OTP/i, /주민등록번호/i],
  },
  {
    id: 'remote-control',
    label: '앱 설치·원격제어 요구',
    level: 'HIGH',
    patterns: [/앱.*설치/i, /원격.*제어/i, /원격.*지원/i, /화면.*공유/i],
  },
  {
    id: 'authority-pressure',
    label: '기관 사칭 또는 압박 가능성',
    level: 'HIGH',
    patterns: [/검찰/i, /검사/i, /경찰/i, /금융감독원/i, /계좌.*범죄/i],
  },
  {
    id: 'external-link',
    label: '외부 링크 포함',
    level: 'MEDIUM',
    patterns: [/https?:\/\//i, /www\./i, /bit\.ly/i, /주소.*확인/i, /링크.*확인/i],
  },
  {
    id: 'urgency',
    label: '급하게 행동하도록 재촉',
    level: 'MEDIUM',
    patterns: [/즉시/i, /지금 바로/i, /오늘까지/i, /긴급/i, /미납/i, /정지됩니다/i],
  },
  {
    id: 'benefit-bait',
    label: '지원금·당첨 등을 미끼로 사용',
    level: 'MEDIUM',
    patterns: [/지원금/i, /당첨/i, /환급금/i, /무료.*지급/i],
  },
]

const rank: Record<RiskLevel, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 }

function matchedSignals(message: string): RiskSignal[] {
  return rules
    .filter((rule) => rule.patterns.some((pattern) => pattern.test(message)))
    .map(({ id, label, level }) => ({ id, label, level }))
}

function highestLevel(signals: RiskSignal[]): RiskLevel {
  return signals.reduce<RiskLevel>(
    (highest, signal) => (rank[signal.level] > rank[highest] ? signal.level : highest),
    'LOW',
  )
}

function analysisFor(level: RiskLevel, signals: RiskSignal[]): RiskAnalysis {
  const reasons = signals.length > 0
    ? signals.map((signal) => signal.label)
    : ['돈·인증정보·앱 설치를 요구하는 뚜렷한 위험 신호를 찾지 못했습니다.']

  if (level === 'HIGH') {
    return {
      level,
      summary: '지금은 행동하지 않는 것이 안전해요.',
      reasons,
      recommendation: '링크를 누르거나 돈·인증정보를 보내지 마세요. 공식 대표번호나 믿을 수 있는 가족에게 먼저 확인하세요.',
      shouldEscalate: true,
      signals,
    }
  }

  if (level === 'MEDIUM') {
    return {
      level,
      summary: '바로 진행하기 전에 한 번 더 확인하는 게 좋아요.',
      reasons,
      recommendation: '메시지 안의 링크 대신 해당 기관의 공식 앱이나 홈페이지를 직접 열어 확인하세요.',
      shouldEscalate: false,
      signals,
    }
  }

  return {
    level,
    summary: '현재 문장에서는 뚜렷한 위험 신호가 보이지 않아요.',
    reasons,
    recommendation: '그래도 돈, 비밀번호, 인증번호를 요구하거나 앱 설치를 시키면 진행하지 말고 다시 확인하세요.',
    shouldEscalate: false,
    signals,
  }
}

export class RuleBasedRiskAnalyzer implements RiskAnalyzer {
  async analyze(message: string): Promise<RiskAnalysis> {
    const signals = matchedSignals(message.trim())
    return analysisFor(highestLevel(signals), signals)
  }
}
