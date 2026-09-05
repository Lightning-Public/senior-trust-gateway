import type { OfficialSourceVerifier, RiskAnalysis, RiskAnalyzer } from './types'

export class GroundedRiskAnalyzer implements RiskAnalyzer {
  constructor(
    private readonly baseAnalyzer: RiskAnalyzer,
    private readonly officialVerifier: OfficialSourceVerifier,
  ) {}

  async analyze(message: string): Promise<RiskAnalysis> {
    const [base, officialCheck] = await Promise.all([
      this.baseAnalyzer.analyze(message),
      this.officialVerifier.verify(message),
    ])

    const officialChecks = [...(base.officialChecks ?? []), officialCheck]
    const isAuthoritativeMatch = officialCheck.outcome === 'MATCH' && officialCheck.authoritative

    if (!isAuthoritativeMatch) {
      return { ...base, officialChecks }
    }

    const detectedDate = officialCheck.detectedDate ? ` 탐지일: ${officialCheck.detectedDate}.` : ''

    return {
      ...base,
      level: 'HIGH',
      summary: '공식 공개 피싱 URL 목록과 일치하는 주소가 있어요.',
      reasons: [...base.reasons, 'KISA 공개 피싱 URL 목록과 일치'],
      recommendation: '해당 링크를 열거나 정보를 입력하지 마세요. 메시지에 적힌 연락처도 사용하지 말고 공식 대표번호나 믿을 수 있는 사람에게 확인하세요.',
      verification: {
        level: 'OFFICIAL_SOURCE',
        label: '공식 공개 데이터에서 일치 근거를 찾았어요',
        detail: `${officialCheck.source.name}에서 해당 URL과 일치하는 항목을 확인했습니다.${detectedDate}`,
      },
      officialChecks,
      shouldEscalate: true,
    }
  }
}
