import { ReactLenis } from 'lenis/react'
import type { ReactNode } from 'react'
import 'lenis/dist/lenis.css'
import { SCROLL_OPTIONS } from '@/lib/motion'

/** Lenis smooth scroll on the window. Disabled automatically for reduced-motion users. */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{ autoRaf: true, lerp: 0.1, smoothWheel: true, syncTouch: false, respectReducedMotion: true, anchors: SCROLL_OPTIONS }}
    >
      {children}
    </ReactLenis>
  )
}
