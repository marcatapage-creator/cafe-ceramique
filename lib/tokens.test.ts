import { describe, it, expect } from 'vitest'
import { generateCeramicToken } from './tokens'

describe('generateCeramicToken', () => {
  it('formats single-digit month and day with leading zeros', () => {
    const d = new Date(2026, 0, 5) // Jan 5
    expect(generateCeramicToken(d, 1, 1)).toBe('CER-0105-T01-001')
  })

  it('formats double-digit values without extra padding', () => {
    const d = new Date(2026, 11, 25) // Dec 25
    expect(generateCeramicToken(d, 15, 42)).toBe('CER-1225-T15-042')
  })

  it('pads increment to 3 digits', () => {
    const d = new Date(2026, 5, 6) // Jun 6
    expect(generateCeramicToken(d, 3, 7)).toBe('CER-0606-T03-007')
  })

  it('handles increment >= 100', () => {
    const d = new Date(2026, 5, 6)
    expect(generateCeramicToken(d, 1, 100)).toBe('CER-0606-T01-100')
  })

  it('produces the canonical format CER-MMDD-T00-XXX', () => {
    const token = generateCeramicToken(new Date(2026, 5, 6), 7, 1)
    expect(token).toMatch(/^CER-\d{4}-T\d{2}-\d{3}$/)
  })
})
