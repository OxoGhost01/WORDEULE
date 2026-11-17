import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { LANGUAGE_SOURCES } from '../shared/rules.js'
import { buildLists, parseCommonWords, parseDictionary } from '../shared/words.js'

async function fetchText(url) {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Could not load ${url} (${response.status})`)
    return response.text()
}

export function createWordBank({ dir, download = fetchText }) {
    mkdirSync(dir, { recursive: true })
    const sources = new Map()
    const lists = new Map()

    async function cached(file, url) {
        const path = join(dir, file)
        if (existsSync(path)) return readFileSync(path, 'utf8')
        const text = await download(url)
        writeFileSync(path, text)
        return text
    }

    function source(lang) {
        if (!sources.has(lang)) {
            const { dictionaryUrl, commonWordsUrl, commonWordsLimit } = LANGUAGE_SOURCES[lang]
            const loading = Promise.all([
                cached(`dictionary-${lang}.json`, dictionaryUrl),
                cached(`common-${lang}.txt`, commonWordsUrl),
            ]).then(([dictionary, common]) => ({
                dictionary: parseDictionary(JSON.parse(dictionary)),
                common: parseCommonWords(common, commonWordsLimit),
            }))
            loading.catch(() => sources.delete(lang))
            sources.set(lang, loading)
        }
        return sources.get(lang)
    }

    return {
        listsFor: (lang) => async (length) => {
            const key = `${lang}:${length}`
            if (!lists.has(key)) {
                const { dictionary, common } = await source(lang)
                lists.set(key, buildLists(dictionary, common, length))
            }
            return lists.get(key)
        },
    }
}
