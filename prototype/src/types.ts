export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export type VerificationLevel = 'RULES_ONLY' | 'OFFICIAL_SOURCE' | 'HUMAN_CONFIRMED'

export type RiskSignal = {
  id: string
  label: string
  level: RiskLevel
}

export type VerificationStatus = {
  level: VerificationLevel
  label: string
  detail: string
}

export type RiskAnalysis = {
  level: RiskLevel
  summary: string
  reasons: string[]
  recommendation: string
  verification: VerificationStatus
  shouldEscalate: boolean
  signals: RiskSignal[]
}

export interface RiskAnalyzer {
  analyze(message: string): Promise<RiskAnalysis>
}
