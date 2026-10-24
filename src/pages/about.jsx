import useLanguage from '../i18n/useLanguage.js'

export default function About() {
    const { t } = useLanguage()

    return (
        <section className="about flex w-full max-w-2xl flex-col items-center gap-8">
        <h2 className="page-title">{t('pages.about')}</h2>
        <p className="-rotate-1 border-[3px] border-ink bg-card p-6 text-lg leading-relaxed shadow-hard-lg">
            {t('about.intro')}
            <br />
            <br />
            {t('about.outro')}
        </p>
        </section>
    )
}
