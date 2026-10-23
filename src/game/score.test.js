import { describe, expect, it } from 'vitest'
import roundScore, { scoreMultiplier } from './score.js'

describe('score', () => {
    it('gives more points for fewer tries', () => {
        expect(roundScore(1, 6)).toBe(600)
        expect(roundScore(6, 6)).toBe(100)
    })

    it('applies the multiplier', () => {
        expect(roundScore(3, 6, 1.5)).toBe(600)
    })

    it('rewards the difficulty', () => {
        expect(scoreMultiplier('classic', 5, 1)).toBe(1)
        expect(scoreMultiplier('custom', 6, 1)).toBe(1.5)
        expect(scoreMultiplier('custom', 7, 1)).toBe(2)
        expect(scoreMultiplier('locked', 5, 1)).toBe(1.5)
        expect(scoreMultiplier('hardcore', 5, 4)).toBe(4)
    })
})
