import { describe, expect, it } from 'vitest'
import { dayKey, getDailyWord } from './daily.js'

const words = ['ALPHA', 'BRAVO', 'CHARM', 'DELTA', 'ECHOS', 'FOXES', 'GOLFS']

describe('getDailyWord', () => {
    it('gives the same word for the same seed and day', () => {
        const day = new Date('2026-01-10T08:00:00Z')
        expect(getDailyWord(words, 42, day)).toBe(getDailyWord(words, 42, new Date('2026-01-10T23:00:00Z')))
    })

    it('does not repeat a word before the list is used up', () => {
        const seen = new Set()
        for (let d = 0; d < words.length; d++) seen.add(getDailyWord(words, 7, new Date(Date.UTC(2026, 0, 1 + d))))
        expect(seen.size).toBe(words.length)
    })

    it('depends on the seed', () => {
        const day = new Date('2026-03-01T00:00:00Z')
        const picks = new Set([1, 2, 3, 4, 5, 6].map((seed) => getDailyWord(words, seed, day)))
        expect(picks.size).toBeGreaterThan(1)
    })
})

describe('dayKey', () => {
    it('is the UTC date', () => {
        expect(dayKey(new Date('2026-05-04T23:59:59Z'))).toBe('2026-05-04')
    })
})
