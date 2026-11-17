export default function evaluate(guess, word) {
    const result = Array(guess.length).fill('absent')
    const remaining = {}

    for (let i = 0; i < word.length; i++) {
        if (guess[i] === word[i]) result[i] = 'correct'
        else remaining[word[i]] = (remaining[word[i]] ?? 0) + 1
    }

    for (let i = 0; i < guess.length; i++) {
        if (result[i] === 'correct') continue
        if (remaining[guess[i]] > 0) {
            result[i] = 'present'
            remaining[guess[i]]--
        }
    }

    return result
}

export const isCorrect = (statuses) => statuses.every((status) => status === 'correct')

export function shownRows(rows, grid) {
    const solvedAt = rows.findIndex((row) => isCorrect(row.results[grid]))
    return solvedAt === -1 ? rows : rows.slice(0, solvedAt + 1)
}

export function gridSolved(rows, grid) {
    return rows.some((row) => isCorrect(row.results[grid]))
}

export function allSolved(rows, grids) {
    return rows.length > 0 && Array.from({ length: grids }, (_, g) => gridSolved(rows, g)).every(Boolean)
}

export function letterStatuses(rows, grid) {
    const rank = { absent: 1, present: 2, correct: 3 }
    const result = {}
    for (const row of shownRows(rows, grid)) {
        row.results[grid].forEach((status, i) => {
            const letter = row.guess[i]
            if (!result[letter] || rank[status] > rank[result[letter]]) result[letter] = status
        })
    }
    return result
}
