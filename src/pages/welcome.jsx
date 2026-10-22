import { useState } from 'react'

export default function Welcome({ onSave }) {
	const [username, setUsername] = useState('')

	function handleSubmit(event) {
		event.preventDefault()
		const name = username.trim()
		if (name) onSave(name)
	}

	return (
		<main className="welcome">
			<h1>Welcome to Wordeule !</h1>
			<form onSubmit={handleSubmit}>
                <p>
                    Welcome to a way better version of the famous game WORDLE. This is way
                    better than anything you've ever seen until now. Play this with your friends,
                    family, dog, or even benbi (at your own risk)

                    Have fun with many different modes, and pick from any possible level of difficulty that you could
                    wish for with the custom mode. But first...
                </p> 
				<label htmlFor="username">Choose a username</label>
				<input
					id="username"
					autoComplete="nickname"
					maxLength={24}
					value={username}
					onChange={(event) => setUsername(event.target.value)}
					required
				/>
				<button type="submit">Continue</button>
			</form>
		</main>
	)
}