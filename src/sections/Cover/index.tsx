import { useCallback, useEffect, useId, useRef, useState, type MouseEvent } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion, type TargetAndTransition, type Variants } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { useLenis } from 'lenis/react'
import { wedding } from '@/config/wedding'
import { Daylight, fadeMask, LeafShade, LightLeak, PetalDrift } from '@/effects'
import { EASE_OUT, EASE_SOFT, SCROLL_OPTIONS } from '@/lib/motion'
import { burstConfetti } from './confetti'
import { coverDateLine, coverVenueLine } from './format'
import Opening from './Opening'

const stagger: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.08 } },
}
const line: Variants = {
  hidden: { opacity: 0, y: 8 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE_SOFT } },
}
const photo: Variants = {
  hidden: { opacity: 0, scale: 0.99 },
  shown: { opacity: 1, scale: 1, transition: { duration: 1.1, ease: EASE_SOFT } },
}

// A transform string (not y) lets Motion hand the loop to WAAPI, so it runs on the compositor
const cueBob: TargetAndTransition = {
  transform: ['translateY(0px)', 'translateY(3px)', 'translateY(0px)'],
  transition: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' },
}
const cueRest: TargetAndTransition = { transform: 'translateY(0px)', transition: { duration: 0.4, ease: EASE_OUT } }

// Photo is 3:4 and at most 58svh tall. On short screens it shrinks to the height left after
// ~22rem of text, scroll cue and padding (rem, so large-text mode is covered too),
// keeping the scroll cue on the first screen. svh does not change when browser toolbars collapse
const photoFrame =
  'relative block w-[min(100%,calc(58svh*3/4),max(9rem,calc((100svh_-_22rem_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))*3/4)))] rounded-[3px]'
const photoInner = 'block w-full overflow-hidden rounded-[inherit]'

// A white reading pool keeps small text clear of the moving leaf shade
// The horizontal gradient and vertical mask feather it so it does not read as a box
const lightPool =
  'relative before:pointer-events-none before:absolute before:-inset-x-10 before:-inset-y-3 before:-z-10 before:bg-[linear-gradient(90deg,rgb(255_255_255/0)_0,rgb(255_255_255/0.72)_40px,rgb(255_255_255/0.72)_calc(100%_-_40px),rgb(255_255_255/0)_100%)] before:[mask-image:linear-gradient(transparent,#000_12px,#000_calc(100%_-_12px),transparent)]'

const LIGHT_FADE = fadeMask('bottom', '200px')

/** Hero screen. Not wrapped in <Section>. */
export default function Cover() {
  const reduce = useReducedMotion()
  const lenis = useLenis()
  const [opening, setOpening] = useState(() =>
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    (!window.location.hash || window.location.hash === '#cover'),
  )
  const finishOpening = useCallback(() => setOpening(false), [])
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    preference.addEventListener('change', finishOpening)
    return () => preference.removeEventListener('change', finishOpening)
  }, [finishOpening])
  const { couple, event, cover } = wedding
  const sectionRef = useRef<HTMLElement>(null)
  const cueRef = useRef<HTMLSpanElement>(null)
  const cueInView = useInView(cueRef)
  const lastBurstAt = useRef(0)
  const photoHintId = useId()

  const onPhotoClick = (e: MouseEvent<HTMLButtonElement>) => {
    const now = Date.now()
    if (now - lastBurstAt.current < 500) return
    lastBurstAt.current = now
    // Keyboard activation reports clientX/Y = 0, so burst from the photo centre then
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX || r.left + r.width / 2) / window.innerWidth
    const y = (e.clientY || r.top + r.height / 2) / window.innerHeight
    burstConfetti({ x, y }).catch(() => {})
  }

  const photoImg = (
    <img
      src={cover.image.src}
      width={cover.image.width}
      height={cover.image.height}
      alt={cover.image.alt}
      loading="eager"
      fetchPriority="high"
      className="photo-feather block aspect-[3/4] h-auto w-full object-cover [--photo-fade:24px]!"
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
      className="relative isolate flex min-h-svh flex-col items-center overflow-hidden px-6 pt-[calc(32px+env(safe-area-inset-top))] pb-[calc(24px+env(safe-area-inset-bottom))]"
    >
      <AnimatePresence>
        {opening && <Opening key="opening" onComplete={finishOpening} />}
      </AnimatePresence>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0" style={LIGHT_FADE}>
        <Daylight />
        <LeafShade />
      </div>
      <PetalDrift count={3} seed={8} className="z-[5]" />

      <motion.div
        inert={opening}
        className="relative z-10 flex w-full flex-1 flex-col items-center justify-center text-center"
        variants={stagger}
        initial={reduce ? false : 'hidden'}
        animate={opening ? 'hidden' : 'shown'}
      >
        {cover.eyebrow && (
          <motion.p
            variants={line}
            className={`${lightPool} mb-7 font-display text-[0.9375rem] tracking-[0.26em] text-accent uppercase`}
          >
            {cover.eyebrow}
          </motion.p>
        )}

        {/* The confetti burst is motion-only, so under reduced motion the photo is not a control */}
        <motion.div variants={photo} className={photoFrame}>
          {reduce ? (
            <div className={photoInner}>{photoImg}</div>
          ) : (
            <button
              type="button"
              onClick={onPhotoClick}
              aria-describedby={photoHintId}
              className={`${photoInner} pressable [--press-scale:0.985] focus-visible:outline-2 focus-visible:outline-offset-[8px] focus-visible:outline-accent`}
            >
              {photoImg}
              <span id={photoHintId} hidden>
                누르면 축하 꽃가루가 날립니다
              </span>
            </button>
          )}
          <LightLeak interval={16} className="photo-feather [--photo-fade:24px]!" />
        </motion.div>

        <motion.div variants={line} className="mt-8 grid w-full place-items-center">
          <h1 className="font-serif text-[1.75rem] leading-snug text-ink">
            {couple.groom.name}
            <span className="mx-3 text-sage">·</span>
            {couple.bride.name}
          </h1>
        </motion.div>

        <motion.div variants={line} className={`${lightPool} mt-3`}>
          <p className="text-[0.9375rem] leading-relaxed tracking-[0.02em] text-ink-muted tabular-nums">{coverDateLine(event)}</p>
          <p className="mt-1 text-[0.9375rem] leading-relaxed tracking-[0.02em] text-ink-muted">{coverVenueLine(event)}</p>
        </motion.div>
      </motion.div>

      <motion.button
        type="button"
        disabled={opening}
        onClick={scrollToNext}
        aria-label="Scroll, 다음 내용으로 이동"
        className={`${lightPool} pressable z-10 mt-10 flex min-h-11 flex-col items-center gap-1 px-3 text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent`}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: opening ? 0 : 1 }}
        transition={{ duration: 0.6, delay: 0.9, ease: EASE_OUT }}
      >
        <motion.span
          ref={cueRef}
          className="flex flex-col items-center gap-1"
          animate={reduce || !cueInView ? cueRest : cueBob}
        >
          <span className="font-display text-[0.875rem] tracking-[0.28em] uppercase">Scroll</span>
          <ChevronDown size={18} strokeWidth={1.5} aria-hidden="true" />
        </motion.span>
      </motion.button>
    </section>
  )
}
