import { useEffect, useState } from 'react'
import Game from '../components/game.jsx'
import Countdown from '../components/countdown.jsx'
import { launchRun } from '../game/launch.js'
import { getDailyProgress, saveDailyProgress, todayKey } from '../data/storage.js'
import { fetchDailyCount } from '../data/api.js'
import { DAILY } from '../config.js'
import useLanguage from '../i18n/useLanguage.js'

export default function Daily({ game }) {
    const { lang, t } = useLanguage()
    const { mode, rows, status, ranked, start } = game
    const [failed, setFailed] = useState(false)
    const [ready, setReady] = useState(false)
    const [alreadyDone, setAlreadyDone] = useState(false)
    const [foundCount, setFoundCount] = useState(null)

    useEffect(() => {
        let cancelled = false
        launchRun({ mode: 'daily', lang })
            .then(async (result) => {
                if (cancelled) return
                let { view } = result
                if (!result.ranked) {
                    for (const guess of getDailyProgress(todayKey(), lang)) view = await result.engine.submit(guess)
                }
                if (cancelled) return
                start({ ...result, view })
                setAlreadyDone(view.status !== 'playing')
                setReady(true)
            })
            .catch(() => { if (!cancelled) setFailed(true) })
        return () => { cancelled = true }
    }, [lang, start])

    useEffect(() => {
        if (ready && !ranked) saveDailyProgress(todayKey(), rows.map((row) => row.guess), lang)
    }, [ready, ranked, rows, lang])

    const over = status === 'won' || status === 'lost'

    useEffect(() => {
        const load = () => fetchDailyCount(lang).then(setFoundCount).catch(() => {})
        load()
        const refresh = setInterval(load, DAILY.countRefreshMs)
        const afterResult = over ? setTimeout(load, DAILY.countDelayAfterResultMs) : null
        return () => {
            clearInterval(refresh)
            clearTimeout(afterResult)
        }
    }, [lang, over])

    const running = ready && mode === 'daily' && game.lang === lang

    return (
        <section className="daily flex w-full flex-col items-center gap-6">
        <h2 className="page-title">{t('modes.daily')}</h2>
        {failed && <p className="notice">{t('errors.words')}</p>}
        {foundCount !== null && (
            <p className="border-[3px] border-ink bg-pink px-4 py-1 text-sm font-bold uppercase shadow-hard">
                {t(foundCount === 1 ? 'daily.foundOne' : 'daily.foundMany', { count: foundCount })}
            </p>
        )}
        {running && <Game game={game} saveResult={!alreadyDone} endless={false} />}
        {running && over && <Countdown />}
        </section>
    )
}
