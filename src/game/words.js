// Word lists:
// - the dictionary (an-array-of-english-words package): every English word, used to check the guesses
// - the common words (Google 10,000 most common words): the words to guess are taken from them
// Both are served by jsDelivr (it allows calls from the browser) and downloaded once per session.
import { DICTIONARY_URL, COMMON_WORDS_URL } from '../config.js'

let dictionary = null // Promise of the list
let commonWords = null

// Plain letters only (the game can't type anything else), uppercase, sorted
const clean = (list) => list.filter((w) => /^[a-z]+$/i.test(w)).map((w) => w.toUpperCase()).sort()

function checkResponse(response) {
    if (!response.ok) throw new Error(`Could not load the word list (${response.status})`)
    return response
}

function loadDictionary() {
    if (!dictionary) {
        dictionary = fetch(DICTIONARY_URL)
            .then(checkResponse)
            .then((response) => response.json())
            .then(clean)
            .catch((error) => {
                dictionary = null // allow a retry
                throw error
            })
    }
    return dictionary
}

function loadCommonWords() {
    if (!commonWords) {
        commonWords = fetch(COMMON_WORDS_URL)
            .then(checkResponse)
            .then((response) => response.text())
            .then((text) => clean(text.split('\n').map((w) => w.trim()))) // one word per line
            .catch((error) => {
                commonWords = null // allow a retry
                throw error
            })
    }
    return commonWords
}

// The words that can be the answer: the common words of the right length that are also in the dictionary
// (so an answer is always a valid guess)
export function pickAnswers(common, dictionary, length) {
    const known = new Set(dictionary)
    return common.filter((w) => w.length === length && known.has(w))
}

// The two lists of a game for words of a given length:
// - words: every word of the dictionary, to check the guesses
// - answers: the common words, where the words to guess come from
export async function loadWordLists(length = 5) {
    const [all, common] = await Promise.all([loadDictionary(), loadCommonWords()])
    const words = all.filter((w) => w.length === length)
    const answers = pickAnswers(common, words, length)
    if (words.length === 0 || answers.length === 0) throw new Error(`No ${length}-letter words found`)
    return { words, answers }
}

// Pick a word of a list of answers (see loadWordLists)
export function randomWord(words) {
    return words[Math.floor(Math.random() * words.length)]
}

// Pick several different words of a list of answers
export function randomWords(words, count) {
    const pool = [...words]
    const picked = []
    while (picked.length < count && pool.length > 0) {
        picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0])
    }
    return picked
}
