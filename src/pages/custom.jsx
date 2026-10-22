import { useState } from 'react'
import Game from '../components/game.jsx'
import { loadWords, randomWords } from '../game/words.js'

const MIN = 3
const MAX = 10

export default function Custom({ game }) {
    const { mode, start } = game

    const [started, setStarted] = useState(false) // false: difficulty selector, true: game
    const [wordLength, setWordLength] = useState(5)
    const [maxTries, setMaxTries] = useState(6)
    const [wordCount, setWordCount] = useState(1)
    const [error, setError] = useState('')

    const valid = [wordLength, maxTries, wordCount].every((n) => Number.isInteger(n) && n >= (n === wordCount ? 1 : MIN) && n <= MAX)

    async function launch(keepScore = false) {
        try {
            const words = await loadWords(wordLength)
            start('custom', words, randomWords(words, wordCount), maxTries, keepScore)
            setError('')
            setStarted(true)
        } catch (e) {
            setError(e.message) // no word list for this length
        }
    }

    // infinite mode like classic: a win keeps the score and gives a new word, a loss starts over from 0
    return (
        <section className="custom">
        <h2>Custom</h2>
        {!started && (
            <form onSubmit={(e) => { e.preventDefault(); launch() }}>
                <label>
                    Word length
                    <input type="number" min={MIN} max={MAX} value={wordLength} onChange={(e) => setWordLength(Number(e.target.value))} />
                </label>
                <label>
                    Max tries
                    <input type="number" min={MIN} max={MAX} value={maxTries} onChange={(e) => setMaxTries(Number(e.target.value))} />
                </label>
                <label>
                    Number of grids
                    <input type="number" min={1} max={MAX} value={wordCount} onChange={(e) => setWordCount(Number(e.target.value))} />
                </label>
                <button type="submit" disabled={!valid}>Start</button>
                {error && <p>{error}</p>}
            </form>
        )}
        {started && mode === 'custom' && (
            <>
                <Game game={game} onNext={() => launch(true)} onRestart={() => launch()} />
                <button onClick={() => setStarted(false)}>Change difficulty</button>
            </>
        )}
        </section>
    )
}
