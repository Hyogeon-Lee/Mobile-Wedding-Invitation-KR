import { ReactLenis } from 'lenis/react'
import type { ReactNode } from 'react'

/** Lenis smooth scroll on the window. Disabled automatically for reduced-motion users. */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) return <>{children}</>
  return (
    <ReactLenis root options={{ lerp: 0.12, smoothWheel: true, syncTouch: false }}>
      {children}
    </ReactLenis>
  )
}
