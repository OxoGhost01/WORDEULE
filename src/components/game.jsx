import { useEffect, useRef } from 'react'
import Grid from './grid.jsx'
import useGame from '../game/useGame.js'
import Keyboard from './keyboard.jsx'
import Wiki from '../components/wiki.jsx'
import { saveScore } from '../data/storage.js'

// One round: grid + typing + end message. onNext (after a win) and onRestart (after a loss) are optional.
// saveResult false: the finished game is only displayed (daily game restored after a refresh), not saved again.
export default function Game({ game, onNext, onRestart, saveResult = true }) {
    const { mode, answers, guesses, guess, score, maxTries } = game
    const { status, onKey } = useGame(game)
    const savedResult = useRef(false)

    useEffect(() => {
        if (status === 'playing' || status === 'idle') {
            savedResult.current = false
        } else if (!savedResult.current) {
            if (saveResult) saveScore({ mode, score, outcome: status })
            savedResult.current = true
        }
    }, [mode, score, status, saveResult])

    return (
        <>
            {answers.map((word) => (
                <Grid key={word} guesses={guesses} guess={guess} word={word} maxTries={maxTries} />
            ))}
            <Keyboard answers={answers} guesses={guesses} onKey={onKey} />
            {status === 'won' && <p>Won in {guesses.length} / {maxTries}</p>}
            {status === 'lost' && <p>Lost, the {answers.length > 1 ? 'words were' : 'word was'} {answers.filter((a) => !guesses.includes(a)).join(', ')}</p>}
            {(status === 'won' || status === 'lost') && <p>Score: {score}</p>}
            {status === 'won' && onNext && <button onClick={onNext}>Next word</button>}
            {status === 'lost' && onRestart && <button onClick={onRestart}>New game</button>}
            {(status === 'won' || status === 'lost') && answers.map((word) => <Wiki key={word} word={word} />)}
        </>
    )
}
