
export function fixedLetters(rows, length) {
    const fixed = Array(length).fill(null)
    for (const row of rows) {
        row.results[0].forEach((status, i) => {
            if (status === 'correct') fixed[i] = row.guess[i]
        })
    }
    return fixed
}

export function requiredCounts(rows) {
    const required = {}
    for (const row of rows) {
        const counts = {}
        row.results[0].forEach((status, i) => {
            if (status !== 'absent') counts[row.guess[i]] = (counts[row.guess[i]] ?? 0) + 1
        })
        for (const [letter, count] of Object.entries(counts)) {
            required[letter] = Math.max(required[letter] ?? 0, count)
        }
    }
    return required
}

export function missingLetters(guess, required) {
    const have = {}
    for (const letter of guess) have[letter] = (have[letter] ?? 0) + 1

    const missing = []
    for (const [letter, count] of Object.entries(required)) {
        for (let k = have[letter] ?? 0; k < count; k++) missing.push(letter)
    }
    return missing
}

export function mergeRow(fixed, typed, length) {
    let next = 0
    let row = ''
    for (let i = 0; i < length; i++) {
        row += fixed[i] ?? typed[next++] ?? ' '
    }
    return row
}

export function lockedError(rows, guess) {
    const fixed = fixedLetters(rows, guess.length)
    if (fixed.some((letter, i) => letter && guess[i] !== letter)) return 'lockedLetters'
    if (missingLetters(guess, requiredCounts(rows)).length > 0) return 'mustUse'
    return null
}
