import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const inputPath = process.argv[2]
const outputDir = resolve(process.argv[3] ?? 'public/data/kisa-phishing')

if (!inputPath) {
  console.error('Usage: node scripts/build-kisa-snapshot.mjs <official-kisa.csv> [output-dir]')
  process.exit(2)
}

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"'
        index += 1
      } else if (char === '"') {
        quoted = false
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      quoted = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''))
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ''))
    rows.push(row)
  }

  return rows
}

function findHeaderIndex(headers, candidates) {
  return headers.findIndex((header) => candidates.includes(header.trim().replace(/^\uFEFF/, '')))
}

function normalizeHttpUrl(raw) {
  try {
    const parsed = new URL(raw.trim())
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    parsed.hash = ''
    parsed.hostname = parsed.hostname.toLowerCase()
    if ((parsed.protocol === 'http:' && parsed.port === '80') || (parsed.protocol === 'https:' && parsed.port === '443')) {
      parsed.port = ''
    }
    const rootlessPath = parsed.pathname === '/' ? '' : parsed.pathname
    return `${parsed.protocol}//${parsed.host}${rootlessPath}${parsed.search}`
  } catch {
    return null
  }
}

function urlBucketKey(normalizedUrl) {
  let hash = 0x811c9dc5
  for (let index = 0; index < normalizedUrl.length; index += 1) {
    hash ^= normalizedUrl.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return (hash & 0xff).toString(16).padStart(2, '0')
}

const csv = await readFile(resolve(inputPath), 'utf8')
const rows = parseCsv(csv)
if (rows.length < 2) throw new Error('CSV has no data rows')

const headers = rows[0]
const dateIndex = findHeaderIndex(headers, ['날짜', 'DATE', '탐지날짜'])
const urlIndex = findHeaderIndex(headers, ['홈페이지주소', 'URL', '피싱사이트 URL'])

if (dateIndex < 0 || urlIndex < 0) {
  throw new Error(`Required columns not found. Headers: ${headers.join(', ')}`)
}

const byUrl = new Map()
for (const row of rows.slice(1)) {
  const detectedDate = (row[dateIndex] ?? '').trim()
  const normalizedUrl = normalizeHttpUrl((row[urlIndex] ?? '').trim())
  if (!normalizedUrl) continue
  byUrl.set(normalizedUrl, { url: normalizedUrl, detectedDate })
}

const records = [...byUrl.values()]
const dataDate = records.reduce((latest, record) => record.detectedDate > latest ? record.detectedDate : latest, '')
const buckets = new Map()

for (const record of records) {
  const key = urlBucketKey(record.url)
  const entries = buckets.get(key) ?? []
  entries.push(record)
  buckets.set(key, entries)
}

await mkdir(outputDir, { recursive: true })

const bucketCounts = {}
for (const [key, bucketRecords] of [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  bucketCounts[key] = bucketRecords.length
  const bucketDocument = {
    kind: 'KISA_PHISHING_BUCKET',
    authoritative: true,
    source: 'data.go.kr/15143094',
    dataDate: dataDate || undefined,
    bucket: key,
    records: bucketRecords,
  }
  await writeFile(resolve(outputDir, `${key}.json`), `${JSON.stringify(bucketDocument)}\n`, 'utf8')
}

const manifest = {
  kind: 'KISA_PHISHING_BUCKET_INDEX',
  authoritative: true,
  source: 'data.go.kr/15143094',
  dataDate: dataDate || undefined,
  generatedAt: new Date().toISOString(),
  bucketCount: 256,
  totalRecords: records.length,
  buckets: bucketCounts,
}

await writeFile(resolve(outputDir, 'manifest.json'), `${JSON.stringify(manifest)}\n`, 'utf8')

const largestBucket = Math.max(0, ...Object.values(bucketCounts))
console.log(`Wrote ${records.length} records across ${Object.keys(bucketCounts).length} buckets to ${outputDir}`)
console.log(`Largest bucket: ${largestBucket} records`)
