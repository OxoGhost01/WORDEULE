import { useEffect, useState } from 'react'
import Game from '../components/game.jsx'
import { loadWordLists, randomWord } from '../game/words.js'
import { GAME_MODES } from '../config.js'

const { wordLength: WORD_LENGTH, maxTries: MAX_TRIES } = GAME_MODES.classic

export default function Classic({ game }) {
    const { mode, start } = game
    const [error, setError] = useState('')

    // start a game with a new word (keepScore: a win goes on with the same score)
    async function launch(keepScore = false) {
        try {
            const { words, answers } = await loadWordLists(WORD_LENGTH)
            start('classic', words, [randomWord(answers)], MAX_TRIES, keepScore)
        } catch (e) {
            setError(e.message)
        }
    }

    // start a game as soon as the page opens
    useEffect(() => {
        let cancelled = false // the page may be left before the word is loaded
        loadWordLists(WORD_LENGTH)
            .then(({ words, answers }) => { if (!cancelled) start('classic', words, [randomWord(answers)], MAX_TRIES) })
            .catch((e) => { if (!cancelled) setError(e.message) })
        return () => { cancelled = true }
    }, [start])

    // infinite mode: a win keeps the score and gives a new word, a loss starts over from 0
    return (
        <section className="classic flex w-full flex-col items-center gap-6">
        <h2 className="page-title">Classic</h2>
        {error && <p className="notice">{error}</p>}
        {mode === 'classic' && (
            <Game game={game} onNext={() => launch(true)} onRestart={() => launch()} />
        )}
        </section>
    )
}
