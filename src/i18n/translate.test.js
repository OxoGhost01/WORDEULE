import { describe, expect, it } from 'vitest'
import { translate } from './translate.js'

describe('translate', () => {
    it('gives the text of a key in the language', () => {
        expect(translate('en', 'game.share')).toBe('Share')
        expect(translate('fr', 'game.share')).toBe('Partager')
    })

    it('replaces the values', () => {
        expect(translate('en', 'game.won', { tries: 3, max: 6 })).toBe('Won in 3 / 6')
        expect(translate('fr', 'game.won', { tries: 3, max: 6 })).toBe('Gagné en 3 / 6')
    })

    it('shows the key when no language has it', () => {
        expect(translate('fr', 'does.not.exist')).toBe('does.not.exist')
    })
})
