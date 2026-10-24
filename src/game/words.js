// Word lists of a language (see LANGUAGES in config.js):
// - the dictionary: every word of the language, used to check the guesses
// - the common words: the words to guess are taken from them
// Both are served by jsDelivr (it allows calls from the browser) and downloaded once per session and language.
import { LANGUAGES } from '../config.js'
import { normalize } from './text.js'

const dictionaries = {} // language -> Promise of the dictionary (words without accents, sorted)
const commonLists = {} // language -> Promise of the common words (as written, with their accents)

// Only words made of letters: no hyphen, no apostrophe...
const isWord = (word) => /^[A-Z]+$/.test(normalize(word))

// Downloads a list the first time, then reuses it. A failed download can be retried.
function once(store, lang, download) {
    if (!store[lang]) {
        store[lang] = download().catch((error) => {
            delete store[lang]
            throw error
        })
    }
    return store[lang]
}

async function fetchOk(url) {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Could not load the word list (${response.status})`)
    return response
}

function loadDictionary(lang) {
    return once(dictionaries, lang, async () => {
        const list = await (await fetchOk(LANGUAGES[lang].dictionaryUrl)).json()
        return [...new Set(list.filter(isWord).map(normalize))].sort()
    })
}

function loadCommonWords(lang) {
    return once(commonLists, lang, async () => {
        const { commonWordsUrl, commonWordsLimit } = LANGUAGES[lang]
        const text = await (await fetchOk(commonWordsUrl)).text()
        return text
            .split('\n')
            .slice(0, commonWordsLimit) // the most frequent ones come first
            .map((line) => line.trim().split(' ')[0].toLowerCase()) // a line is "word" or "word count"
            .filter(isWord)
    })
}

// The words that can be the answer: the common words of the right length that are also in the dictionary
// (so an answer is always a valid guess).
// - pool: those words without accents, as the game compares them
// - display: each of them as it is written, with its accents (ETE -> ÉTÉ), to show it at the end of the game
export function pickAnswers(common, dictionary, length) {
    const known = new Set(dictionary)
    const display = {}
    for (const word of common) {
        const plain = normalize(word)
        if (plain.length === length && known.has(plain) && !(plain in display)) display[plain] = word.toUpperCase()
    }
    return { pool: Object.keys(display).sort(), display }
}

// The lists of a game for words of a given length, in a language:
// - words: every word of the dictionary of that length, to check the guesses
// - pool: the common words, where the words to guess come from
// - display: how the words of the pool are written, with accents
export async function loadWordLists(length, lang) {
    const [dictionary, common] = await Promise.all([loadDictionary(lang), loadCommonWords(lang)])
    const words = dictionary.filter((w) => w.length === length)
    const { pool, display } = pickAnswers(common, words, length)
    if (words.length === 0 || pool.length === 0) throw new Error(`No ${length}-letter words found`)
    return { words, pool, display }
}

// Pick a word of a pool of answers (see loadWordLists)
export function randomWord(words) {
    return words[Math.floor(Math.random() * words.length)]
}

// Pick several different words of a pool of answers
export function randomWords(words, count) {
    const pool = [...words]
    const picked = []
    while (picked.length < count && pool.length > 0) {
        picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0])
    }
    return picked
}
