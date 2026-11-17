import { useEffect, useState } from 'react'
import Tabs from '../components/tabs.jsx'
import { getScores, getUsername, todayKey } from '../data/storage.js'
import { fetchLeaderboard } from '../data/api.js'
import { LEADERBOARD_MODES } from '../config.js'
import useLanguage from '../i18n/useLanguage.js'

export default function Leaderboard() {
    const { lang, t } = useLanguage()
    const [tab, setTab] = useState(LEADERBOARD_MODES[0])
    const [boards, setBoards] = useState({}) // "language/mode" -> list of players, or 'error'

    // one tab per mode of the global leaderboard, plus the games played on this device
    const tabs = [
        ...LEADERBOARD_MODES.map((mode) => ({ id: mode, label: t(`modes.${mode}`) })),
        { id: 'mine', label: t('leaderboard.mine') },
    ]

    // the leaderboards of two languages are never mixed
    const board = boards[`${lang}/${tab}`]

    // load the leaderboard of the open tab, in the current language, once
    useEffect(() => {
        if (tab === 'mine' || board) return
        let cancelled = false
        fetchLeaderboard(lang, tab)
            .then((players) => { if (!cancelled) setBoards((b) => ({ ...b, [`${lang}/${tab}`]: players })) })
            .catch(() => { if (!cancelled) setBoards((b) => ({ ...b, [`${lang}/${tab}`]: 'error' })) })
        return () => { cancelled = true }
    }, [lang, tab, board])

    return (
        <section className="leaderboard flex w-full max-w-2xl flex-col items-center gap-6">
            <h2 className="page-title">{t('pages.leaderboard')}</h2>
            <Tabs tabs={tabs} active={tab} onChange={setTab} />
            {tab === 'daily' && <p className="text-sm font-bold uppercase">{t('leaderboard.today', { date: todayKey() })}</p>}
            {tab === 'mine' ? <LocalScores /> : <Board key={`${lang}/${tab}`} players={board} mode={tab} />}
        </section>
    )
}

// What made a score: the daily mode is one word, so its tries; in an endless mode the score is a run of
// several words, so the number of words found (results saved before that have nothing to show)
function detail(t, mode, result) {
    if (mode === 'daily') return result.tries ? t('leaderboard.tries', { count: result.tries }) : ''
    if (result.words === undefined || result.words === null) return ''
    return t(result.words === 1 ? 'leaderboard.word' : 'leaderboard.words', { count: result.words })
}

// The best players of a mode (players is undefined while loading, or 'error' if it failed)
function Board({ players, mode }) {
    const { t } = useLanguage()
    const me = getUsername()

    if (players === undefined) return <p className="notice">{t('leaderboard.loading')}</p>
    if (players === 'error') return <p className="notice">{t('leaderboard.error')}</p>
    if (players.length === 0) return <p className="notice">{t('leaderboard.empty')}</p>

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
                        <span className="text-xs">{detail(t, mode, player) ? `${detail(t, mode, player)} · ` : ''}{new Date(player.playedAt).toLocaleDateString()}</span>
                    </span>
                    <strong className="min-w-[4ch] text-right font-display text-3xl font-extrabold">{player.score}</strong>
                </li>
            ))}
        </ol>
    )
}

// Every word played on this device in the current language, newest first
function LocalScores() {
    const { lang, t } = useLanguage()
    const scores = getScores(lang).sort((first, second) => second.playedAt.localeCompare(first.playedAt))

    if (scores.length === 0) return <p className="notice">{t('leaderboard.none')}</p>

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
                    <span className="text-xs tabular-nums">{detail(t, result.mode, result)}</span>
                    <span className="border-2 border-ink bg-sun px-2 py-0.5 text-xs font-bold uppercase">{t(`modes.${result.mode}`)}</span>
                    <span className="text-xs font-bold uppercase">{t(`outcome.${result.outcome}`)}</span>
                </li>
            ))}
        </ol>
    )
}
