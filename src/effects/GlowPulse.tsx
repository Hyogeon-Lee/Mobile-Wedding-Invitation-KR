import { useRef, type ReactNode } from 'react'
import type { FxStyle } from './types'
import { useInViewPause } from './useInViewPause'

export interface GlowPulseProps {
  /** Glow tint. Default 'butter' */
  color?: 'butter' | 'mint' | 'blush'
  /** Glow diameter in px. Default 220 */
  size?: number
  /** Extra classes for the wrapper (e.g. 'block w-full', 'mx-auto') */
  className?: string
  children: ReactNode
}

/** Wraps children with a soft radial glow behind them that slowly breathes (scale 0.9–1.1, opacity 0.5–0.9). */
export function GlowPulse({ color = 'butter', size = 220, className = '', children }: GlowPulseProps) {
  const ref = useRef<HTMLDivElement>(null)
  useInViewPause(ref)
  const glow: FxStyle = {
    width: `${size}px`,
    height: `${size}px`,
    marginLeft: `${-size / 2}px`,
    marginTop: `${-size / 2}px`,
    '--fx-tint': `var(--fx-glow-${color})`,
  }

  return (
    <div ref={ref} className={`relative isolate inline-grid place-items-center ${className}`}>
      <span aria-hidden="true" className="fx-glow fx-anim pointer-events-none absolute top-1/2 left-1/2 -z-10" style={glow} />
      {children}
    </div>
  )
}
