import { useRef } from 'react'
import type { FxStyle, GlowTint } from './types'
import { useInViewPause } from './useInViewPause'

export type BloomTint = GlowTint

export interface LightBloomProps {
  /** Tints cycled across the blobs. Default ['butter', 'mint', 'blush'] */
  palette?: BloomTint[]
  /** Opacity range of the blobs. Default 'soft' */
  intensity?: 'soft' | 'medium'
  className?: string
}

/** x/y: centre in % of the layer; size: diameter in % of layer width; dx/dy: drift in px; dur/delay in s. */
const BLOBS = [
  { x: 16, y: 20, size: 80, dx: 28, dy: 18, dur: 22, delay: -4 },
  { x: 84, y: 12, size: 66, dx: -24, dy: 22, dur: 27, delay: -11 },
  { x: 58, y: 48, size: 92, dx: -18, dy: -26, dur: 31, delay: -7 },
  { x: 10, y: 72, size: 72, dx: 30, dy: -16, dur: 19, delay: -13 },
  { x: 90, y: 80, size: 78, dx: -26, dy: -20, dur: 25, delay: -2 },
  { x: 42, y: 94, size: 62, dx: 20, dy: -24, dur: 17, delay: -9 },
] as const

const OPACITY = {
  soft: { lo: 0.32, mid: 0.48, hi: 0.62 },
  medium: { lo: 0.48, mid: 0.66, hi: 0.85 },
} as const

const DEFAULT_PALETTE: BloomTint[] = ['butter', 'mint', 'blush']

/**
 * Background layer of large, slowly drifting and breathing light blobs.
 * Place inside a `Bleed` or a `relative isolate overflow-hidden` parent; content above it needs `relative z-10`.
 */
export function LightBloom({ palette = DEFAULT_PALETTE, intensity = 'soft', className = '' }: LightBloomProps) {
  const ref = useRef<HTMLDivElement>(null)
  useInViewPause(ref)
  const tints = palette.length > 0 ? palette : DEFAULT_PALETTE
  const o = OPACITY[intensity]

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`fx-bloom pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
    >
      {BLOBS.map((b, i) => {
        // Small per-blob variation so the layer never looks uniform.
        const k = 1 - (i % 3) * 0.08
        const style: FxStyle = {
          left: `${b.x}%`,
          top: `${b.y}%`,
          width: `${b.size}%`,
          // Percent margins resolve against the container width, matching the width-based size.
          marginLeft: `${-b.size / 2}%`,
          marginTop: `${-b.size / 2}%`,
          '--fx-tint': `var(--fx-glow-${tints[i % tints.length]})`,
          '--fx-dx': `${b.dx}px`,
          '--fx-dy': `${b.dy}px`,
          '--fx-dur': `${b.dur}s`,
          '--fx-delay': `${b.delay}s`,
          '--fx-o-lo': +(o.lo * k).toFixed(2),
          '--fx-o-mid': +(o.mid * k).toFixed(2),
          '--fx-o-hi': +(o.hi * k).toFixed(2),
        }
        return <div key={i} className="fx-bloom-blob fx-anim" style={style} />
      })}
    </div>
  )
}
