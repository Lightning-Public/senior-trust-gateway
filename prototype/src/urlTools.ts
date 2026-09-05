const HTTP_URL_PATTERN = /https?:\/\/[^\s<>"']+/gi
const TRAILING_PUNCTUATION = /[),.\]}>!?;:]+$/

export function normalizeHttpUrl(raw: string): string | null {
  const cleaned = raw.trim().replace(TRAILING_PUNCTUATION, '')

  try {
    const parsed = new URL(cleaned)
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

export function extractHttpUrls(message: string): string[] {
  const matches = message.match(HTTP_URL_PATTERN) ?? []
  const normalized = matches
    .map(normalizeHttpUrl)
    .filter((url): url is string => Boolean(url))

  return [...new Set(normalized)]
}

export function urlBucketKey(rawUrl: string): string | null {
  const normalized = normalizeHttpUrl(rawUrl)
  if (!normalized) return null

  let hash = 0x811c9dc5
  for (let index = 0; index < normalized.length; index += 1) {
    hash ^= normalized.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }

  // Do not use only the low byte of FNV-1a. Patterned URL strings can make
  // low bits cluster badly. Fold all four bytes so each bucket key depends
  // on the full 32-bit hash while remaining deterministic in browser/build.
  const folded = hash ^ (hash >>> 8) ^ (hash >>> 16) ^ (hash >>> 24)
  return (folded & 0xff).toString(16).padStart(2, '0')
}
