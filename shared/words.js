import { normalize } from './text.js'

const isWord = (word) => /^[A-Z]+$/.test(normalize(word))

export function parseDictionary(list) {
    return [...new Set(list.filter(isWord).map(normalize))].sort()
}

export function parseCommonWords(text, limit) {
    return text
        .split('\n')
        .slice(0, limit)
        .map((line) => line.trim().split(' ')[0].toLowerCase())
        .filter(isWord)
}

export function pickAnswers(common, dictionary, length) {
    const known = new Set(dictionary)
    const display = {}
    for (const word of common) {
        const plain = normalize(word)
        if (plain.length === length && known.has(plain) && !(plain in display)) display[plain] = word.toUpperCase()
    }
    return { pool: Object.keys(display).sort(), display }
}

export function buildLists(dictionary, common, length) {
    const words = dictionary.filter((w) => w.length === length)
    const { pool, display } = pickAnswers(common, words, length)
    if (words.length === 0 || pool.length === 0) throw new Error(`No ${length}-letter words found`)
    return { words, valid: new Set(words), pool, display }
}

export function randomWord(words, rng = Math.random) {
    return words[Math.floor(rng() * words.length)]
}

export function randomWords(words, count, rng = Math.random) {
    const pool = [...words]
    const picked = []
    while (picked.length < count && pool.length > 0) {
        picked.push(pool.splice(Math.floor(rng() * pool.length), 1)[0])
    }
    return picked
}
