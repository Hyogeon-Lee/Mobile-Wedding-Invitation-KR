import { useRef } from 'react'
import { useInViewPause } from './useInViewPause'

export function Daylight() {
  const ref = useRef<HTMLDivElement>(null)
  useInViewPause(ref)

  return (
    <div ref={ref} aria-hidden="true" className="fx-daylight pointer-events-none absolute inset-0 overflow-hidden">
      <div className="fx-daylight-rays fx-anim" />
      <div className="fx-daylight-air fx-anim" />
    </div>
  )
}
