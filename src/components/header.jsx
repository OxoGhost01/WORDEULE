import { Link } from "react-router";

const LETTERS = "WORDEULE".split("")
const INKS = ["bg-cobalt text-paper", "bg-pink", "bg-sun", "bg-ink text-paper"]
const TILTS = ["-rotate-3", "rotate-2", "-rotate-1", "rotate-3"]

export default function Header() {
    return (
        <header className="header flex justify-center pt-8 pb-4">
        <h1>
            <Link to="/" aria-label="WORDEULE, home" className="flex gap-1 sm:gap-1.5">
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
        </header>
    )
}
