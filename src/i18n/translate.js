import en from './en.js'
import fr from './fr.js'

const TEXTS = { en, fr }

// The text of a key in a language. {name} is replaced by params.name.
// A key missing in a language falls back to English, and then to the key itself.
export function translate(lang, key, params = {}) {
    const text = TEXTS[lang]?.[key] ?? TEXTS.en[key] ?? key
    return text.replace(/\{(\w+)\}/g, (_, name) => params[name] ?? `{${name}}`)
}
