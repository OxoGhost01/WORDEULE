import useLanguage from '../i18n/useLanguage.js'
import { LANGUAGES } from '../config.js'

// Link to the Wiktionary of the language of the game, for a word written with its accents
export default function Wiki({ word }) {
    const { lang, t } = useLanguage()

    return (
        <section className="wiki">
            <a
                className="font-bold underline decoration-4 decoration-pink underline-offset-4 hover:bg-pink"
                href={`${LANGUAGES[lang].wiktionary}${encodeURIComponent(word.toLowerCase())}`}
                target="_blank"
                rel="noreferrer"
            >
                {t('wiki.link', { word })}
            </a>
        </section>
    )
}
