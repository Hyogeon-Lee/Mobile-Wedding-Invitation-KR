// Hex copies of the tokens in src/index.css and src/effects/effects.css, used when a token is not hex
const FALLBACK: Record<string, string> = {
  '--color-accent': '#377656',
  '--color-sage': '#b0d9b9',
  '--fx-petal-mint': '#b8e0c2',
  '--color-orange': '#d9671f',
}

function token(name: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  // canvas-confetti parses hex only
  return /^#[0-9a-f]{3,8}$/i.test(value) ? value : FALLBACK[name]
}

interface BurstOrigin {
  /** 0..1 across the viewport width */
  x: number
  /** 0..1 down the viewport height */
  y: number
}

/** Imports canvas-confetti on first use so it stays out of the initial bundle */
export async function burstConfetti(origin: BurstOrigin): Promise<void> {
  const { default: confetti } = await import('canvas-confetti')
  await confetti({
    particleCount: 28,
    spread: 60,
    startVelocity: 16,
    gravity: 0.6,
    decay: 0.92,
    scalar: 0.75,
    ticks: 180,
    origin,
    colors: [token('--color-accent'), token('--color-sage'), token('--fx-petal-mint'), token('--color-orange')],
    disableForReducedMotion: true,
    zIndex: 60,
  })
}
