import { useLenis } from 'lenis/react'
import { ALargeSmall, ArrowUp } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import Button from '@/components/Button'
import Reveal from '@/components/Reveal'
import { wedding } from '@/config/wedding'
import { SCROLL_OPTIONS } from '@/lib/motion'
import { applyTextLg, readTextLg, scrollTopBehavior, writeTextLg } from './textSize'

/** Not wrapped in <Section>: the footer has no heading and a tighter rhythm */
export default function Footer() {
  const { credit, message, photo } = wedding.footer
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
    <footer id="footer" className="relative px-6 pt-16 pb-12 text-center">
      <Reveal className="relative z-10">
        {photo && (
          <img src={photo.src} width={photo.width} height={photo.height} alt={photo.alt} loading="lazy" decoding="async" className="mb-8 block h-auto w-full" />
        )}
        {message && <p className="font-serif text-[1.0625rem] leading-[2] whitespace-pre-line text-ink">{message}</p>}
        <p className="mt-5 font-serif font-normal! text-[0.9375rem] text-ink-muted">{credit}</p>

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
