import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { useLenis } from 'lenis/react'
import { wedding } from '@/config/wedding'
import { EASE_OUT, SCROLL_OPTIONS } from '@/lib/motion'
import { coverDateLine, coverVenueLine } from './format'
import Opening from './Opening'

// Reserve room for the names, date and scroll control, including large-text mode
const photoFrame =
  'block w-[min(100%,calc(54svh*3/4),max(9rem,calc((100svh_-_20rem_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))*3/4)))]'

/** Hero screen. Not wrapped in <Section>. */
export default function Cover() {
  const reduce = useReducedMotion()
  const lenis = useLenis()
  const [opening, setOpening] = useState(() =>
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    (!window.location.hash || window.location.hash === '#cover'),
  )
  const [ready, setReady] = useState(!opening)
  const finishOpening = useCallback(() => setOpening(false), [])
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    preference.addEventListener('change', finishOpening)
    return () => preference.removeEventListener('change', finishOpening)
  }, [finishOpening])
  const { couple, event, cover } = wedding
  const sectionRef = useRef<HTMLElement>(null)

  const photoImg = (
    <img
      src={cover.image.src}
      width={cover.image.width}
      height={cover.image.height}
      alt={cover.image.alt}
      loading="eager"
      fetchPriority="high"
      className="block aspect-[3/4] h-auto w-full object-cover"
    />
  )

  const scrollToNext = () => {
    const behavior: ScrollBehavior = reduce ? 'auto' : 'smooth'
    // Skip decorative siblings (e.g. a BotanicalDivider) so the cue lands on the next section
    let next = sectionRef.current?.nextElementSibling
    while (next && next.getAttribute('aria-hidden') === 'true') next = next.nextElementSibling
    if (next instanceof HTMLElement && lenis) lenis.scrollTo(next, { ...SCROLL_OPTIONS, immediate: !!reduce })
    else if (next instanceof HTMLElement) next.scrollIntoView({ behavior, block: 'start' })
    else window.scrollBy({ top: window.innerHeight, behavior })
  }

  return (
    <section
      id="cover"
      ref={sectionRef}
      aria-label="표지"
      className="relative isolate flex min-h-svh flex-col items-center overflow-hidden px-6 pt-[calc(36px+env(safe-area-inset-top))] pb-[calc(24px+env(safe-area-inset-bottom))]"
    >
      <AnimatePresence onExitComplete={() => setReady(true)}>
        {opening && <Opening key="opening" onComplete={finishOpening} />}
      </AnimatePresence>
      <div
        inert={!ready}
        className="relative z-10 flex w-full flex-1 flex-col items-center justify-center text-center"
      >
        <div className="mb-7 w-full">
          <h1 className="font-serif text-[clamp(1.5rem,8vw,2rem)] leading-snug text-ink">
            {couple.groom.name}
            <span aria-hidden="true" className="mx-3 font-display text-[1.5rem] italic text-accent">&</span>
            <span className="sr-only"> 그리고 </span>
            {couple.bride.name}
          </h1>
        </div>

        <div className={photoFrame}>{photoImg}</div>

        <div className="mt-7">
          <p className="text-[0.9375rem] leading-relaxed text-ink tabular-nums">{coverDateLine(event)}</p>
          <p className="mt-2 font-serif text-[1rem] leading-relaxed text-ink-muted">{coverVenueLine(event)}</p>
        </div>
      </div>

      <motion.button
        type="button"
        disabled={!ready}
        onClick={scrollToNext}
        aria-label="초대장 보기, 다음 내용으로 이동"
        className="pressable z-10 mt-5 inline-flex min-h-11 items-center gap-2 px-3 text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 0.6, ease: EASE_OUT }}
      >
        <span className="text-[0.875rem]">초대장 보기</span>
        <ChevronDown size={16} strokeWidth={1.5} aria-hidden="true" />
      </motion.button>
    </section>
  )
}
