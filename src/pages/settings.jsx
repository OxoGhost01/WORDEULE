import { useState } from 'react'
import Tabs from '../components/tabs.jsx'
import { renamePlayer } from '../data/api.js'
import { applyPrefs } from '../data/prefs.js'
import { getPrefs, getUsername, savePrefs, saveUsername } from '../data/storage.js'
import { USERNAME_MAX_LENGTH } from '../config.js'
import useLanguage from '../i18n/useLanguage.js'

const PALETTES = ['default', 'contrast']
const MOTIONS = ['system', 'reduce', 'full']

export default function Settings() {
    const { t } = useLanguage()
    const [prefs, setPrefs] = useState(getPrefs)
    const [username, setUsername] = useState(getUsername)
    const [message, setMessage] = useState('')

    function change(key, value) {
        const next = { ...prefs, [key]: value }
        setPrefs(next)
        savePrefs(next)
        applyPrefs(next)
    }

    async function rename(event) {
        event.preventDefault()
        const name = username.trim()
        if (!name) return
        try {
            await renamePlayer(name)
            saveUsername(name)
            setMessage('settings.saved')
        } catch (error) {
            if (error.status === 409) setMessage('welcome.taken')
            else if (error.status === 400) setMessage('welcome.invalid')
            else setMessage('settings.offline')
        }
    }

    return (
        <section className="settings flex w-full max-w-md flex-col items-center gap-8">
            <h2 className="page-title">{t('pages.settings')}</h2>

            <form className="flex w-full flex-col gap-3 border-[3px] border-ink bg-card p-5 shadow-hard" onSubmit={rename}>
                <label className="text-sm font-bold uppercase" htmlFor="settings-username">{t('settings.username')}</label>
                <input id="settings-username" className="field" maxLength={USERNAME_MAX_LENGTH} value={username} onChange={(event) => setUsername(event.target.value)} required />
                <button className="btn" type="submit">{t('settings.save')}</button>
                {message && <p className="notice">{t(message)}</p>}
            </form>

            <div className="flex flex-col items-center gap-3">
                <h3 className="text-sm font-bold uppercase">{t('settings.palette')}</h3>
                <Tabs tabs={PALETTES.map((id) => ({ id, label: t(`settings.palette.${id}`) }))} active={prefs.palette} onChange={(value) => change('palette', value)} />
                <div className="flex w-56 gap-1" aria-hidden="true">
                    {['correct', 'present', 'absent'].map((status) => <span key={status} className={`tile ${status}`}><b>A</b></span>)}
                </div>
            </div>

            <div className="flex flex-col items-center gap-3">
                <h3 className="text-sm font-bold uppercase">{t('settings.motion')}</h3>
                <Tabs tabs={MOTIONS.map((id) => ({ id, label: t(`settings.motion.${id}`) }))} active={prefs.motion} onChange={(value) => change('motion', value)} />
            </div>
        </section>
    )
}
