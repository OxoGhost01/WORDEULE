import { useCallback, useEffect, useState } from 'react'
import { launchRun } from './launch.js'
import useLanguage from '../i18n/useLanguage.js'

export default function useLauncher(mode, game) {
    const { lang } = useLanguage()
    const { start, engine, apply, setGuess } = game
    const [failed, setFailed] = useState(false)

    const launch = useCallback(async (cancelled = () => false) => {
        try {
            const result = await launchRun({ mode, lang })
            if (cancelled()) return
            start(result)
            setFailed(false)
        } catch {
            if (!cancelled()) setFailed(true)
        }
    }, [mode, lang, start])

    const next = useCallback(async () => {
        try {
            apply(await engine.next())
            setGuess('')
        } catch {
            setFailed(true)
        }
    }, [engine, apply, setGuess])

    useEffect(() => {
        let cancelled = false
        Promise.resolve().then(() => launch(() => cancelled))
        return () => { cancelled = true }
    }, [launch])

    return { launch: () => launch(), next, failed, running: game.mode === mode && game.lang === lang }
}
