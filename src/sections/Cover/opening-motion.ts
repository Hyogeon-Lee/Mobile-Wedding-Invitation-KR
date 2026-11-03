import lettering from './opening-lettering.json'

const totalLength = lettering.flat().reduce((sum, stroke) => sum + stroke.length, 0)
let elapsed = 0.2

export const letteringStrokes = lettering.flatMap((word) => {
  const strokes = word.map(({ d, length }) => {
    const duration = Math.max(0.04, (length / totalLength) * 1.5)
    const stroke = { d, delay: elapsed, duration }
    elapsed += duration + 0.015
    return stroke
  })
  elapsed += 0.08
  return strokes
})

export const underlineStrokes = ['M73 226 Q150 228 247 214', 'M89 236 Q170 234 237 226'].map((d) => {
  const stroke = { d, delay: elapsed, duration: 0.16 }
  elapsed += 0.18
  return stroke
})

export const OPENING_DURATION_SECONDS = elapsed + 0.6
export const OPENING_FADE_SECONDS = 1
