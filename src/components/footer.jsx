import useLanguage from '../i18n/useLanguage.js'

const LINK = 'underline decoration-2 underline-offset-4 hover:bg-pink'

export default function Footer() {
    const { t } = useLanguage()

    return (
        <footer className="footer mt-10 border-t-[3px] border-dashed border-ink py-6 text-center text-xs leading-relaxed">
        <p className="font-bold">© 1995-2026 WORDEULE</p>
        <p>{t('footer.madeBy')} <a className={LINK} href="https://github.com/OxoGhost01" target="_blank" rel="noreferrer">Oxoghost</a> & <a className={LINK} href="https://github.com/coubitic" target="_blank" rel="noreferrer">Coubitic</a></p>
        </footer>
    )
}
