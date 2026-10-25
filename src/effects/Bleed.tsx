import type { CSSProperties, ReactNode } from 'react'
import { fadeMask, type FadeEdge } from './fadeMask'

export interface BleedProps {
  /** CSS length; negative values reach into the section above. Default 0 unless only `bottom` is set */
  top?: string
  /** CSS length; negative values reach into the section below. Default 0 unless only `top` is set */
  bottom?: string
  /** Edges to feather. Default 'none' */
  mask?: FadeEdge
  /** Length of each feather. Default '10rem' */
  fade?: string
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/**
 * Decorative layer that may extend past its section (negative top/bottom), so light and leaves cross boundaries.
 * Paints at -z-10 in <main>'s stacking context, under every section's content. Static itself (0 animated nodes).
 * Effects inside keep their `absolute inset-0 z-0` layout.
 */
export function Bleed({ top, bottom, mask = 'none', fade = '10rem', className = '', style, children }: BleedProps) {
  const box: CSSProperties = {
    top: top ?? (bottom === undefined ? 0 : undefined),
    bottom: bottom ?? (top === undefined ? 0 : undefined),
  }
  return (
    <div
      aria-hidden="true"
      className={`fx-bleed pointer-events-none absolute inset-x-0 -z-10 overflow-hidden ${className}`}
      style={{ ...box, ...fadeMask(mask, fade), ...style }}
    >
      {children}
    </div>
  )
}
