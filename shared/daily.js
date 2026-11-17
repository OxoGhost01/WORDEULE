export function getDailyWord(words, seed, date = new Date()) {
    const shuffledWords = [...words]
    let state = seed

    function nextRandom() {
        state = (state + 0x6d2b79f5) | 0
        let value = state
        value = Math.imul(value ^ (value >>> 15), value | 1)
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296
    }

    for (let index = shuffledWords.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(nextRandom() * (index + 1))
        ;[shuffledWords[index], shuffledWords[swapIndex]] = [shuffledWords[swapIndex], shuffledWords[index]]
    }

    const day = Math.floor(date.getTime() / 86400000)
    return shuffledWords[day % shuffledWords.length]
}

export function dayKey(date = new Date()) {
    return date.toISOString().slice(0, 10)
}
