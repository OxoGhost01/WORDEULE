import { useState } from 'react'

export default function Welcome({ onSave }) {
	const [username, setUsername] = useState('')

	function handleSubmit(event) {
		event.preventDefault()
		const name = username.trim()
		if (name) onSave(name)
	}

	return (
		<main className="welcome mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center gap-6 px-4 py-10">
			<h1 className="page-title">Welcome to Wordeule !</h1>
			<form className="flex flex-col gap-4 -rotate-1 border-[3px] border-ink bg-card p-6 shadow-hard-lg" onSubmit={handleSubmit}>
                <p className="leading-relaxed">
                    Welcome to a way better version of the famous game WORDLE. This is way
                    better than anything you've ever seen until now. Play this with your friends,
                    family, dog, or even benbi (at your own risk)

                    Have fun with many different modes, and pick from any possible level of difficulty that you could
                    wish for with the custom mode. But first...
                </p> 
				<label className="text-sm font-bold uppercase" htmlFor="username">Choose a username</label>
				<input
					className="field"
					id="username"
					autoComplete="nickname"
					maxLength={24}
					value={username}
					onChange={(event) => setUsername(event.target.value)}
					required
				/>
				<button className="btn" type="submit">Continue</button>
			</form>
		</main>
	)
}