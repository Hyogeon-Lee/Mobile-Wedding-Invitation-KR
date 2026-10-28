import { describe, expect, it } from 'vitest'
import lettering from './opening-lettering.json'
import { letteringStrokes, OPENING_DURATION_SECONDS, OPENING_FADE_SECONDS, underlineStrokes } from './opening-motion'

describe('opening handwriting', () => {
  it('draws each continuous stroke separately instead of restarting the dash on every letter at once', () => {
    expect(letteringStrokes.map(({ d }) => d)).toEqual(lettering.flat().map(({ d }) => d))
    expect(letteringStrokes.length).toBeGreaterThan(lettering.length)
    for (const { d, length } of lettering.flat()) {
      expect(d.match(/[Mm]/g)).toHaveLength(1)
      expect(Number.isFinite(length) && length > 0).toBe(true)
    }
  })

  it('finishes each stroke before starting the next and pauses between words', () => {
    const strokes = [...letteringStrokes, ...underlineStrokes]
    for (let i = 1; i < strokes.length; i++) {
      expect(strokes[i].delay).toBeGreaterThan(strokes[i - 1].delay + strokes[i - 1].duration)
    }
    let offset = 0
    for (const word of lettering.slice(0, -1)) {
      offset += word.length
      const previous = letteringStrokes[offset - 1]
      expect(letteringStrokes[offset].delay - previous.delay - previous.duration).toBeGreaterThan(0.12)
    }
    expect(letteringStrokes[0].duration).toBeGreaterThan(letteringStrokes[2].duration)
  })

  it('holds the completed lettering before a gradual cover transition', () => {
    const last = underlineStrokes.at(-1)!
    expect(OPENING_DURATION_SECONDS - last.delay - last.duration).toBeGreaterThanOrEqual(1)
    expect(OPENING_FADE_SECONDS).toBeGreaterThanOrEqual(1.5)
  })
})
