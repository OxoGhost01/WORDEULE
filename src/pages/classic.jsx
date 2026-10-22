import { useEffect, useState } from 'react'
import Game from '../components/game.jsx'
import { loadWords, randomWord } from '../game/words.js'

const WORD_LENGTH = 5
const MAX_TRIES = 6

export default function Classic({ game }) {
    const { mode, start } = game
    const [error, setError] = useState('')

    async function launch(keepScore = false) {
        try {
            const words = await loadWords(WORD_LENGTH)
            start('classic', words, [randomWord(words)], MAX_TRIES, keepScore)
        } catch (e) {
            setError(e.message)
        }
    }

    useEffect(() => {
        let cancelled = false // the page may be left before the word is loaded
        loadWords(WORD_LENGTH)
            .then((words) => { if (!cancelled) start('classic', words, [randomWord(words)], MAX_TRIES) })
            .catch((e) => { if (!cancelled) setError(e.message) })
        return () => { cancelled = true }
    }, [start])

    // infinite mode: a win keeps the score and gives a new word, a loss starts over from 0
    return (
        <section className="classic">
        <h2>Classic</h2>
        {error && <p>{error}</p>}
        {mode === 'classic' && (
            <Game game={game} onNext={() => launch(true)} onRestart={() => launch()} />
        )}
        </section>
    )
}
