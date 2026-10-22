import evaluate, { shownGuesses } from '../game/evaluate.js'

// wordLength and maxTries are configurable; wordLength defaults to the length of the word to guess
// width (any CSS width) sets the size of the grid, the tiles follow
export default function Grid({ guesses, guess, word, maxTries = 6, wordLength = word.length, width = '100%' }) {
    // one row of tiles: typed letters first, "_" for the rest
    // statuses (only for submitted rows) gives the color class of each letter
    function line(letters, rowIndex, statuses = []) {
        return Array.from({ length: wordLength }, (_, index) => {
            const letter = letters[index]
            const status = statuses[index] ?? ''
            const tilt = ((rowIndex * 5 + index * 3) % 7 - 3) * 0.5 // every tile is slightly out of line
            return (
                <span
                    key={index}
                    className={`tile ${status} ${letter && !status ? 'typed' : ''} ${letter ? '' : 'empty'}`}
                    style={{ '--r': `${tilt}deg`, '--d': `${index * 90}ms` }}
                >
                    <b>{letter ?? '_'}</b>
                </span>
            )
        })
    }

    // once the word is found, this grid stops being filled (the next guesses are not shown)
    const shown = shownGuesses(guesses, word)
    const solved = guesses.includes(word)

    function row(i) {
        if (i < shown.length) return line(shown[i], i, evaluate(shown[i], word)) // already submitted
        if (i === shown.length && !solved) return line(guess, i)                 // row being typed
        return line('', i)                                                       // untouched row
    }

    return (
        <div className="flex flex-col gap-1" style={{ width }}>
            {Array.from({ length: maxTries }, (_, i) => (
                <div key={i} className="flex gap-1">{row(i)}</div>
            ))}
        </div>
    )
}
