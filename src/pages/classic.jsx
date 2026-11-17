import Game from '../components/game.jsx'
import useLauncher from '../game/useLauncher.js'
import useLanguage from '../i18n/useLanguage.js'

export default function Classic({ game }) {
    const { t } = useLanguage()
    const { launch, next, failed, running } = useLauncher('classic', game)

    // infinite mode: a win keeps the score and gives new words, a loss starts over from 0
    return (
        <section className="classic flex w-full flex-col items-center gap-6">
        <h2 className="page-title">{t('modes.classic')}</h2>
        {failed && <p className="notice">{t('errors.words')}</p>}
        {running && <Game game={game} onNext={next} onRestart={launch} />}
        </section>
    )
}
