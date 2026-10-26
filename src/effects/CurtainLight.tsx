import { useMemo, useRef } from 'react'
import { clampBands, curtainBandSpan, curtainDrift, curtainParams } from './curtain'
import type { FxStyle } from './types'
import { useInViewPause } from './useInViewPause'

export type CurtainTone = 'warm' | 'neutral'

export interface CurtainLightProps {
  /** Number of light bands, clamped 3–10. Default 6 */
  bands?: number
  /** 'warm': warm-white bands and a butter wash; 'neutral': white bands and a sky wash. Default 'warm' */
  tone?: CurtainTone
  /** Band opacity 0.5–0.65 (soft) or 0.5–0.8 (medium), plus a stronger wash. Default 'soft' */
  intensity?: 'soft' | 'medium'
  /** Lean of the bands in deg, clamped -45–45. Default -15 */
  angle?: number
  /** Layout seed; change it to vary band positions between sections. Default 1 */
  seed?: number
  className?: string
}

/**
 * Peak alpha of the corner wash. The wash is the only part darker than the page background, so
 * these caps keep text-ink-muted ≥ 4.5:1 over it (warm 0.55 → 4.91:1, neutral 0.34 → 4.91:1 on bg).
 */
const WASH_ALPHA = {
  warm: { soft: 0.4, medium: 0.55 },
  neutral: { soft: 0.26, medium: 0.34 },
} as const

/** Breathing range around each band's base opacity (±15%). */
const BREATHE = 0.15

/**
 * Sunlight through sheer curtains: soft, leaning vertical bands of light over a faint window wash
 * from the top-right corner. The band group drifts sideways very slowly while each band breathes.
 * Place inside a `Bleed` or a `relative isolate overflow-hidden` parent; content above it needs `relative z-10`.
 */
export function CurtainLight({
  bands,
  tone = 'warm',
  intensity = 'soft',
  angle = -15,
  seed = 1,
  className = '',
}: CurtainLightProps) {
  const ref = useRef<HTMLDivElement>(null)
  useInViewPause(ref)

  const n = clampBands(bands)
  const items = useMemo(() => Array.from({ length: n }, (_, i) => curtainParams(i, seed)), [n, seed])
  const drift = curtainDrift(seed)
  const lean = Number.isFinite(angle) ? Math.min(45, Math.max(-45, angle)) : -15

  const washAlpha = WASH_ALPHA[tone][intensity]
  const rootStyle: FxStyle = {
    '--fx-curtain-light': `var(--fx-curtain-light-${tone})`,
    '--fx-curtain-wash': `var(--fx-curtain-wash-${tone})`,
    '--fx-wash-a': washAlpha,
    '--fx-wash-a45': +(washAlpha * 0.45).toFixed(3),
  }
  const groupStyle: FxStyle = {
    '--fx-dur': `${drift.duration}s`,
    '--fx-delay': `${drift.delay}s`,
  }

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`fx-curtain pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
      style={rootStyle}
    >
      <div className="fx-curtain-wash fx-anim absolute inset-0" />
      <div className="fx-curtain-group fx-anim absolute inset-0" style={groupStyle}>
        {items.map((b, i) => {
          // soft maps the 0.5–0.8 base range into 0.5–0.65
          const o = intensity === 'soft' ? 0.5 + (b.opacity - 0.5) * 0.5 : b.opacity
          const rotation = +(lean + b.tilt).toFixed(1)
          // only as tall as the rotation needs, centred on the layer, so no paint is spent off-box
          const span = curtainBandSpan(rotation, b.width)
          const style: FxStyle = {
            left: `${b.x}%`,
            top: `calc(${+(-(span.pct - 100) / 2).toFixed(2)}% - ${span.px / 2}px)`,
            height: `calc(${span.pct}% + ${span.px}px)`,
            width: `${b.width}px`,
            marginLeft: `${-b.width / 2}px`,
            transform: `rotate(${rotation}deg)`,
            '--fx-band-a': b.alpha,
            '--fx-band-a85': +(b.alpha * 0.85).toFixed(3),
            '--fx-band-a35': +(b.alpha * 0.35).toFixed(3),
            '--fx-o-mid': +o.toFixed(2),
            '--fx-o-lo': +(o * (1 - BREATHE)).toFixed(2),
            '--fx-o-hi': +Math.min(1, o * (1 + BREATHE)).toFixed(2),
            '--fx-dur': `${b.breatheDuration}s`,
            '--fx-delay': `${b.breatheDelay}s`,
          }
          return <div key={i} className="fx-curtain-band fx-anim" style={style} />
        })}
      </div>
    </div>
  )
}
