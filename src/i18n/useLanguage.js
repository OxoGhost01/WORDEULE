import { useContext } from 'react'
import { LanguageContext } from './context.js'

// const { lang, setLang, t } = useLanguage()
export default function useLanguage() {
    return useContext(LanguageContext)
}
