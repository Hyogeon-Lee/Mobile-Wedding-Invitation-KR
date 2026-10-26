import { useId, useRef } from 'react'
import { useInViewPause } from './useInViewPause'

export function LeafShade() {
  const ref = useRef<HTMLDivElement>(null)
  const gradientId = useId()
  useInViewPause(ref)

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="fx-leaf-shade fx-anim" viewBox="0 0 260 420" fill="none" focusable="false">
        <defs>
          <radialGradient id={gradientId}>
            <stop stopColor="currentColor" stopOpacity="0.5" />
            <stop offset="0.55" stopColor="currentColor" stopOpacity="0.2" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M-20 0C40 80 70 185 168 340" stroke="currentColor" strokeOpacity="0.08" strokeWidth="2" />
        <g fill={`url(#${gradientId})`}>
          <ellipse cx="40" cy="70" rx="34" ry="76" transform="rotate(-42 40 70)" />
          <ellipse cx="109" cy="90" rx="32" ry="70" transform="rotate(38 109 90)" />
          <ellipse cx="43" cy="163" rx="36" ry="74" transform="rotate(-52 43 163)" />
          <ellipse cx="145" cy="177" rx="31" ry="72" transform="rotate(38 145 177)" />
          <ellipse cx="91" cy="257" rx="30" ry="65" transform="rotate(-50 91 257)" />
          <ellipse cx="184" cy="266" rx="27" ry="64" transform="rotate(30 184 266)" />
        </g>
      </svg>
    </div>
  )
}
