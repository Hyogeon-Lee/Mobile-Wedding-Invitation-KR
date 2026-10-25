import type { FxStyle } from './types'

export type WashTone = 'leaf' | 'mint' | 'sky'

export interface WashProps {
  /** Tint. Default 'leaf' */
  tone?: WashTone
  /** px the wash reaches above the parent; it fades in over twice this. Default 160 */
  reachTop?: number
  /** px the wash reaches below the parent; it fades out over max(2x this, 160px). Default 160 */
  reachBottom?: number
  className?: string
}

/**
 * Static, feathered tint that spills past its parent into the neighbouring sections.
 * Paints at -z-10 in the nearest stacking context (<main>), so the parent must be `relative` but never `isolate`,
 * `overflow-hidden`, transformed or z-indexed. Not animated: costs 0 nodes.
 */
export function Wash({ tone = 'leaf', reachTop = 160, reachBottom = 160, className = '' }: WashProps) {
  const style: FxStyle = { '--fx-wash-top': `${reachTop}px`, '--fx-wash-bottom': `${reachBottom}px` }
  return (
    <div
      aria-hidden="true"
      className={`fx-wash fx-wash-${tone} pointer-events-none absolute inset-x-0 -z-10 ${className}`}
      style={style}
    />
  )
}
