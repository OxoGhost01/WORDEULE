import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import Game from '../components/game.jsx'
import { createDuel, fetchDuel, joinDuel } from '../data/api.js'
import { remoteEngine } from '../game/engines.js'
import useLanguage from '../i18n/useLanguage.js'

const POLL_MS = 5000

function formatDuration(ms) {
    const seconds = Math.round(ms / 1000)
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export default function Duel({ game }) {
    const { code } = useParams()
    return code ? <DuelGame code={code.toUpperCase()} game={game} /> : <DuelHome />
}

function DuelHome() {
    const { lang, t } = useLanguage()
    const navigate = useNavigate()
    const [code, setCode] = useState('')
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    async function create() {
        setBusy(true)
        setError('')
        try {
            const duel = await createDuel(lang)
            navigate(`/duel/${duel.code}`)
        } catch (failure) {
            setError(failure.status === 0 || failure.status >= 500 ? 'duel.offline' : 'duel.error')
        } finally {
            setBusy(false)
        }
    }

    function join(event) {
        event.preventDefault()
        const clean = code.trim().toUpperCase()
        if (clean) navigate(`/duel/${clean}`)
    }

    return (
        <section className="duel flex w-full max-w-md flex-col items-center gap-6">
            <h2 className="page-title">{t('modes.duel')}</h2>
            <p className="text-center">{t('duel.intro')}</p>
            <button className="btn" onClick={create} disabled={busy}>{t('duel.create')}</button>
            <form className="flex w-full flex-col gap-3 border-[3px] border-ink bg-card p-5 shadow-hard" onSubmit={join}>
                <label className="text-sm font-bold uppercase" htmlFor="duel-code">{t('duel.codeLabel')}</label>
                <input id="duel-code" className="field uppercase" maxLength={6} value={code} onChange={(event) => setCode(event.target.value)} />
                <button className="btn bg-card" type="submit" disabled={!code.trim()}>{t('duel.join')}</button>
            </form>
            {error && <p className="notice">{t(error)}</p>}
        </section>
    )
}

function DuelGame({ code, game }) {
    const { t } = useLanguage()
    const { start, status, mode } = game
    const [failure, setFailure] = useState('')
    const [ready, setReady] = useState(false)
    const [alreadyDone, setAlreadyDone] = useState(false)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        let cancelled = false
        joinDuel(code)
            .then((view) => {
                if (cancelled) return
                start({ view, engine: remoteEngine(view.runId), ranked: true, notice: null })
                setAlreadyDone(view.status !== 'playing')
                setReady(true)
            })
            .catch((error) => {
                if (cancelled) return
                const known = { 404: 'duel.notFound', 410: 'duel.expired', 403: 'duel.full' }
                setFailure(known[error.status] ?? (error.status === 0 ? 'duel.offline' : 'duel.error'))
            })
        return () => { cancelled = true }
    }, [code, start])

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/duel/${code}`)
            setCopied(true)
        } catch {
            setCopied(false)
        }
    }

    const running = ready && mode === 'duel'
    const over = status === 'won' || status === 'lost'

    return (
        <section className="duel flex w-full flex-col items-center gap-6">
            <h2 className="page-title">{t('modes.duel')}</h2>
            {failure && <p className="notice">{t(failure)}</p>}
            {running && (
                <div className="flex flex-col items-center gap-2 border-[3px] border-ink bg-card px-5 py-3 shadow-hard">
                    <span className="text-xs font-bold uppercase">{t('duel.invite')}</span>
                    <strong className="font-display text-4xl font-extrabold tracking-widest">{code}</strong>
                    <button className="btn bg-card" onClick={copyLink}>{copied ? t('duel.copied') : t('duel.copyLink')}</button>
                </div>
            )}
            {running && <Game game={game} saveResult={!alreadyDone} endless={false} />}
            {running && over && <DuelResult code={code} />}
        </section>
    )
}

function DuelResult({ code }) {
    const { t } = useLanguage()
    const [duel, setDuel] = useState(null)
    const finished = Boolean(duel?.winner)

    useEffect(() => {
        let cancelled = false
        const load = () => fetchDuel(code).then((data) => { if (!cancelled) setDuel(data) }).catch(() => {})
        load()
        if (finished) return () => { cancelled = true }
        const timer = setInterval(load, POLL_MS)
        return () => {
            cancelled = true
            clearInterval(timer)
        }
    }, [code, finished])

    if (!duel) return <p className="notice">{t('leaderboard.loading')}</p>

    return (
        <div className="flex w-full max-w-md flex-col items-center gap-4">
            {duel.winner && <p className="stamp border-cobalt text-cobalt">{duel.winner === 'draw' ? t('duel.draw') : t('duel.winner', { name: duel.winner })}</p>}
            <ul className="flex w-full flex-col gap-3">
                {duel.players.map((player) => (
                    <li key={player.username} className={`flex items-center gap-3 border-[3px] border-ink p-3 ${player.me ? 'bg-sun' : 'bg-card'}`}>
                        <span className="flex-1 font-bold">{player.username}{player.me ? ` (${t('duel.you')})` : ''}</span>
                        {player.tries !== undefined
                            ? <span className="text-sm tabular-nums">{t(`outcome.${player.outcome}`)} · {t('leaderboard.tries', { count: player.tries })} · {formatDuration(player.ms)}</span>
                            : <span className="text-sm">{player.finished ? t('duel.finished') : t('duel.playing')}</span>}
                    </li>
                ))}
            </ul>
            {duel.players.length < 2 && <p className="notice">{t('duel.waiting')}</p>}
        </div>
    )
}
