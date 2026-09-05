import { afterEach, describe, expect, it, vi } from 'vitest'
import { GroundedRiskAnalyzer } from '../src/groundedRiskAnalyzer'
import { BundledKisaSnapshotVerifier } from '../src/kisaSnapshotLoader'
import { KisaPhishingSnapshotVerifier } from '../src/officialVerification'
import { RuleBasedRiskAnalyzer } from '../src/ruleBasedAnalyzer'
import { extractHttpUrls, normalizeHttpUrl, urlBucketKey } from '../src/urlTools'

const officialRecord = {
  url: 'http://phishing-test.invalid/pay',
  detectedDate: '20241231',
}

const authoritativeManifest = {
  kind: 'KISA_PHISHING_BUCKET_INDEX',
  authoritative: true,
  source: 'data.go.kr/15143094',
  dataDate: '20241231',
  bucketCount: 256,
  totalRecords: 131752,
  buckets: { '46': 1 },
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('URL normalization and bucketing', () => {
  it('extracts unique HTTP URLs and removes fragments/trailing punctuation', () => {
    expect(extractHttpUrls('확인 http://PHISHING-test.invalid:80/pay#step, 다시 http://phishing-test.invalid/pay')).toEqual([
      'http://phishing-test.invalid/pay',
    ])
  })

  it('rejects non-http protocols', () => {
    expect(normalizeHttpUrl('javascript:alert(1)')).toBeNull()
  })

  it('assigns a stable two-digit bucket to a normalized URL', () => {
    expect(urlBucketKey('http://PHISHING-test.invalid:80/pay#step')).toBe('46')
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

  it('can represent an available official bucket with zero matching records', async () => {
    const verifier = new KisaPhishingSnapshotVerifier([], {
      authoritative: true,
      available: true,
      dataDate: '20241231',
    })
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

describe('BundledKisaSnapshotVerifier', () => {
  it('does not fetch official data when the message has no URL', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const verifier = new BundledKisaSnapshotVerifier()
    const result = await verifier.verify('내일 오전 10시에 병원 예약입니다.')

    expect(result.outcome).toBe('NO_URL')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('loads a non-authoritative manifest only once and fails safely', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        kind: 'KISA_PHISHING_BUCKET_INDEX',
        authoritative: false,
        source: 'placeholder',
        dataDate: '2024-12-31',
        bucketCount: 256,
        totalRecords: 0,
        buckets: {},
      }),
    } as Response)
    vi.stubGlobal('fetch', fetchMock)

    const verifier = new BundledKisaSnapshotVerifier()
    const first = await verifier.verify('확인 https://one-test.invalid')
    const second = await verifier.verify('확인 https://two-test.invalid')

    expect(first.outcome).toBe('UNAVAILABLE')
    expect(second.outcome).toBe('UNAVAILABLE')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('loads only the matching hash bucket for an authoritative URL match', async () => {
    const fetchMock = vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith('/manifest.json')) {
        return { ok: true, json: async () => authoritativeManifest } as Response
      }
      if (url.endsWith('/46.json')) {
        return {
          ok: true,
          json: async () => ({
            kind: 'KISA_PHISHING_BUCKET',
            authoritative: true,
            source: 'data.go.kr/15143094',
            dataDate: '20241231',
            bucket: '46',
            records: [officialRecord],
          }),
        } as Response
      }
      return { ok: false } as Response
    })
    vi.stubGlobal('fetch', fetchMock)

    const verifier = new BundledKisaSnapshotVerifier()
    const result = await verifier.verify('확인 http://phishing-test.invalid/pay')

    expect(result.outcome).toBe('MATCH')
    expect(result.authoritative).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1]?.[0]).toContain('/46.json')
  })

  it('does not fetch a bucket when the authoritative manifest says it is empty', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ...authoritativeManifest, buckets: {} }),
    } as Response)
    vi.stubGlobal('fetch', fetchMock)

    const verifier = new BundledKisaSnapshotVerifier()
    const result = await verifier.verify('확인 https://unknown-test.invalid/login')

    expect(result.outcome).toBe('NO_MATCH')
    expect(result.detail).toContain('안전하다는 뜻은 아닙니다')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('returns unavailable instead of no-match when a required bucket cannot be loaded', async () => {
    const fetchMock = vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith('/manifest.json')) {
        return { ok: true, json: async () => authoritativeManifest } as Response
      }
      return { ok: false } as Response
    })
    vi.stubGlobal('fetch', fetchMock)

    const verifier = new BundledKisaSnapshotVerifier()
    const result = await verifier.verify('확인 http://phishing-test.invalid/pay')

    expect(result.outcome).toBe('UNAVAILABLE')
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
