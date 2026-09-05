import { describe, expect, it } from 'vitest'
import { urlBucketKey } from '../src/urlTools'

const OFFICIAL_ROW_COUNT = 131_752
const BUCKET_COUNT = 256

function syntheticMaxLengthUrl(index: number): string {
  const base = `https://p${index.toString().padStart(6, '0')}.example.invalid/path/${index.toString().padStart(6, '0')}`
  return `${base}${'x'.repeat(Math.max(0, 50 - base.length))}`.slice(0, 50)
}

describe('KISA bucket distribution scale guard', () => {
  it('keeps patterned 131,752-row URL input reasonably balanced', () => {
    const counts = Array.from({ length: BUCKET_COUNT }, () => 0)

    for (let index = 0; index < OFFICIAL_ROW_COUNT; index += 1) {
      const bucket = urlBucketKey(syntheticMaxLengthUrl(index))
      expect(bucket).not.toBeNull()
      counts[Number.parseInt(bucket!, 16)] += 1
    }

    const largest = Math.max(...counts)
    const smallest = Math.min(...counts)
    const average = OFFICIAL_ROW_COUNT / BUCKET_COUNT

    // This is a regression guard for deterministic patterned URLs, not a
    // statistical claim about the real KISA dataset. The previous low-byte
    // FNV bucket selector produced a 4,616-record bucket on this fixture.
    expect(largest).toBeLessThan(700)
    expect(smallest).toBeGreaterThan(350)
    expect(largest / average).toBeLessThan(1.4)
  })
})
