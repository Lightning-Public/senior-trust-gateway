import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const inputPath = process.argv[2]
const outputPath = resolve(process.argv[3] ?? 'public/data/kisa-phishing-snapshot.json')

if (!inputPath) {
  console.error('Usage: node scripts/build-kisa-snapshot.mjs <official-kisa.csv> [output.json]')
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
  const url = (row[urlIndex] ?? '').trim()
  if (!url) continue
  if (!/^https?:\/\//i.test(url)) continue
  byUrl.set(url, { url, detectedDate })
}

const records = [...byUrl.values()]
const dataDate = records.reduce((latest, record) => record.detectedDate > latest ? record.detectedDate : latest, '')

const snapshot = {
  kind: 'KISA_PHISHING_SNAPSHOT',
  authoritative: true,
  source: 'data.go.kr/15143094',
  dataDate: dataDate || undefined,
  generatedAt: new Date().toISOString(),
  records,
}

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(snapshot)}\n`, 'utf8')
console.log(`Wrote ${records.length} records to ${outputPath}`)
