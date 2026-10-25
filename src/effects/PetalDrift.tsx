import { useMemo, useRef } from 'react'
import { PETAL_DEFAULT, PETAL_MAX, petalParams, type PetalShape } from './petals'
import type { FxStyle } from './types'
import { useInViewPause } from './useInViewPause'

export interface PetalDriftProps {
  /** Number of leaves/petals, clamped 1–18. Default 12 */
  count?: number
  /** Layout seed; change it to vary positions between sections. Default 1 */
  seed?: number
  /** 'light' renders 60% of `count`. Default 'normal' */
  density?: 'light' | 'normal'
  className?: string
}

/** Petals that stay visible (static) under prefers-reduced-motion. */
const REDUCED_KEEP = 4

function Shape({ shape }: { shape: PetalShape }) {
  if (shape === 'leaf') {
    return (
      <>
        <path d="M12 2C17.5 6.5 19 13 12 22C5 13 6.5 6.5 12 2Z" fill="currentColor" />
        <path d="M12 5.5V19" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.8" strokeLinecap="round" />
      </>
    )
  }
  if (shape === 'petal') {
    return (
      <path
        d="M12 5.5C13 3.5 15.5 2.5 17.5 4C20.5 6.5 19 13 15.5 17.5C14 19.5 13 21 12 21C11 21 10 19.5 8.5 17.5C5 13 3.5 6.5 6.5 4C8.5 2.5 11 3.5 12 5.5Z"
        fill="currentColor"
      />
    )
  }
  return (
    <>
      <path d="M12 22C12 15 11 9 13 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <ellipse cx="8.5" cy="12" rx="3.6" ry="1.9" transform="rotate(-30 8.5 12)" fill="currentColor" />
      <ellipse cx="15.5" cy="9" rx="3.6" ry="1.9" transform="rotate(30 15.5 9)" fill="currentColor" />
      <ellipse cx="13" cy="3.6" rx="1.9" ry="2.8" fill="currentColor" />
    </>
  )
}

/**
 * Small leaves and petals drifting down on air currents: an outer wrapper falls linearly while
 * an inner wrapper sways sideways and rotates. Fill a `relative overflow-hidden` parent.
 */
export function PetalDrift({ count = PETAL_DEFAULT, seed = 1, density = 'normal', className = '' }: PetalDriftProps) {
  const ref = useRef<HTMLDivElement>(null)
  useInViewPause(ref)

  const n = Math.min(PETAL_MAX, Math.max(1, Math.round((density === 'light' ? 0.6 : 1) * (count || 0)) || 1))
  const items = useMemo(() => Array.from({ length: n }, (_, i) => petalParams(i, seed)), [n, seed])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`fx-petals pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {items.map((p, i) => {
        const fall: FxStyle = {
          left: `${p.x}%`,
          width: `${p.size}px`,
          marginLeft: `${-p.size / 2}px`,
          '--fx-fall-dur': `${p.duration}s`,
          '--fx-fall-delay': `${p.delay}s`,
          '--fx-rest': `${p.restY}%`,
        }
        const sway: FxStyle = {
          width: `${p.size}px`,
          height: `${p.size}px`,
          opacity: p.opacity,
          color: `var(--fx-petal-${p.color})`,
          '--fx-sway': `${p.swayAmplitude}px`,
          '--fx-sway-dur': `${p.swayDuration}s`,
          '--fx-sway-delay': `${p.swayDelay}s`,
          '--fx-rot-a': `${p.rotateFrom}deg`,
          '--fx-rot-b': `${p.rotateTo}deg`,
        }
        return (
          <div
            key={i}
            className={`fx-petal-fall fx-anim${i >= REDUCED_KEEP ? ' fx-motion-only' : ''}`}
            style={fall}
          >
            <span className="fx-petal-sway fx-anim" style={sway}>
              <svg viewBox="0 0 24 24" width="100%" height="100%" focusable="false">
                <Shape shape={p.shape} />
              </svg>
            </span>
          </div>
        )
      })}
    </div>
  )
}
