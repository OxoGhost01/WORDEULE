import Game from '../components/game.jsx'
import useLauncher from '../game/useLauncher.js'
import useLanguage from '../i18n/useLanguage.js'

// Locked: letters found at their place stay locked there, letters found elsewhere must be used (see game/locked.js)
export default function Locked({ game }) {
    const { t } = useLanguage()
    const { launch, failed, running } = useLauncher('locked', game)

    // infinite mode: a win keeps the score and gives new words, a loss starts over from 0
    return (
        <section className="locked flex w-full flex-col items-center gap-6">
        <h2 className="page-title">{t('modes.locked')}</h2>
        {failed && <p className="notice">{t('errors.words')}</p>}
        {running && <Game game={game} onNext={() => launch(true)} onRestart={() => launch()} />}
        </section>
    )
}
