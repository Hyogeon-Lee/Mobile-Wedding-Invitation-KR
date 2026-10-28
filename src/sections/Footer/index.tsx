import { useLenis } from 'lenis/react'
import { ALargeSmall, ArrowUp } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import Button from '@/components/Button'
import Reveal from '@/components/Reveal'
import { wedding } from '@/config/wedding'
import { Bleed, Daylight } from '@/effects'
import { SCROLL_OPTIONS } from '@/lib/motion'
import { applyTextLg, readTextLg, scrollTopBehavior, writeTextLg } from './textSize'

/** Not wrapped in <Section>: the footer has no heading and a tighter rhythm */
export default function Footer() {
  const { groom, bride } = wedding.couple
  const { credit } = wedding.footer
  const reduce = useReducedMotion() === true
  const lenis = useLenis()
  const [textLg, setTextLg] = useState(() => readTextLg())

  // Keeps the class on <html> in sync with state, including the value restored from storage
  useEffect(() => {
    applyTextLg(document.documentElement, textLg)
  }, [textLg])

  const toggleTextLg = () => {
    const next = !textLg
    writeTextLg(next)
    setTextLg(next)
  }

  const scrollToTop = () => {
    const behavior = scrollTopBehavior(reduce)
    // Lenis owns the scroll when mounted, and a native smooth scroll would fight its raf loop
    if (lenis && behavior === 'smooth') {
      lenis.scrollTo(0, SCROLL_OPTIONS)
      return
    }
    window.scrollTo({ top: 0, behavior })
  }

  return (
    <footer id="footer" className="relative px-6 pt-6 pb-12 text-center">
      {/* Light rises from under the Share buttons and never reaches past the page end */}
      <Bleed top="-14rem" bottom="0" mask="top" fade="14rem">
        <Daylight />
      </Bleed>
      <Reveal className="relative z-10">
        <p className="font-serif text-[1.0625rem] leading-relaxed text-ink">
          {groom.name} · {bride.name}
        </p>
        <p className="mt-2 font-serif font-normal! text-[0.875rem] text-ink-muted">{credit}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            aria-pressed={textLg}
            onClick={toggleTextLg}
            className="aria-pressed:border-accent/70 aria-pressed:text-accent"
          >
            <ALargeSmall size={16} aria-hidden="true" />
            글자 크게 보기
          </Button>
          <Button size="sm" variant="ghost" onClick={scrollToTop}>
            <ArrowUp size={14} aria-hidden="true" />
            맨 위로
          </Button>
        </div>
      </Reveal>
    </footer>
  )
}
