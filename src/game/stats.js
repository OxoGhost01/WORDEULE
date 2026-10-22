// Stats of one mode from the saved results (one result per word played)
export default function computeStats(scores, mode) {
    const games = scores
        .filter((result) => result.mode === mode)
        .sort((a, b) => a.playedAt.localeCompare(b.playedAt))

    let wins = 0
    let streak = 0
    let bestStreak = 0
    let bestScore = 0
    for (const game of games) {
        if (game.outcome === 'won') {
            wins++
            streak++
            bestStreak = Math.max(bestStreak, streak)
        } else {
            streak = 0
        }
        bestScore = Math.max(bestScore, game.score)
    }

    return {
        played: games.length,
        wins,
        winRate: games.length ? Math.round((wins / games.length) * 100) : 0,
        streak,
        bestStreak,
        bestScore,
    }
}
