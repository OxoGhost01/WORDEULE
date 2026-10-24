import { Link, useLocation } from "react-router";
import LanguageSwitch from "./languageswitch.jsx";
import useLanguage from "../i18n/useLanguage.js";
import { GAME_PAGES } from "../config.js";

// the logo is one colored, tilted tile per letter
const LETTERS = "WORDEULE".split("")
const INKS = ["bg-cobalt text-paper", "bg-pink", "bg-sun", "bg-ink text-paper"]
const TILTS = ["-rotate-3", "rotate-2", "-rotate-1", "rotate-3"]

export default function Header() {
    const { t } = useLanguage()

    // the language can't be changed while a game is played
    const { pathname } = useLocation()
    const inGame = GAME_PAGES.some((page) => pathname.startsWith(page))

    return (
        <header className="header flex flex-col items-center gap-4 pt-8 pb-4">
        <h1>
            <Link to="/" aria-label={t('header.home')} className="flex gap-1 sm:gap-1.5">
                {LETTERS.map((letter, i) => (
                    <span
                        key={i}
                        className={`grid size-9 place-items-center border-[3px] border-ink font-display text-xl font-extrabold shadow-hard transition-transform hover:-translate-y-1.5 sm:size-14 sm:text-3xl ${INKS[i % INKS.length]} ${TILTS[(i * 3) % TILTS.length]}`}
                    >
                        {letter}
                    </span>
                ))}
            </Link>
        </h1>
        {!inGame && <LanguageSwitch />}
        </header>
    )
}
