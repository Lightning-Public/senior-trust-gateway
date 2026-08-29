export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export type RiskSignal = {
  id: string
  label: string
  level: RiskLevel
}

export type RiskAnalysis = {
  level: RiskLevel
  summary: string
  reasons: string[]
  recommendation: string
  shouldEscalate: boolean
  signals: RiskSignal[]
}

export interface RiskAnalyzer {
  analyze(message: string): Promise<RiskAnalysis>
}
