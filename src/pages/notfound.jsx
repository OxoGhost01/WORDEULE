import { Link } from 'react-router'
import useLanguage from '../i18n/useLanguage.js'

// Shown for any address that doesn't exist: a refused word, like in the game
export default function NotFound() {
    const { t } = useLanguage()

    return (
        <section className="notfound flex w-full flex-col items-center gap-6">
        <h2 className="page-title">404</h2>
        <div className="shake flex w-48 gap-1">
            {['4', '0', '4'].map((digit, i) => (
                <span key={i} className={`tile ${i === 1 ? 'absent' : 'correct'}`} style={{ '--d': `${i * 90}ms` }}><b>{digit}</b></span>
            ))}
        </div>
        <p className="notice">{t('notFound.text')}</p>
        <Link className="btn" to="/">{t('notFound.back')}</Link>
        </section>
    )
}
