import { useRef } from 'react'
import { useInViewPause } from './useInViewPause'

export interface BotanicalDividerProps {
  /** Ornament shape. Default 'sprig' */
  variant?: 'sprig' | 'dots' | 'leaf'
  className?: string
}

/** Leaf path 12 px long pointing along +x from the origin. */
const LEAF = 'M0 0C3 -3.6 9 -3.6 12 0C9 3.6 3 3.6 0 0Z'

/** [x, y, angle] for the six sprig leaves; right side mirrors the left. */
const SPRIG_LEAVES = [
  [48, 22, -140],
  [36, 18.5, 160],
  [24, 16, -155],
  [72, 22, -40],
  [84, 18.5, 20],
  [96, 16, -25],
] as const

function Sprig() {
  return (
    <>
      <path
        d="M60 24C48 22 34 17.5 14 15M60 24C72 22 86 17.5 106 15"
        fill="none"
        stroke="var(--color-accent)"
        strokeOpacity="0.55"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {SPRIG_LEAVES.map(([x, y, a], i) => (
        <path
          key={i}
          d={LEAF}
          transform={`translate(${x} ${y}) rotate(${a})`}
          fill={i % 2 === 0 ? 'var(--fx-petal-sage)' : 'var(--fx-petal-mint)'}
          fillOpacity="0.85"
        />
      ))}
      <circle cx="60" cy="20.5" r="2.4" fill="var(--color-orange)" />
    </>
  )
}

function Leaf() {
  return (
    <>
      <path d="M34 19L41 16" stroke="var(--color-accent)" strokeOpacity="0.55" strokeWidth="1" strokeLinecap="round" />
      <path d="M40 16C50 4 70 4 82 13C70 22 50 24 40 16Z" fill="var(--fx-petal-sage)" fillOpacity="0.75" />
      <path
        d="M41 16C55 14 67 12.5 80 13"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.6"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </>
  )
}

function Dots() {
  return (
    <>
      <circle cx="46" cy="14" r="2.2" fill="var(--fx-petal-sage)" fillOpacity="0.8" />
      <circle cx="60" cy="14" r="3" fill="var(--color-orange)" />
      <circle cx="74" cy="14" r="2.2" fill="var(--fx-petal-mint)" />
    </>
  )
}

/** Sway pivot per variant, in % of the 120×28 box: the stem base for sprig and leaf. */
const ORIGIN = { sprig: '50% 86%', leaf: '28% 68%', dots: '50% 50%' } as const

/** Centered, line-free botanical ornament (44 px tall) with a gentle ±2.5° sway. Decorative only. */
export function BotanicalDivider({ variant = 'sprig', className = '' }: BotanicalDividerProps) {
  const ref = useRef<HTMLDivElement>(null)
  useInViewPause(ref)

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none flex items-center justify-center overflow-hidden px-6 py-2 ${className}`}
    >
      <svg
        viewBox="0 0 120 28"
        width="120"
        height="28"
        focusable="false"
        className="fx-sway fx-anim shrink-0"
        style={{ transformOrigin: ORIGIN[variant] }}
      >
        {variant === 'sprig' ? <Sprig /> : variant === 'leaf' ? <Leaf /> : <Dots />}
      </svg>
    </div>
  )
}
