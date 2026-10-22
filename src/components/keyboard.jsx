import { letterStatuses } from '../game/evaluate.js'

const ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace'],
]

const LABELS = { Enter: 'ENTER', Backspace: '⌫' }

// Virtual keyboard: shows the state of every letter and types like the real keyboard.
// A key has one mark per grid (one for a normal game, several for hardcore), each with the
// class of the letter on that grid: correct, present, absent, or nothing if not tested yet.
export default function Keyboard({ answers, guesses, onKey }) {
    const statuses = answers.map((word) => letterStatuses(guesses, word))

    return (
        <div className="keyboard">
            {ROWS.map((row, i) => (
                <div key={i} className="keyboard-row">
                    {row.map((key) => (
                        <button
                            key={key}
                            className="key"
                            aria-label={key}
                            onClick={(e) => {
                                onKey(key)
                                e.currentTarget.blur() // otherwise the real Enter would also press this key
                            }}
                        >
                            {LABELS[key] ?? key}
                            {key.length === 1 && statuses.map((byLetter, g) => (
                                <span key={g} className={byLetter[key] ?? ''} />
                            ))}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    )
}
