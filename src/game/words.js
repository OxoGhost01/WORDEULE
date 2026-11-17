import { LANGUAGES } from '../config.js'
import { buildLists, parseCommonWords, parseDictionary } from '../../shared/words.js'

const dictionaries = {}
const commonLists = {}

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
    return once(dictionaries, lang, async () => parseDictionary(await (await fetchOk(LANGUAGES[lang].dictionaryUrl)).json()))
}

function loadCommonWords(lang) {
    return once(commonLists, lang, async () => {
        const { commonWordsUrl, commonWordsLimit } = LANGUAGES[lang]
        return parseCommonWords(await (await fetchOk(commonWordsUrl)).text(), commonWordsLimit)
    })
}

export async function loadWordLists(length, lang) {
    const [dictionary, common] = await Promise.all([loadDictionary(lang), loadCommonWords(lang)])
    return buildLists(dictionary, common, length)
}

export const listsLoader = (lang) => (length) => loadWordLists(length, lang)
