import { useRef } from 'react'
import type { FxStyle } from './types'
import { useInViewPause } from './useInViewPause'

export interface LightLeakProps {
  /** Seconds per cycle (clamped 4–20). The sweep takes the first 3/7 of it. Default 7 */
  interval?: number
  className?: string
}

/**
 * Overlay for an image frame: a static pale glow in the top-left corner and a soft diagonal
 * light band that sweeps across once per `interval`. Parent must be `relative overflow-hidden`.
 */
export function LightLeak({ interval = 7, className = '' }: LightLeakProps) {
  const ref = useRef<HTMLDivElement>(null)
  useInViewPause(ref)
  const seconds = Math.min(20, Math.max(4, Number.isFinite(interval) ? interval : 7))
  const style: FxStyle = { '--fx-interval': `${seconds}s` }

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`fx-leak pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] ${className}`}
      style={style}
    >
      <div className="fx-leak-vignette absolute inset-0" />
      <div className="fx-leak-band fx-anim absolute inset-0" />
    </div>
  )
}
