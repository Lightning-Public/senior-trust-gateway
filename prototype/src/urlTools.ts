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
