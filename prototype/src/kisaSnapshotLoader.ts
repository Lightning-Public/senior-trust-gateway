import { KisaPhishingSnapshotVerifier, type KisaPhishingRecord } from './officialVerification'
import type { OfficialCheckResult, OfficialSourceVerifier } from './types'
import { extractHttpUrls } from './urlTools'

type KisaSnapshotDocument = {
  kind: 'KISA_PHISHING_SNAPSHOT'
  authoritative: boolean
  source: string
  dataDate?: string
  records: KisaPhishingRecord[]
}

function isSnapshotDocument(value: unknown): value is KisaSnapshotDocument {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<KisaSnapshotDocument>
  return candidate.kind === 'KISA_PHISHING_SNAPSHOT'
    && typeof candidate.authoritative === 'boolean'
    && typeof candidate.source === 'string'
    && Array.isArray(candidate.records)
}

async function loadBundledKisaVerifier(): Promise<KisaPhishingSnapshotVerifier> {
  try {
    const response = await fetch('./data/kisa-phishing-snapshot.json', { cache: 'no-store' })
    if (!response.ok) return new KisaPhishingSnapshotVerifier([])

    const payload: unknown = await response.json()
    if (!isSnapshotDocument(payload)) return new KisaPhishingSnapshotVerifier([])

    const authoritative = payload.authoritative
      && payload.source === 'data.go.kr/15143094'
      && payload.records.length > 0

    return new KisaPhishingSnapshotVerifier(payload.records, {
      authoritative,
      dataDate: authoritative ? payload.dataDate : undefined,
    })
  } catch {
    return new KisaPhishingSnapshotVerifier([])
  }
}

export class BundledKisaSnapshotVerifier implements OfficialSourceVerifier {
  private verifierPromise?: Promise<KisaPhishingSnapshotVerifier>

  async verify(message: string): Promise<OfficialCheckResult> {
    if (extractHttpUrls(message).length === 0) {
      return new KisaPhishingSnapshotVerifier([]).verify(message)
    }

    this.verifierPromise ??= loadBundledKisaVerifier()
    const verifier = await this.verifierPromise
    return verifier.verify(message)
  }
}
