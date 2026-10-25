import { useId, useRef, type MouseEvent } from 'react'
import { motion, useInView, useReducedMotion, type TargetAndTransition, type Variants } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { wedding } from '@/config/wedding'
import { CurtainLight, GlowPulse, LightLeak, PetalDrift } from '@/effects'
import { EASE_OUT } from '@/lib/motion'
import { burstConfetti } from './confetti'
import { coverDateLine, coverVenueLine } from './format'

// Children animate in DOM order, each 0.07 s after the previous one.
const stagger: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07 } },
}
const line: Variants = {
  hidden: { opacity: 0, y: 14 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
}
const photo: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  shown: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE_OUT } },
}

// A `transform` string (not `y`) lets Motion hand the loop to WAAPI, so it runs on the compositor.
const cueBob: TargetAndTransition = {
  transform: ['translateY(0px)', 'translateY(6px)', 'translateY(0px)'],
  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
}
const cueRest: TargetAndTransition = { transform: 'translateY(0px)', transition: { duration: 0.4, ease: EASE_OUT } }

// Photo is 3:4 and at most 58svh tall. On short screens it shrinks to the height left after
// ~22rem of text, frame ring, scroll cue and padding (rem, so large-text mode is covered too),
// keeping the scroll cue on the first screen. svh does not change when browser toolbars collapse.
// The frame carries the ring, shadow and light leak; the inner box clips the photo.
const photoFrame =
  'relative block w-[min(100%,calc(58svh*3/4),max(9rem,calc((100svh_-_22rem_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))*3/4)))] rounded-2xl shadow-(--shadow-soft) ring-4 ring-white/80'
const photoInner = 'block w-full overflow-hidden rounded-[inherit]'

// Static pool of white light behind small text. Where a warm CurtainLight band crosses it, the
// tinted background lowers text-ink-muted / text-accent contrast; 72% white keeps them above 4.5:1. Feathered with
// a horizontal gradient and a vertical mask so it reads as diffused light, not a box.
const lightPool =
  'relative before:pointer-events-none before:absolute before:-inset-x-10 before:-inset-y-3 before:-z-10 before:bg-[linear-gradient(90deg,rgb(255_255_255/0)_0,rgb(255_255_255/0.72)_40px,rgb(255_255_255/0.72)_calc(100%_-_40px),rgb(255_255_255/0)_100%)] before:[mask-image:linear-gradient(transparent,#000_12px,#000_calc(100%_-_12px),transparent)]'

/** Hero screen: eyebrow, cover photo, names, date and venue. Not wrapped in <Section>. */
export default function Cover() {
  const reduce = useReducedMotion()
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
    // Keyboard activation reports clientX/Y = 0; burst from the photo centre then.
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
      className="block aspect-[3/4] h-auto w-full object-cover"
    />
  )

  const scrollToNext = () => {
    const behavior: ScrollBehavior = reduce ? 'auto' : 'smooth'
    // Skip decorative siblings (e.g. a BotanicalDivider) so the cue lands on the next section.
    let next = sectionRef.current?.nextElementSibling
    while (next && next.getAttribute('aria-hidden') === 'true') next = next.nextElementSibling
    if (next instanceof HTMLElement) next.scrollIntoView({ behavior, block: 'start' })
    else window.scrollBy({ top: window.innerHeight, behavior })
  }

  return (
    <section
      id="cover"
      ref={sectionRef}
      aria-label="표지"
      className="relative isolate flex min-h-svh flex-col items-center overflow-hidden px-6 pt-[calc(32px+env(safe-area-inset-top))] pb-[calc(24px+env(safe-area-inset-bottom))]"
    >
      {/* Animated nodes on this screen: curtain 8 (6 bands + wash + drifting group)
          + petal 2 (one sage sprig: fall + sway wrappers) + leak 1 + glow 1 + scroll cue 1 = 13,
          within the ~20 budget in src/effects/README.md. CurtainLight is the only background layer:
          the README says to use it instead of LightBloom, not on top of it. */}
      {/* Sunlight through sheer curtains: the warm wash supplies the window glow, painted below petals and text. */}
      <CurtainLight tone="warm" intensity="medium" bands={6} />
      <PetalDrift count={1} seed={8} className="z-[5]" />

      <motion.div
        className="relative z-10 flex w-full flex-1 flex-col items-center justify-center text-center"
        variants={stagger}
        initial={reduce ? false : 'hidden'}
        animate="shown"
      >
        {cover.eyebrow && (
          <motion.p
            variants={line}
            className={`${lightPool} mb-6 font-display text-[1.0625rem] tracking-[0.22em] text-accent uppercase italic`}
          >
            {cover.eyebrow}
          </motion.p>
        )}

        {/* The confetti burst is motion-only, so under reduced motion the photo is not a control. */}
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
          <LightLeak interval={8} />
        </motion.div>

        <motion.div variants={line} className="mt-8 grid w-full place-items-center">
          <GlowPulse color="butter" size={220}>
            <h1 className="font-serif text-[1.75rem] leading-snug text-ink">
              {couple.groom.name} · {couple.bride.name}
            </h1>
          </GlowPulse>
        </motion.div>

        <motion.div variants={line} className={`${lightPool} mt-3`}>
          <p className="text-[0.9375rem] leading-relaxed tracking-[0.02em] text-ink-muted tabular-nums">{coverDateLine(event)}</p>
          <p className="mt-1 text-[0.9375rem] leading-relaxed tracking-[0.02em] text-ink-muted">{coverVenueLine(event)}</p>
        </motion.div>
      </motion.div>

      <motion.button
        type="button"
        onClick={scrollToNext}
        aria-label="Scroll, 다음 내용으로 이동"
        className={`${lightPool} pressable z-10 mt-10 flex min-h-11 flex-col items-center gap-1 px-3 text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent`}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
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
