import { describe, expect, it } from 'vitest'
import evaluate from '../../shared/evaluate.js'
import shareText from './share.js'

const row = (guess, word) => ({ guess, results: [evaluate(guess, word)] })

describe('shareText', () => {
    it('shows the colors of each guess and no letter', () => {
        const text = shareText('classic', [row('BUMPY', 'CRANE'), row('CRANE', 'CRANE')], 1, 6)
        const [header, ...lines] = text.split('\n')
        expect(header).toBe('WORDEULE classic 2/6')
        expect(lines).toEqual(['⬛⬛⬛⬛⬛', '🟦🟦🟦🟦🟦'])
    })

    it('writes X when the game is lost', () => {
        expect(shareText('classic', [row('BUMPY', 'CRANE')], 1, 1).split('\n')[0]).toBe('WORDEULE classic X/1')
    })
})
