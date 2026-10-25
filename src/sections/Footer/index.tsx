import { useLenis } from 'lenis/react'
import { ALargeSmall, ArrowUp } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import Button from '@/components/Button'
import Reveal from '@/components/Reveal'
import { wedding } from '@/config/wedding'
import { applyTextLg, readTextLg, scrollTopBehavior, writeTextLg } from './textSize'

/**
 * Compact page footer: hairline, couple names, credit, and two utilities
 * (large-text toggle persisted in localStorage, scroll to top).
 * Not wrapped in <Section>: the footer has no heading and a tighter rhythm.
 */
export default function Footer() {
  const { groom, bride } = wedding.couple
  const { credit } = wedding.footer
  const reduce = useReducedMotion() === true
  const lenis = useLenis()
  const [textLg, setTextLg] = useState(() => readTextLg())

  // The class on <html> is derived from state; this keeps the DOM in sync, including the restored value.
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
    // Lenis owns the scroll when mounted; a native smooth scroll would fight its raf loop.
    if (lenis && behavior === 'smooth') {
      lenis.scrollTo(0)
      return
    }
    window.scrollTo({ top: 0, behavior })
  }

  return (
    <footer id="footer" className="px-6 py-10 text-center">
      <Reveal>
        <hr className="mx-auto mb-8 w-10 border-0 border-t border-line" />
        <p className="font-serif text-[1.0625rem] leading-relaxed text-ink">
          {groom.name} · {bride.name}
        </p>
        <p className="mt-2 font-display text-[0.6875rem] tracking-[0.3em] text-ink-muted uppercase">{credit}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            aria-pressed={textLg}
            onClick={toggleTextLg}
            className="aria-pressed:border-accent aria-pressed:text-accent"
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
