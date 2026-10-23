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
    }
}
