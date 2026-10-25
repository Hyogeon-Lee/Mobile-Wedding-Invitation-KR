import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { BotanicalDivider, GlowPulse, LightBloom, LightLeak, PetalDrift, type GlowPulseProps } from './index'

const count = (html: string, needle: string) => html.split(needle).length - 1

describe('effects markup', () => {
  it('hides every decorative layer from assistive tech and pointer events', () => {
    for (const el of [
      createElement(LightBloom),
      createElement(LightLeak),
      createElement(PetalDrift),
      createElement(BotanicalDivider),
    ]) {
      const html = renderToStaticMarkup(el)
      expect(html.startsWith('<div aria-hidden="true"')).toBe(true)
      expect(html).toContain('pointer-events-none')
      expect(html).toContain('overflow-hidden')
    }
  })

  it('LightBloom renders six blobs with the requested tints', () => {
    const html = renderToStaticMarkup(createElement(LightBloom, { palette: ['sage'], intensity: 'medium' }))
    expect(count(html, 'fx-bloom-blob')).toBe(6)
    expect(count(html, 'var(--fx-glow-sage)')).toBe(6)
    expect(html).toContain('z-0')
  })

  it('PetalDrift clamps the count and keeps only four petals for reduced motion', () => {
    expect(count(renderToStaticMarkup(createElement(PetalDrift)), 'fx-petal-fall')).toBe(12)
    expect(count(renderToStaticMarkup(createElement(PetalDrift, { count: 50 })), 'fx-petal-fall')).toBe(18)
    expect(count(renderToStaticMarkup(createElement(PetalDrift, { count: 10, density: 'light' })), 'fx-petal-fall')).toBe(6)
    const html = renderToStaticMarkup(createElement(PetalDrift, { count: 12 }))
    expect(count(html, 'fx-motion-only')).toBe(8)
  })

  it('GlowPulse keeps children accessible and hides only the glow', () => {
    const html = renderToStaticMarkup(createElement(GlowPulse, { color: 'mint', size: 160 } as GlowPulseProps, 'D-30'))
    expect(html).toContain('D-30')
    expect(html).toContain('width:160px')
    expect(html.startsWith('<div aria-hidden')).toBe(false)
  })

  it('LightLeak clamps the interval', () => {
    expect(renderToStaticMarkup(createElement(LightLeak, { interval: 1 }))).toContain('--fx-interval:4s')
  })
})
