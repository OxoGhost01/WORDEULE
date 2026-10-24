import useLanguage from '../i18n/useLanguage.js'
import { LANGUAGES } from '../config.js'

// One button per language: the choice is saved in the browser
export default function LanguageSwitch() {
    const { lang, setLang, t } = useLanguage()

    return (
        <div role="group" aria-label={t('language.label')} className="flex gap-1.5">
            {Object.entries(LANGUAGES).map(([code, { label }]) => (
                <button
                    key={code}
                    title={label}
                    aria-pressed={code === lang}
                    onClick={() => setLang(code)}
                    className={`cursor-pointer border-[3px] border-ink px-2.5 py-0.5 font-display text-sm font-extrabold uppercase transition ${
                        code === lang ? 'bg-sun shadow-hard' : 'bg-card hover:bg-pink'
                    }`}
                >
                    {code}
                </button>
            ))}
        </div>
    )
}
