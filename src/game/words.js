// The word list is the full English dictionary of the an-array-of-english-words package,
// served by jsDelivr ( allows calls from the browser). It is downloaded once per session
// and used for both the possible answers and the valid guesses.
const DICTIONARY_URL = 'https://cdn.jsdelivr.net/npm/an-array-of-english-words@2.0.0/index.json'

let dictionary = null // Promise of the whole list, uppercased and sorted

function loadDictionary() {
    if (!dictionary) {
        dictionary = fetch(DICTIONARY_URL)
            .then((response) => {
                if (!response.ok) throw new Error(`Could not load the word list (${response.status})`)
                return response.json()
            })
            .then((data) => data.filter((w) => /^[a-z]+$/.test(w)).map((w) => w.toUpperCase()).sort())
            .catch((error) => {
                dictionary = null // allow a retry
                throw error
            })
    }
    return dictionary
}

// All the words of a given length
export async function loadWords(length = 5) {
    const words = (await loadDictionary()).filter((w) => w.length === length)
    if (words.length === 0) throw new Error(`No ${length}-letter words found`)
    return words
}

// Pick a word of an already loaded list (see loadWords)
export function randomWord(words) {
    return words[Math.floor(Math.random() * words.length)]
}

// Pick several different words of an already loaded list
export function randomWords(words, count) {
    const pool = [...words]
    const picked = []
    while (picked.length < count && pool.length > 0) {
        picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0])
    }
    return picked
}
