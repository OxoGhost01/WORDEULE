import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import Game from '../components/game.jsx'
import { loadWordLists, randomWords } from '../game/words.js'
import { getSettings, saveSettings } from '../data/storage.js'
import { CUSTOM } from '../config.js'
import useLanguage from '../i18n/useLanguage.js'

export default function Custom({ game }) {
    const { lang, t } = useLanguage()
    const { mode, answers, start } = game
    const navigate = useNavigate()

    // the length is part of the address of the game: /custom/7 is a game with 7 letters, /custom is the settings form
    const { length } = useParams()
    const urlLength = Number.isInteger(Number(length)) && length >= CUSTOM.minLength && length <= CUSTOM.maxLength ? Number(length) : null

    // settings: the address first for the length, otherwise what was saved on the last visit
    const [wordLength, setWordLength] = useState(() => urlLength ?? getSettings().wordLength)
    const [maxTries, setMaxTries] = useState(() => getSettings().maxTries)
    const [wordCount, setWordCount] = useState(() => getSettings().wordCount)
    const [failed, setFailed] = useState(false) // the words could not be loaded

    // all the settings must be whole numbers in the allowed range
    const inRange = (n, min, max) => Number.isInteger(n) && n >= min && n <= max
    const valid = inRange(wordLength, CUSTOM.minLength, CUSTOM.maxLength)
        && inRange(maxTries, CUSTOM.minTries, CUSTOM.maxTries)
        && inRange(wordCount, CUSTOM.minGrids, CUSTOM.maxGrids)

    // a game with the length of the address, in the current language, is running
    const gameLoaded = urlLength !== null && mode === 'custom' && game.lang === lang && answers[0]?.length === urlLength

    // start a game with the chosen settings (keepScore: a win goes on with the same score)
    async function launch(keepScore = false) {
        try {
            const { words, pool, display } = await loadWordLists(wordLength, lang)
            start({ mode: 'custom', words, display, answers: randomWords(pool, wordCount), maxTries, keepScore })
            saveSettings({ wordLength, maxTries, wordCount })
            setFailed(false)
            if (urlLength !== wordLength) navigate(`/custom/${wordLength}`)
        } catch {
            setFailed(true)
        }
    }

    // opening the address of a game (a link, a refresh) starts it with the saved settings
    useEffect(() => {
        if (urlLength === null || gameLoaded) return
        let cancelled = false
        loadWordLists(urlLength, lang)
            .then(({ words, pool, display }) => {
                if (!cancelled) start({ mode: 'custom', words, display, answers: randomWords(pool, wordCount), maxTries })
            })
            .catch(() => { if (!cancelled) setFailed(true) })
        return () => { cancelled = true }
    }, [urlLength, gameLoaded, lang, start, wordCount, maxTries])

    // infinite mode like classic: a win keeps the score and gives a new word, a loss starts over from 0
    return (
        <section className="custom flex w-full flex-col items-center gap-6">
        <h2 className="page-title">{t('modes.custom')}</h2>
        {urlLength === null && (
            <form className="flex w-full max-w-md flex-col gap-5 border-[3px] border-ink bg-card p-6 shadow-hard-lg" onSubmit={(e) => { e.preventDefault(); launch() }}>
                <label className="flex flex-col gap-1 text-sm font-bold uppercase">
                    {t('custom.length')}
                    <input className="field" type="number" min={CUSTOM.minLength} max={CUSTOM.maxLength} value={wordLength} onChange={(e) => setWordLength(Number(e.target.value))} />
                </label>
                <label className="flex flex-col gap-1 text-sm font-bold uppercase">
                    {t('custom.tries')}
                    <input className="field" type="number" min={CUSTOM.minTries} max={CUSTOM.maxTries} value={maxTries} onChange={(e) => setMaxTries(Number(e.target.value))} />
                </label>
                <label className="flex flex-col gap-1 text-sm font-bold uppercase">
                    {t('custom.grids')}
                    <input className="field" type="number" min={CUSTOM.minGrids} max={CUSTOM.maxGrids} value={wordCount} onChange={(e) => setWordCount(Number(e.target.value))} />
                </label>
                <button className="btn" type="submit" disabled={!valid}>{t('custom.start')}</button>
            </form>
        )}
        {failed && <p className="notice">{t('errors.words')}</p>}
        {gameLoaded && (
            <>
                <Game game={game} onNext={() => launch(true)} onRestart={() => launch()} />
                <button className="btn bg-card" onClick={() => navigate('/custom')}>{t('custom.change')}</button>
            </>
        )}
        </section>
    )
}
