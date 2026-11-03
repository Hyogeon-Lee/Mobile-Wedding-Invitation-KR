import type { ReactElement } from 'react'

export type LineArtName = 'rings' | 'envelope' | 'card' | 'couple' | 'plane'

const BG = 'var(--color-bg)'

/** Tiny filled heart centred on (x, y); s is its half-width */
const heart = (x: number, y: number, s: number) =>
  `M${x} ${y + 0.9 * s}C${x - 1.6 * s} ${y - 0.2 * s} ${x - 0.8 * s} ${y - 1.1 * s} ${x} ${y - 0.4 * s}C${x + 0.8 * s} ${y - 1.1 * s} ${x + 1.6 * s} ${y - 0.2 * s} ${x} ${y + 0.9 * s}Z`

const Heart = ({ x, y, s }: { x: number; y: number; s: number }) => <path d={heart(x, y, s)} fill="var(--color-orange)" stroke="none" />

function Rings() {
  return (
    <svg viewBox="0 0 72 40" width="72" height="40" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="27" cy="23" r="11" />
        <circle cx="45" cy="23" r="11" />
        <path d="M60 5v6M57 8h6M12 6l2 2M12 8l2-2" />
      </g>
      <Heart x={36} y={6} s={3} />
    </svg>
  )
}

function Envelope() {
  return (
    <svg viewBox="0 0 72 48" width="72" height="48" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="12" y="14" width="48" height="30" rx="3" />
        <path d="M12 17l24 17 24-17" />
        <path d="M12 42l17-14M60 42L43 28" />
      </g>
      <Heart x={36} y={32} s={3.5} />
    </svg>
  )
}

/** Reply card with a ticked box */
function Card() {
  return (
    <svg viewBox="0 0 72 48" width="72" height="48" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="10" y="9" width="52" height="32" rx="3" />
        <circle cx="22" cy="25" r="6" />
        <path d="M19.2 25.2l2.2 2.2 4-4.5" />
        <path d="M34 21.5h18M34 28.5h12" />
      </g>
      <Heart x={56} y={14} s={2.3} />
    </svg>
  )
}

/** Groom and bride holding hands */
function Couple() {
  return (
    <svg viewBox="0 0 96 56" width="96" height="56" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 21h16v24a3 3 0 0 1-3 3H26a3 3 0 0 1-3-3z" fill={BG} />
        <path d="M27 21l4 7 4-7M31 30v10" />
        <path d="M30.2 22.3l-2-1.2v2.4zM31.8 22.3l2-1.2v2.4z" fill="currentColor" />
        <path d="M27 45v6M35 45v6M25.5 51h3.5M33 51h3.5" />
        <path d="M23 26c-3 3-4 7-3 11M39 26c4 2 7 5 9 9" />
        <circle cx="31" cy="13" r="7" fill={BG} />
        <path d="M24.5 11.5c1-5.5 12-5.5 13 0" />
        <circle cx="28.5" cy="14" r="0.8" fill="currentColor" stroke="none" />
        <circle cx="33.5" cy="14" r="0.8" fill="currentColor" stroke="none" />
        <path d="M29.5 17q1.5 1.5 3 0" />

        <path d="M59 21h12v7l6 19H53l6-19z" fill={BG} />
        <path d="M59 28h12M61 47v3M69 47v3" />
        <path d="M71 25c3 3 4 7 3 11M59 25c-4 2-7 5-9 10" />
        <circle cx="65" cy="13" r="7" fill={BG} />
        <path d="M58.5 11.5c1-5.5 12-5.5 13 0M58.3 11.5c-1.5 4-1.8 8-1 12M71.7 11.5c1.5 4 1.8 8 1 12" />
        <circle cx="62.5" cy="14" r="0.8" fill="currentColor" stroke="none" />
        <circle cx="67.5" cy="14" r="0.8" fill="currentColor" stroke="none" />
        <path d="M63.5 17q1.5 1.5 3 0" />

        <circle cx="49" cy="35.5" r="2" fill={BG} />
      </g>
      <Heart x={59.5} y={7.5} s={1.6} />
      <Heart x={48} y={16} s={3} />
    </svg>
  )
}

function Plane() {
  return (
    <svg viewBox="0 0 96 48" width="96" height="48" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M84 10L22 30l20 7 5 9 9-13z" fill={BG} />
        <path d="M42 37l42-27" />
        <path d="M6 40c6-4 10-2 16-6" strokeDasharray="2 3.5" />
      </g>
      <Heart x={4} y={34} s={2.5} />
    </svg>
  )
}

const ART: Record<LineArtName, () => ReactElement> = {
  rings: Rings,
  envelope: Envelope,
  card: Card,
  couple: Couple,
  plane: Plane,
}

/** Static ornament drawn in the current text colour; decorative, so hidden from assistive tech */
export default function LineArt({ name }: { name: LineArtName }) {
  const Art = ART[name]
  return <Art />
}
