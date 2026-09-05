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

export type OfficialSourceReference = {
  id: string
  name: string
  url: string
  dataDate?: string
}

export type OfficialCheckOutcome = 'MATCH' | 'NO_MATCH' | 'NO_URL' | 'UNAVAILABLE'

export type OfficialCheckResult = {
  outcome: OfficialCheckOutcome
  source: OfficialSourceReference
  checkedUrls: string[]
  matchedUrl?: string
  detectedDate?: string
  authoritative: boolean
  detail: string
}

export type RiskAnalysis = {
  level: RiskLevel
  summary: string
  reasons: string[]
  recommendation: string
  verification: VerificationStatus
  officialChecks?: OfficialCheckResult[]
  shouldEscalate: boolean
  signals: RiskSignal[]
}

export interface RiskAnalyzer {
  analyze(message: string): Promise<RiskAnalysis>
}

export interface OfficialSourceVerifier {
  verify(message: string): Promise<OfficialCheckResult>
}
