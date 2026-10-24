import { letterStatuses } from '../game/evaluate.js'
import { LANGUAGES } from '../config.js'
import useLanguage from '../i18n/useLanguage.js'

// text of the two special keys
const LABELS = { Enter: 'keyboard.enter', Backspace: 'keyboard.backspace' }

// Virtual keyboard (QWERTY or AZERTY, depending on the language): shows the state of every letter and types like the real keyboard.
// A key has one stripe per grid (one for a normal game, several for hardcore), each with the
// class of the letter on that grid: correct, present, absent, or nothing if not tested yet.
export default function Keyboard({ answers, guesses, onKey }) {
    const { lang, t } = useLanguage()
    // for each grid, the status of every letter already tried
    const statuses = answers.map((word) => letterStatuses(guesses, word))

    return (
        <div className="flex w-full max-w-xl flex-col gap-1.5">
            {LANGUAGES[lang].keyboardRows.map((row, i) => (
                <div key={i} className={`flex gap-1 sm:gap-1.5 ${i === 1 && row.length < 10 ? 'px-[5%]' : ''}`}>
                    {row.map((key) => (
                        <button
                            key={key}
                            className={`key ${key.length > 1 ? 'key-wide' : ''}`}
                            aria-label={LABELS[key] ? t(LABELS[key]) : key}
                            onClick={(e) => {
                                onKey(key)
                                e.currentTarget.blur() // otherwise the real Enter would also press this key
                            }}
                        >
                            {key.length === 1 && (
                                <span className="marks">
                                    {statuses.map((byLetter, g) => (
                                        <span key={g} className={byLetter[key] ?? ''} />
                                    ))}
                                </span>
                            )}
                            <span className="label">{LABELS[key] ? t(LABELS[key]) : key}</span>
                        </button>
                    ))}
                </div>
            ))}
        </div>
    )
}
