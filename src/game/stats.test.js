import { describe, expect, it } from 'vitest'
import computeStats, { dailyCalendar, dailyStreaks, letterCounts } from './stats.js'

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

describe('averageTries', () => {
    it('averages the tries of the won words', () => {
        expect(computeStats(results, 'classic').averageTries).toBe(2.5)
    })

    it('is null without a win', () => {
        expect(computeStats([], 'classic').averageTries).toBeNull()
    })
})

describe('dailyStreaks', () => {
    const won = (day) => ({ mode: 'daily', outcome: 'won', playedAt: `${day}T10:00:00Z` })
    const scores = [won('2026-03-01'), won('2026-03-02'), won('2026-03-03'), won('2026-03-06'), won('2026-03-07')]

    it('counts the days in a row, now and at best', () => {
        expect(dailyStreaks(scores, '2026-03-07')).toMatchObject({ current: 2, best: 3 })
    })

    it('keeps the streak alive until the end of the next day', () => {
        expect(dailyStreaks(scores, '2026-03-08').current).toBe(2)
        expect(dailyStreaks(scores, '2026-03-09').current).toBe(0)
    })

    it('ignores lost days and other modes', () => {
        const mixed = [won('2026-03-01'), { mode: 'daily', outcome: 'lost', playedAt: '2026-03-02T10:00:00Z' }, { mode: 'classic', outcome: 'won', playedAt: '2026-03-02T10:00:00Z' }]
        expect(dailyStreaks(mixed, '2026-03-02')).toMatchObject({ current: 1, best: 1 })
    })
})

describe('letterCounts', () => {
    it('counts the letters played in a mode', () => {
        const counts = letterCounts([{ mode: 'classic', guesses: ['CRANE', 'SLATE'] }, { mode: 'daily', guesses: ['ZZZZZ'] }, { mode: 'classic' }], 'classic')
        expect(counts.E).toBe(2)
        expect(counts.A).toBe(2)
        expect(counts.Z).toBeUndefined()
    })
})

describe('dailyCalendar', () => {
    it('lists five weeks ending with the week of today, Monday first', () => {
        const days = dailyCalendar([{ mode: 'daily', outcome: 'won', playedAt: '2026-03-04T10:00:00Z' }], '2026-03-04')
        expect(days).toHaveLength(35)
        expect(new Date(days[0].day).getUTCDay()).toBe(1)
        expect(days.find((d) => d.day === '2026-03-04')).toMatchObject({ outcome: 'won', future: false })
        expect(days.at(-1).future).toBe(true)
    })
})
