import { KisaPhishingSnapshotVerifier, type KisaPhishingRecord } from './officialVerification'
import type { OfficialCheckResult, OfficialSourceVerifier } from './types'
import { extractHttpUrls, urlBucketKey } from './urlTools'

type KisaBucketManifest = {
  kind: 'KISA_PHISHING_BUCKET_INDEX'
  authoritative: boolean
  source: string
  dataDate?: string
  bucketCount: number
  totalRecords: number
  buckets: Record<string, number>
}

type KisaBucketDocument = {
  kind: 'KISA_PHISHING_BUCKET'
  authoritative: boolean
  source: string
  dataDate?: string
  bucket: string
  records: KisaPhishingRecord[]
}

function isBucketManifest(value: unknown): value is KisaBucketManifest {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<KisaBucketManifest>
  return candidate.kind === 'KISA_PHISHING_BUCKET_INDEX'
    && typeof candidate.authoritative === 'boolean'
    && typeof candidate.source === 'string'
    && candidate.bucketCount === 256
    && typeof candidate.totalRecords === 'number'
    && Boolean(candidate.buckets)
    && typeof candidate.buckets === 'object'
}

function isBucketDocument(value: unknown, expectedBucket: string, manifest: KisaBucketManifest): value is KisaBucketDocument {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<KisaBucketDocument>
  return candidate.kind === 'KISA_PHISHING_BUCKET'
    && candidate.authoritative === true
    && candidate.source === manifest.source
    && candidate.dataDate === manifest.dataDate
    && candidate.bucket === expectedBucket
    && Array.isArray(candidate.records)
}

async function loadManifest(): Promise<KisaBucketManifest | null> {
  try {
    const response = await fetch('./data/kisa-phishing/manifest.json', { cache: 'no-store' })
    if (!response.ok) return null

    const payload: unknown = await response.json()
    if (!isBucketManifest(payload)) return null
    return payload
  } catch {
    return null
  }
}

export class BundledKisaSnapshotVerifier implements OfficialSourceVerifier {
  private manifestPromise?: Promise<KisaBucketManifest | null>
  private readonly bucketPromises = new Map<string, Promise<KisaPhishingRecord[] | null>>()

  private async loadBucket(bucket: string, manifest: KisaBucketManifest): Promise<KisaPhishingRecord[] | null> {
    const existing = this.bucketPromises.get(bucket)
    if (existing) return existing

    const promise = (async () => {
      try {
        const response = await fetch(`./data/kisa-phishing/${bucket}.json`, { cache: 'no-store' })
        if (!response.ok) return null

        const payload: unknown = await response.json()
        if (!isBucketDocument(payload, bucket, manifest)) return null
        return payload.records
      } catch {
        return null
      }
    })()

    this.bucketPromises.set(bucket, promise)
    return promise
  }

  async verify(message: string): Promise<OfficialCheckResult> {
    const checkedUrls = extractHttpUrls(message)
    if (checkedUrls.length === 0) {
      return new KisaPhishingSnapshotVerifier([]).verify(message)
    }

    this.manifestPromise ??= loadManifest()
    const manifest = await this.manifestPromise

    const manifestIsAuthoritative = Boolean(
      manifest
      && manifest.authoritative
      && manifest.source === 'data.go.kr/15143094'
      && manifest.totalRecords > 0,
    )

    if (!manifest || !manifestIsAuthoritative) {
      return new KisaPhishingSnapshotVerifier([], {
        dataDate: manifest?.dataDate,
        available: false,
      }).verify(message)
    }

    const bucketKeys = [...new Set(
      checkedUrls
        .map(urlBucketKey)
        .filter((bucket): bucket is string => Boolean(bucket)),
    )]

    const records: KisaPhishingRecord[] = []
    let allRequestedBucketsAvailable = true

    for (const bucket of bucketKeys) {
      if ((manifest.buckets[bucket] ?? 0) === 0) continue

      const bucketRecords = await this.loadBucket(bucket, manifest)
      if (!bucketRecords) {
        allRequestedBucketsAvailable = false
        continue
      }
      records.push(...bucketRecords)
    }

    return new KisaPhishingSnapshotVerifier(records, {
      authoritative: true,
      dataDate: manifest.dataDate,
      available: allRequestedBucketsAvailable,
    }).verify(message)
  }
}
