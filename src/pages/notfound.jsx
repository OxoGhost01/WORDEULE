import { Link } from 'react-router'

// Shown for any address that doesn't exist: a refused word, like in the game
export default function NotFound() {
    return (
        <section className="notfound flex w-full flex-col items-center gap-6">
        <h2 className="page-title">404</h2>
        <div className="shake flex w-48 gap-1">
            {['4', '0', '4'].map((digit, i) => (
                <span key={i} className={`tile ${i === 1 ? 'absent' : 'correct'}`} style={{ '--d': `${i * 90}ms` }}><b>{digit}</b></span>
            ))}
        </div>
        <p className="notice">Not in the word list: this page doesn't exist.</p>
        <Link className="btn" to="/">Back to the menu</Link>
        </section>
    )
}
