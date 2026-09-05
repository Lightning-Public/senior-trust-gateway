import type { RiskAnalysis, RiskAnalyzer, RiskLevel, RiskSignal, VerificationStatus } from './types'

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
    patterns: [/앱.*설치/i, /원격.*제어/i, /원격.*지원/i, /화면.*공유/i, /AnyDesk/i, /TeamViewer/i, /퀵서포트/i],
  },
  {
    id: 'authority-pressure',
    label: '수사기관·금융기관 사칭 및 압박 가능성',
    level: 'HIGH',
    patterns: [
      /(검찰|검사|경찰|금융감독원).*(범죄|수사|압류|체포|보호조치)/i,
      /(범죄|수사|압류|체포).*(검찰|검사|경찰|금융감독원)/i,
    ],
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
  {
    id: 'family-impersonation',
    label: '가족·지인 사칭 가능성',
    level: 'MEDIUM',
    patterns: [
      /(아들|딸|엄마|아빠).*(휴대폰|핸드폰|폰).*(고장|분실|잃어)/i,
      /(새 번호|번호 바꿨|내 번호 바뀌)/i,
    ],
  },
]

const rank: Record<RiskLevel, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 }

const rulesOnlyVerification: VerificationStatus = {
  level: 'RULES_ONLY',
  label: '문장 속 위험 신호만 확인했어요',
  detail: '아직 발신자나 기관의 진짜 여부를 공식 자료로 확인한 것은 아닙니다.',
}

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
    : ['현재 규칙에서 송금·인증정보·앱 설치·외부 링크·재촉 같은 위험 신호를 찾지 못했습니다.']

  if (level === 'HIGH') {
    return {
      level,
      summary: '지금은 행동하지 않는 것이 안전해요.',
      reasons,
      recommendation: '문자 속 링크나 전화번호를 이용하지 말고, 공식 대표번호를 직접 찾아 확인하거나 믿을 수 있는 가족에게 먼저 확인하세요.',
      verification: rulesOnlyVerification,
      shouldEscalate: true,
      signals,
    }
  }

  if (level === 'MEDIUM') {
    return {
      level,
      summary: '바로 진행하기 전에 한 번 더 확인하는 게 좋아요.',
      reasons,
      recommendation: '메시지 안의 링크나 연락처 대신 해당 기관의 공식 앱·홈페이지·대표번호를 직접 찾아 확인하세요.',
      verification: rulesOnlyVerification,
      shouldEscalate: false,
      signals,
    }
  }

  return {
    level,
    summary: '뚜렷한 위험 신호는 적지만, 안전 확인이 끝난 것은 아니에요.',
    reasons,
    recommendation: '추가 행동을 요구하지 않는 안내라면 내용만 확인하세요. 돈·개인정보·링크 클릭·앱 설치를 요구하면 진행하지 말고 다시 확인하세요.',
    verification: rulesOnlyVerification,
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
