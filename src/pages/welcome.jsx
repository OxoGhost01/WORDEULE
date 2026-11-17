import { useState } from 'react'
import { USERNAME_MAX_LENGTH } from '../config.js'
import { registerPlayer } from '../data/api.js'
import LanguageSwitch from '../components/languageswitch.jsx'
import useLanguage from '../i18n/useLanguage.js'

// First page of a new player: asks a username (shown on the leaderboard), then calls onSave
export default function Welcome({ onSave }) {
	const { t } = useLanguage()
	const [username, setUsername] = useState('')
	const [error, setError] = useState('')
	const [busy, setBusy] = useState(false)

	async function handleSubmit(event) {
		event.preventDefault()
		const name = username.trim()
		if (!name) return
		setBusy(true)
		setError('')
		try {
			await registerPlayer(name)
			onSave(name)
		} catch (failure) {
			if (failure.status === 409) setError('welcome.taken')
			else if (failure.status === 400) setError('welcome.invalid')
			else onSave(name)
		} finally {
			setBusy(false)
		}
	}

	return (
		<main className="welcome mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center gap-6 px-4 py-10">
			<LanguageSwitch />
			<h1 className="page-title">{t('welcome.title')}</h1>
			<form className="flex flex-col gap-4 -rotate-1 border-[3px] border-ink bg-card p-6 shadow-hard-lg" onSubmit={handleSubmit}>
                <p className="leading-relaxed">{t('welcome.intro')}</p>
				<label className="text-sm font-bold uppercase" htmlFor="username">{t('welcome.username')}</label>
				<input
					className="field"
					id="username"
					autoComplete="nickname"
					maxLength={USERNAME_MAX_LENGTH}
					value={username}
					onChange={(event) => setUsername(event.target.value)}
					required
				/>
				{error && <p className="notice">{t(error)}</p>}
				<button className="btn" type="submit" disabled={busy}>{t('welcome.continue')}</button>
			</form>
		</main>
	)
}