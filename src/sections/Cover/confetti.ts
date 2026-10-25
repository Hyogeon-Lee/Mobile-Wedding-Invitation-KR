/**
 * Small celebratory burst for the cover photo. `canvas-confetti` is imported on first
 * use so it stays out of the initial bundle. Colors come from the CSS tokens in
 * `src/index.css` and the petal fills in `src/effects/effects.css`; the literals below are
 * only a fallback when the stylesheet is absent.
 */
const FALLBACK: Record<string, string> = {
  '--color-accent': '#587460',
  '--color-sage': '#9bb09a',
  '--fx-petal-mint': '#b4d1ac',
  '--fx-petal-blush': '#ecc3bd',
}

function token(name: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  // canvas-confetti parses hex only, so anything else falls back.
  return /^#[0-9a-f]{3,8}$/i.test(value) ? value : FALLBACK[name]
}

export interface BurstOrigin {
  /** 0..1 across the viewport width */
  x: number
  /** 0..1 down the viewport height */
  y: number
}

export async function burstConfetti(origin: BurstOrigin): Promise<void> {
  const { default: confetti } = await import('canvas-confetti')
  await confetti({
    particleCount: 60,
    spread: 70,
    startVelocity: 30,
    gravity: 0.9,
    decay: 0.92,
    scalar: 0.9,
    ticks: 180,
    origin,
    colors: [token('--color-accent'), token('--color-sage'), token('--fx-petal-mint'), token('--fx-petal-blush')],
    disableForReducedMotion: true,
    zIndex: 60,
  })
}
