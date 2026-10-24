import { useCallback, useEffect, useState } from 'react'
import { loadWordLists, randomWords } from './words.js'
import useLanguage from '../i18n/useLanguage.js'
import { GAME_MODES } from '../config.js'

// Starts the games of an endless mode (classic, locked, hardcore) with the words of the current language.
// game: the game object of Home. Returns:
// - launch(keepScore): starts a new game (keepScore: a win goes on with the same score)
// - failed: the words could not be loaded
// - running: a game of this mode, in this language, is the current one
// A first game starts as soon as the page opens.
export default function useLauncher(mode, game) {
    const { lang } = useLanguage()
    const { start } = game
    const { wordLength, maxTries, grids } = GAME_MODES[mode]
    const [failed, setFailed] = useState(false)

    // cancelled(): the page was left before the words were loaded, so no game must start
    const launch = useCallback(async (keepScore = false, cancelled = () => false) => {
        try {
            const { words, pool, display } = await loadWordLists(wordLength, lang)
            if (cancelled()) return
            start({ mode, words, display, answers: randomWords(pool, grids), maxTries, keepScore })
            setFailed(false)
        } catch {
            if (!cancelled()) setFailed(true)
        }
    }, [mode, lang, start, wordLength, maxTries, grids])

    useEffect(() => {
        let cancelled = false
        launch(false, () => cancelled)
        return () => { cancelled = true }
    }, [launch])

    return { launch, failed, running: game.mode === mode && game.lang === lang }
}
