import evaluate, { shownGuesses } from './evaluate.js'

import { SHARE_EMOJI } from '../config.js'

// Text to share a finished game: the colors of every guess, without any letter
export default function shareText(title, answers, guesses, maxTries) {
    const won = answers.every((word) => guesses.includes(word))
    const header = `WORDEULE ${title} ${won ? guesses.length : 'X'}/${maxTries}`

    // one block of lines per grid
    const grids = answers.map((word) =>
        shownGuesses(guesses, word)
            .map((guess) => evaluate(guess, word).map((status) => SHARE_EMOJI[status]).join(''))
            .join('\n'))

    return `${header}\n${grids.join('\n\n')}`
}
