import Game from '../components/game.jsx'
import useLauncher from '../game/useLauncher.js'
import useLanguage from '../i18n/useLanguage.js'

export default function ModePage({ mode, game }) {
    const { t } = useLanguage()
    const { launch, next, failed, running } = useLauncher(mode, game)

    return (
        <section className={`${mode} flex w-full flex-col items-center gap-6`}>
            <h2 className="page-title">{t(`modes.${mode}`)}</h2>
            {failed && <p className="notice">{t('errors.words')}</p>}
            {running && <Game game={game} onNext={next} onRestart={launch} />}
        </section>
    )
}
