import evaluate from './evaluate.js'

// Rules of the "locked" mode, on top of the normal ones:
// - a letter found at its place is locked there: it is pre-filled on every new line
// - a letter found elsewhere must be used in every next guess

// Letters locked in place (null for the free positions)
export function fixedLetters(guesses, word) {
    const fixed = Array(word.length).fill(null)
    for (const guess of guesses) {
        for (let i = 0; i < word.length; i++) {
            if (guess[i] === word[i]) fixed[i] = word[i]
        }
    }
    return fixed
}

// How many times each letter must appear in the next guess: the most it was found
// (well placed or not) in a single previous guess
export function requiredCounts(guesses, word) {
    const required = {}
    for (const guess of guesses) {
        const counts = {}
        evaluate(guess, word).forEach((status, i) => {
            if (status !== 'absent') counts[guess[i]] = (counts[guess[i]] ?? 0) + 1
        })
        for (const [letter, count] of Object.entries(counts)) {
            required[letter] = Math.max(required[letter] ?? 0, count)
        }
    }
    return required
}

// Letters (with repetitions) that a guess still lacks to respect the required counts
export function missingLetters(guess, required) {
    const have = {}
    for (const letter of guess) have[letter] = (have[letter] ?? 0) + 1

    const missing = []
    for (const [letter, count] of Object.entries(required)) {
        for (let k = have[letter] ?? 0; k < count; k++) missing.push(letter)
    }
    return missing
}

// The row shown on the grid: locked letters at their place, typed letters in the free positions
// in order, ' ' for what is still empty
export function mergeRow(fixed, typed, length) {
    let next = 0
    let row = ''
    for (let i = 0; i < length; i++) {
        row += fixed[i] ?? typed[next++] ?? ' '
    }
    return row
}
