// Global leaderboard: talks to the server in /server (through /api, see vite.config.js and docker/nginx.conf)

// Modes of the leaderboard (custom is not in it: its difficulty changes, so scores can't be compared)
export const LEADERBOARD_MODES = ['daily', 'classic', 'hardcore', 'locked']

// Sends a score; the server only keeps the best of each player. A failure is not a problem: the game goes on.
export function sendScore({ username, mode, score }) {
    if (!LEADERBOARD_MODES.includes(mode) || score <= 0) return
    fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, mode, score }),
    }).catch(() => {})
}

// The best players of a mode: [{ username, score, playedAt }, ...]
export async function fetchLeaderboard(mode) {
    const response = await fetch(`/api/scores/${mode}`)
    if (!response.ok) throw new Error('Could not load the leaderboard')
    return response.json()
}
