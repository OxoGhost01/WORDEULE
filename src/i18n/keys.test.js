import { describe, expect, it } from 'vitest'
import en from './en.js'
import fr from './fr.js'

describe('translations', () => {
    it('have the same keys in English and in French', () => {
        const missingInFrench = Object.keys(en).filter((key) => !(key in fr))
        const missingInEnglish = Object.keys(fr).filter((key) => !(key in en))
        expect(missingInFrench).toEqual([])
        expect(missingInEnglish).toEqual([])
    })
})
