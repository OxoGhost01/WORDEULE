import { describe, expect, it } from 'vitest'
import computeStats from './stats.js'

// a run of 3 words: won in 2 tries (500 points), won in 3 tries (+400), then lost
const results = [
    { mode: 'classic', outcome: 'won', score: 500, tries: 2, playedAt: '2026-01-01T10:00:00Z' },
    { mode: 'classic', outcome: 'won', score: 900, tries: 3, playedAt: '2026-01-01T10:05:00Z' },
    { mode: 'classic', outcome: 'lost', score: 900, tries: 6, playedAt: '2026-01-01T10:10:00Z' },
    { mode: 'daily', outcome: 'won', score: 600, tries: 1, playedAt: '2026-01-01T11:00:00Z' },
]

describe('computeStats', () => {
    it('counts the games, the victories and the streaks of one mode', () => {
        const stats = computeStats(results, 'classic')
        expect(stats.played).toBe(3)
        expect(stats.wins).toBe(2)
        expect(stats.winRate).toBe(67)
        expect(stats.streak).toBe(0)
        expect(stats.bestStreak).toBe(2)
    })

    it('adds the points of the won words, not the running scores', () => {
        expect(computeStats(results, 'classic').totalPoints).toBe(900)
    })

    it('spreads the victories by number of tries', () => {
        expect(computeStats(results, 'classic').distribution).toEqual([0, 1, 1, 0, 0, 0])
    })

    // every daily result is a separate game: no running total to subtract
    it('does not subtract the previous score in a mode that is not endless', () => {
        const daily = [
            { mode: 'daily', outcome: 'won', score: 600, tries: 1, playedAt: '2026-01-01T09:00:00Z' },
            { mode: 'daily', outcome: 'won', score: 500, tries: 2, playedAt: '2026-01-02T09:00:00Z' },
        ]
        expect(computeStats(daily, 'daily', 6, false).totalPoints).toBe(1100)
    })
})
