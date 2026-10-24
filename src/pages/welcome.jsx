import { useState } from 'react'
import { USERNAME_MAX_LENGTH } from '../config.js'
import LanguageSwitch from '../components/languageswitch.jsx'
import useLanguage from '../i18n/useLanguage.js'

// First page of a new player: asks a username (shown on the leaderboard), then calls onSave
export default function Welcome({ onSave }) {
	const { t } = useLanguage()
	const [username, setUsername] = useState('')

	function handleSubmit(event) {
		event.preventDefault()
		const name = username.trim()
		if (name) onSave(name)
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
				<button className="btn" type="submit">{t('welcome.continue')}</button>
			</form>
		</main>
	)
}