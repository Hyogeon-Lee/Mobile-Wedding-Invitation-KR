import { useLenis } from 'lenis/react'
import { ALargeSmall, ArrowUp } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import Button from '@/components/Button'
import Reveal from '@/components/Reveal'
import { wedding } from '@/config/wedding'
import { BotanicalDivider, LightBloom } from '@/effects'
import { applyTextLg, readTextLg, scrollTopBehavior, writeTextLg } from './textSize'

/**
 * Compact page footer: botanical sprig, couple names, credit, and two utilities
 * (large-text toggle persisted in localStorage, scroll to top), over a faint butter light bloom.
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
    <footer id="footer" className="relative isolate overflow-hidden px-6 pt-4 pb-12 text-center">
      <LightBloom palette={['butter']} intensity="soft" className="opacity-70" />
      <Reveal className="relative z-10">
        <BotanicalDivider variant="sprig" className="mb-2" />
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
