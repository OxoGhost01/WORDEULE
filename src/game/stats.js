import { DEFAULT_MAX_TRIES, SCORE } from '../config.js'

// Stats of one mode from the saved results (one result per word played).
// In an endless mode (classic...) the score of a result is the total of the run so far, so the points of
// a won word are the score minus the score of the previous word of the same run.
// maxTries: number of tries of the mode. endless: false for a mode where every result is a separate game (daily).
export default function computeStats(scores, mode, maxTries = DEFAULT_MAX_TRIES, endless = true) {
    const games = scores
        .filter((result) => result.mode === mode)
        .sort((a, b) => a.playedAt.localeCompare(b.playedAt))

    let wins = 0
    let streak = 0
    let bestStreak = 0
    let totalPoints = 0
    let triesSum = 0
    let triesCount = 0
    const distribution = Array(maxTries).fill(0) // distribution[0]: wins in 1 try, [1]: in 2 tries...

    let previous = null
    for (const game of games) {
        if (game.outcome === 'won') {
            wins++
            streak++
            bestStreak = Math.max(bestStreak, streak)

            const points = game.score - (endless && previous?.outcome === 'won' ? previous.score : 0)
            totalPoints += points

            // results saved before the number of tries was stored: it can be found back from the points
            // (not possible in custom, where the number of tries changes)
            const tries = game.tries ?? (mode === 'custom' ? undefined : maxTries + 1 - points / SCORE.pointsPerTry)
            if (distribution[tries - 1] !== undefined) distribution[tries - 1]++
            if (Number.isFinite(tries)) {
                triesSum += tries
                triesCount++
            }
        } else {
            streak = 0
        }
        previous = game
    }

    return {
        played: games.length,
        wins,
        winRate: games.length ? Math.round((wins / games.length) * 100) : 0,
        streak,
        bestStreak,
        totalPoints,
        distribution,
        averageTries: triesCount ? Math.round((triesSum / triesCount) * 10) / 10 : null,
    }
}

const DAY_MS = 86400000
const daysBetween = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS)

export function dailyStreaks(scores, today) {
    const days = [...new Set(scores
        .filter((result) => result.mode === 'daily' && result.outcome === 'won')
        .map((result) => result.playedAt.slice(0, 10)))].sort()

    let best = 0
    let run = 0
    let previous = null
    for (const day of days) {
        run = previous && daysBetween(previous, day) === 1 ? run + 1 : 1
        best = Math.max(best, run)
        previous = day
    }

    const current = previous && daysBetween(previous, today) <= 1 ? run : 0
    return { current, best, days }
}

export function letterCounts(scores, mode) {
    const counts = {}
    for (const result of scores) {
        if (result.mode !== mode || !Array.isArray(result.guesses)) continue
        for (const guess of result.guesses) {
            for (const letter of guess) counts[letter] = (counts[letter] ?? 0) + 1
        }
    }
    return counts
}

export function dailyCalendar(scores, today, weeks = 5) {
    const outcomes = new Map()
    for (const result of scores) {
        if (result.mode !== 'daily') continue
        const day = result.playedAt.slice(0, 10)
        if (outcomes.get(day) !== 'won') outcomes.set(day, result.outcome)
    }

    const todayMs = Date.parse(today)
    const sinceMonday = (new Date(todayMs).getUTCDay() + 6) % 7
    const first = todayMs - (sinceMonday + (weeks - 1) * 7) * DAY_MS

    return Array.from({ length: weeks * 7 }, (_, i) => {
        const day = new Date(first + i * DAY_MS).toISOString().slice(0, 10)
        return { day, outcome: outcomes.get(day) ?? null, future: day > today }
    })
}
