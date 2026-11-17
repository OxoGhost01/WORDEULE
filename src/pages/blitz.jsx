import { useCallback, useEffect } from 'react'
import Game from '../components/game.jsx'
import Timer from '../components/timer.jsx'
import useLauncher from '../game/useLauncher.js'
import useLanguage from '../i18n/useLanguage.js'

const NEXT_DELAY_MS = { won: 1200, lost: 2600 }

export default function Blitz({ game }) {
    const { t } = useLanguage()
    const { launch, next, failed, running } = useLauncher('blitz', game)
    const { status, deadline, clockOffset, apply } = game

    const timeUp = useCallback(() => apply({ status: 'over' }), [apply])

    useEffect(() => {
        if (!running || !NEXT_DELAY_MS[status]) return
        const timer = setTimeout(next, NEXT_DELAY_MS[status])
        return () => clearTimeout(timer)
    }, [running, status, next])

    return (
        <section className="blitz flex w-full flex-col items-center gap-6">
            <h2 className="page-title">{t('modes.blitz')}</h2>
            {failed && <p className="notice">{t('errors.words')}</p>}
            {running && status !== 'over' && deadline && <Timer key={game.number} deadline={deadline} offset={clockOffset} onEnd={timeUp} />}
            {running && <p className="text-sm font-bold uppercase">{t('blitz.words', { count: game.words })}</p>}
            {running && <Game game={game} onRestart={status === 'over' ? launch : undefined} />}
        </section>
    )
}
