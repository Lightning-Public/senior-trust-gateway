import type { OfficialCheckResult, OfficialSourceVerifier } from './types'
import { extractHttpUrls, normalizeHttpUrl } from './urlTools'

export type KisaPhishingRecord = {
  url: string
  detectedDate: string
}

export type KisaVerifierOptions = {
  authoritative?: boolean
  dataDate?: string
  available?: boolean
}

const KISA_SOURCE = {
  id: 'kisa-phishing-sites-15143094',
  name: '한국인터넷진흥원_피싱사이트',
  url: 'https://www.data.go.kr/data/15143094/fileData.do',
}

export class KisaPhishingSnapshotVerifier implements OfficialSourceVerifier {
  private readonly normalizedRecords: Map<string, KisaPhishingRecord>
  private readonly authoritative: boolean
  private readonly dataDate?: string
  private readonly available: boolean

  constructor(records: KisaPhishingRecord[], options: KisaVerifierOptions = {}) {
    this.authoritative = options.authoritative ?? false
    this.dataDate = options.dataDate
    this.available = options.available ?? records.length > 0
    this.normalizedRecords = new Map(
      records.flatMap((record) => {
        const normalized = normalizeHttpUrl(record.url)
        return normalized ? [[normalized, record] as const] : []
      }),
    )
  }

  async verify(message: string): Promise<OfficialCheckResult> {
    const checkedUrls = extractHttpUrls(message)
    const source = { ...KISA_SOURCE, dataDate: this.dataDate }

    if (checkedUrls.length === 0) {
      return {
        outcome: 'NO_URL',
        source,
        checkedUrls,
        authoritative: this.authoritative,
        detail: '확인할 인터넷 주소가 메시지에 없습니다.',
      }
    }

    for (const url of checkedUrls) {
      const match = this.normalizedRecords.get(url)
      if (match) {
        return {
          outcome: 'MATCH',
          source,
          checkedUrls,
          matchedUrl: url,
          detectedDate: match.detectedDate,
          authoritative: this.authoritative,
          detail: this.authoritative
            ? 'KISA 공개 피싱 URL 스냅샷에서 일치 항목을 찾았습니다.'
            : '로컬 테스트 스냅샷에서 일치했습니다. 실제 공식 판정으로 사용하지 않습니다.',
        }
      }
    }

    return {
      outcome: this.available ? 'NO_MATCH' : 'UNAVAILABLE',
      source,
      checkedUrls,
      authoritative: this.authoritative,
      detail: this.available
        ? '공개 스냅샷에서 일치 항목을 찾지 못했습니다. 안전하다는 뜻은 아닙니다.'
        : '공식 데이터 스냅샷이 아직 앱에 적재되지 않아 자동 대조하지 못했습니다.',
    }
  }
}
