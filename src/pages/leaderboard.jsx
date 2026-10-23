import { useEffect, useState } from 'react'
import Tabs from '../components/tabs.jsx'
import { getScores, getUsername, todayKey } from '../data/storage.js'
import { fetchLeaderboard } from '../data/api.js'
import { LEADERBOARD_MODES } from '../config.js'

// One tab per mode of the global leaderboard, plus the games played on this device
const TABS = [
    ...LEADERBOARD_MODES.map((mode) => ({ id: mode, label: mode })),
    { id: 'mine', label: 'On this device' },
]

export default function Leaderboard() {
    const [tab, setTab] = useState(LEADERBOARD_MODES[0])
    const [boards, setBoards] = useState({}) // mode -> list of players, or an error message

    // load the leaderboard of the open tab once
    useEffect(() => {
        if (tab === 'mine' || boards[tab]) return
        let cancelled = false
        fetchLeaderboard(tab)
            .then((players) => { if (!cancelled) setBoards((b) => ({ ...b, [tab]: players })) })
            .catch((e) => { if (!cancelled) setBoards((b) => ({ ...b, [tab]: e.message })) })
        return () => { cancelled = true }
    }, [tab, boards])

    return (
        <section className="leaderboard flex w-full max-w-2xl flex-col items-center gap-6">
            <h2 className="page-title">Leaderboard</h2>
            <Tabs tabs={TABS} active={tab} onChange={setTab} />
            {tab === 'daily' && <p className="text-sm font-bold uppercase">Word of {todayKey()}</p>}
            {tab === 'mine' ? <LocalScores /> : <Board key={tab} players={boards[tab]} />}
        </section>
    )
}

// The best players of a mode (players is undefined while loading, or a string if it failed)
function Board({ players }) {
    const me = getUsername()

    if (players === undefined) return <p className="notice">Loading...</p>
    if (typeof players === 'string') return <p className="notice">{players}</p>
    if (players.length === 0) return <p className="notice">Nobody here yet, be the first !</p>

    return (
        <ol className="flex w-full flex-col gap-3">
            {players.map((player, index) => (
                <li
                    key={player.username}
                    className={`flex items-center gap-3 border-[3px] border-ink p-3 ${player.username === me ? 'bg-sun' : 'bg-card'}`}
                >
                    <span className="w-10 font-display text-3xl font-extrabold">{index + 1}</span>
                    <span className="flex flex-1 flex-col">
                        <span className="font-bold">{player.username}</span>
                        <span className="text-xs">{player.tries ? `${player.tries} tries · ` : ''}{new Date(player.playedAt).toLocaleDateString()}</span>
                    </span>
                    <strong className="min-w-[4ch] text-right font-display text-3xl font-extrabold">{player.score}</strong>
                </li>
            ))}
        </ol>
    )
}

// Every word played on this device, newest first
function LocalScores() {
    const scores = getScores().sort((first, second) => second.playedAt.localeCompare(first.playedAt))

    if (scores.length === 0) return <p className="notice">No completed games yet.</p>

    return (
        <ol className="flex w-full flex-col gap-4">
            {scores.map((result, index) => (
                <li
                    key={`${result.playedAt}-${index}`}
                    className="flex items-center gap-4 border-[3px] border-dashed border-ink bg-card p-3"
                >
                    <strong className="min-w-[4ch] font-display text-4xl font-extrabold">{result.score}</strong>
                    <span className="flex flex-1 flex-col">
                        <span className="font-bold">{result.username}</span>
                        <time className="text-xs" dateTime={result.playedAt}>{new Date(result.playedAt).toLocaleDateString()}</time>
                    </span>
                    <span className="text-xs tabular-nums">{result.tries ? `${result.tries} tries` : ''}</span>
                    <span className="border-2 border-ink bg-sun px-2 py-0.5 text-xs font-bold uppercase">{result.mode}</span>
                    <span className="text-xs font-bold uppercase">{result.outcome}</span>
                </li>
            ))}
        </ol>
    )
}
