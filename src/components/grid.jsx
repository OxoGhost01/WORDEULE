import evaluate, { shownGuesses } from '../game/evaluate.js'

// wordLength and maxTries are configurable; wordLength defaults to the length of the word to guess
export default function Grid({ guesses, guess, word, maxTries = 6, wordLength = word.length }) {
    // one row of cells: typed letters first, "_" for the rest
    // statuses (only for submitted rows) gives the color class of each letter
    function line(letters, statuses = []) {
        return Array.from({ length: wordLength }, (_, index) => (
            <span key={index} className={statuses[index] ?? ''}>
                {letters[index] ?? '_'}
            </span>
        ))
    }

    // once the word is found, this grid stops being filled (the next guesses are not shown)
    const shown = shownGuesses(guesses, word)
    const solved = guesses.includes(word)

    function row(i) {
        if (i < shown.length) return line(shown[i], evaluate(shown[i], word)) // already submitted
        if (i === shown.length && !solved) return line(guess)         // row being typed
        return line('')                                                       // untouched row
    }

    return (
        <div className="grid">
            {Array.from({ length: maxTries }, (_, i) => (
                <div key={i}>{row(i)}</div>
            ))}
        </div>
    )
}
