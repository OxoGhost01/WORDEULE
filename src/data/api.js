// Global leaderboard: talks to the server in /server (through /api, see vite.config.js and docker/nginx.conf)

import { API_URL, LEADERBOARD_MODES } from '../config.js'

// Sends a score with the number of tries of the word; the server only keeps the best of each
// player. A failure is not a problem: the game goes on.
export function sendScore({ username, mode, score, tries }) {
    if (!LEADERBOARD_MODES.includes(mode) || score <= 0) return
    fetch(`${API_URL}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, mode, score, tries }),
    }).catch(() => {})
}

// The best players of a mode: [{ username, score, tries, playedAt }, ...]
// (for the daily mode: only the players of today's word)
export async function fetchLeaderboard(mode) {
    const response = await fetch(`${API_URL}/scores/${mode}`)
    if (!response.ok) throw new Error('Could not load the leaderboard')
    return response.json()
}

// Number of players who found today's daily word
export async function fetchDailyCount() {
    const response = await fetch(`${API_URL}/daily/count`)
    if (!response.ok) throw new Error('Could not load the counter')
    return (await response.json()).count
}
