import { describe, expect, it } from 'vitest'
import { GroundedRiskAnalyzer } from '../src/groundedRiskAnalyzer'
import { KisaPhishingSnapshotVerifier } from '../src/officialVerification'
import { RuleBasedRiskAnalyzer } from '../src/ruleBasedAnalyzer'
import { extractHttpUrls, normalizeHttpUrl } from '../src/urlTools'

const officialRecord = {
  url: 'http://phishing-test.invalid/pay',
  detectedDate: '20241231',
}

describe('URL normalization', () => {
  it('extracts unique HTTP URLs and removes fragments/trailing punctuation', () => {
    expect(extractHttpUrls('확인 http://PHISHING-test.invalid:80/pay#step, 다시 http://phishing-test.invalid/pay')).toEqual([
      'http://phishing-test.invalid/pay',
    ])
  })

  it('rejects non-http protocols', () => {
    expect(normalizeHttpUrl('javascript:alert(1)')).toBeNull()
  })
})

describe('KisaPhishingSnapshotVerifier', () => {
  it('reports an authoritative exact match', async () => {
    const verifier = new KisaPhishingSnapshotVerifier([officialRecord], {
      authoritative: true,
      dataDate: '2024-12-31',
    })
    const result = await verifier.verify('여기서 확인하세요. http://phishing-test.invalid/pay')

    expect(result.outcome).toBe('MATCH')
    expect(result.authoritative).toBe(true)
    expect(result.detectedDate).toBe('20241231')
  })

  it('never turns a dataset miss into a safe verdict', async () => {
    const verifier = new KisaPhishingSnapshotVerifier([officialRecord], { authoritative: true })
    const result = await verifier.verify('확인 https://unknown-test.invalid/login')

    expect(result.outcome).toBe('NO_MATCH')
    expect(result.detail).toContain('안전하다는 뜻은 아닙니다')
  })

  it('does not claim official verification for test-only snapshots', async () => {
    const verifier = new KisaPhishingSnapshotVerifier([officialRecord])
    const result = await verifier.verify('확인 http://phishing-test.invalid/pay')

    expect(result.outcome).toBe('MATCH')
    expect(result.authoritative).toBe(false)
    expect(result.detail).toContain('실제 공식 판정으로 사용하지 않습니다')
  })
})

describe('GroundedRiskAnalyzer', () => {
  it('elevates an authoritative official match to HIGH and OFFICIAL_SOURCE', async () => {
    const verifier = new KisaPhishingSnapshotVerifier([officialRecord], {
      authoritative: true,
      dataDate: '2024-12-31',
    })
    const analyzer = new GroundedRiskAnalyzer(new RuleBasedRiskAnalyzer(), verifier)
    const result = await analyzer.analyze('내용 확인 http://phishing-test.invalid/pay')

    expect(result.level).toBe('HIGH')
    expect(result.verification.level).toBe('OFFICIAL_SOURCE')
    expect(result.shouldEscalate).toBe(true)
  })

  it('keeps the base verdict when official data is unavailable', async () => {
    const analyzer = new GroundedRiskAnalyzer(
      new RuleBasedRiskAnalyzer(),
      new KisaPhishingSnapshotVerifier([], { dataDate: '2024-12-31' }),
    )
    const result = await analyzer.analyze('택배 확인 https://unknown-test.invalid')

    expect(result.level).toBe('MEDIUM')
    expect(result.verification.level).toBe('RULES_ONLY')
    expect(result.officialChecks?.[0]?.outcome).toBe('UNAVAILABLE')
  })
})
