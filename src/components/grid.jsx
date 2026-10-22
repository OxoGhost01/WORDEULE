import evaluate, { shownGuesses } from '../game/evaluate.js'

// wordLength and maxTries are configurable; wordLength defaults to the length of the word to guess
// width (any CSS width) sets the size of the grid, the tiles follow
// guess is the line being typed (' ' = empty); fixed: its locked letters (locked mode)
// shake: { n, row } the line being typed shakes each time n changes (refused word)
export default function Grid({ guesses, guess, word, maxTries = 6, wordLength = word.length, width = '100%', fixed = [], shake = { n: 0, row: -1 } }) {
    // one row of tiles: typed letters first, "_" for the rest
    // statuses (only for submitted rows) gives the color class of each letter
    function line(letters, rowIndex, statuses = [], lockedLetters = []) {
        return Array.from({ length: wordLength }, (_, index) => {
            const letter = letters[index] === ' ' ? undefined : letters[index]
            const status = statuses[index] ?? ''
            const tilt = ((rowIndex * 5 + index * 3) % 7 - 3) * 0.5 // every tile is slightly out of line
            return (
                <span
                    key={index}
                    className={`tile ${status} ${letter && !status ? 'typed' : ''} ${letter ? '' : 'empty'} ${lockedLetters[index] ? 'locked' : ''}`}
                    style={{ '--r': `${tilt}deg`, '--d': `${index * 90}ms` }}
                >
                    <b>{letter ?? '_'}</b>
                </span>
            )
        })
    }

    // shown: the guesses of this grid; solved: its word was found
    // once the word is found, this grid stops being filled (the next guesses are not shown)
    const shown = shownGuesses(guesses, word)
    const solved = guesses.includes(word)

    // what to display on row i
    function row(i) {
        if (i < shown.length) return line(shown[i], i, evaluate(shown[i], word)) // already submitted
        if (i === shown.length && !solved) return line(guess, i, [], fixed)      // row being typed
        return line('', i)                                                       // untouched row
    }

    // the row being typed shakes when its word was refused (the key restarts the animation)
    function rowProps(i) {
        const typing = i === shown.length && !solved
        if (!typing) return { key: i, className: 'flex gap-1' }
        const shaking = shake.n > 0 && shake.row === guesses.length
        return { key: `typing-${shake.n}`, className: `flex gap-1 ${shaking ? 'shake' : ''}` }
    }

    return (
        <div className="flex flex-col gap-1" style={{ width }}>
            {Array.from({ length: maxTries }, (_, i) => {
                const { key, className } = rowProps(i)
                return <div key={key} className={className}>{row(i)}</div>
            })}
        </div>
    )
}
