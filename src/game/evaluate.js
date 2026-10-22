// Colors one submitted guess against the word: 'correct' | 'present' | 'absent' per letter.
// Duplicate letters are handled like Wordle: each letter of the word can only be matched once.
export default function evaluate(guess, word) {
    const result = Array(guess.length).fill('absent')
    const remaining = {} // letters of the word not matched by a 'correct' yet

    // first pass: the letters at the right place
    for (let i = 0; i < word.length; i++) {
        if (guess[i] === word[i]) result[i] = 'correct'
        else remaining[word[i]] = (remaining[word[i]] ?? 0) + 1
    }

    // second pass: the other letters are 'present' while the word still has a copy of them
    for (let i = 0; i < guess.length; i++) {
        if (result[i] === 'correct') continue
        if (remaining[guess[i]] > 0) {
            result[i] = 'present'
            remaining[guess[i]]--
        }
    }

    return result
}

// The guesses displayed on the grid of a word: once the word is found, the next guesses are ignored.
export function shownGuesses(guesses, word) {
    const solvedAt = guesses.indexOf(word)
    return solvedAt === -1 ? guesses : guesses.slice(0, solvedAt + 1)
}

// Best known status of every tested letter for a word ('correct' > 'present' > 'absent');
// letters that were never tested are not in the result.
export function letterStatuses(guesses, word) {
    const rank = { absent: 1, present: 2, correct: 3 }
    const result = {}
    for (const guess of shownGuesses(guesses, word)) {
        evaluate(guess, word).forEach((status, i) => {
            if (!result[guess[i]] || rank[status] > rank[result[guess[i]]]) result[guess[i]] = status
        })
    }
    return result
}
