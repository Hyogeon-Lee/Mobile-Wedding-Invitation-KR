import type { CSSProperties } from 'react'

export type FadeEdge = 'none' | 'y' | 'top' | 'bottom'

/** Fixed-length feathering mask, also set as -webkit-mask-image for older WebViews */
export function fadeMask(edge: FadeEdge, fade = '10rem'): CSSProperties {
  const g =
    edge === 'y'
      ? `linear-gradient(to bottom, transparent 0, #000 ${fade}, #000 calc(100% - ${fade}), transparent 100%)`
      : edge === 'top'
        ? `linear-gradient(to bottom, transparent 0, #000 ${fade})`
        : edge === 'bottom'
          ? `linear-gradient(to bottom, #000 0, #000 calc(100% - ${fade}), transparent 100%)`
          : undefined
  return g ? { maskImage: g, WebkitMaskImage: g } : {}
}
