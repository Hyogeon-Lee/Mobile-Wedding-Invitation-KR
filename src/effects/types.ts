import type { CSSProperties } from 'react'

/** Inline style that also accepts CSS custom properties (`--fx-*`). */
export type FxStyle = CSSProperties & Record<`--${string}`, string | number>

export type GlowTint = 'butter' | 'mint' | 'blush' | 'sage'
