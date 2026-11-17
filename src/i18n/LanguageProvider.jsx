import { useEffect, useMemo, useState } from 'react'
import { LanguageContext } from './context.js'
import { translate } from './translate.js'
import { getLanguage, saveLanguage } from '../data/storage.js'
import { DEFAULT_LANGUAGE, LANGUAGES } from '../config.js'

// The language of the first visit: the one of the browser if we have it, otherwise the default
function firstLanguage() {
    const fromBrowser = (navigator.language ?? '').slice(0, 2)
    return fromBrowser in LANGUAGES ? fromBrowser : DEFAULT_LANGUAGE
}

// Gives the language, and t() to translate, to the whole app. The choice is saved in the browser.
export default function LanguageProvider({ children }) {
    const [lang, setLangState] = useState(() => getLanguage() ?? firstLanguage())

    useEffect(() => {
        document.documentElement.lang = lang
    }, [lang])

    const value = useMemo(() => ({
        lang,
        setLang: (newLang) => {
            saveLanguage(newLang)
            setLangState(newLang)
        },
        t: (key, params) => translate(lang, key, params),
    }), [lang])

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
