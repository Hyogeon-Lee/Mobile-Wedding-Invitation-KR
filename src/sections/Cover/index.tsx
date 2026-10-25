import { useRef, type MouseEvent } from 'react'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { wedding } from '@/config/wedding'
import { asset } from '@/lib/env'
import { burstConfetti } from './confetti'
import { coverDateLine, coverVenueLine } from './format'

const EASE = [0.22, 1, 0.36, 1] as const

// Children animate in DOM order, each 0.1 s after the previous one.
const stagger: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.1 } },
}
const line: Variants = {
  hidden: { opacity: 0, y: 14 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}
const photo: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  shown: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: EASE } },
}

/** Hero screen: eyebrow, cover photo, names, date and venue. Not wrapped in <Section>. */
export default function Cover() {
  const reduce = useReducedMotion()
  const { couple, event, cover } = wedding
  const sectionRef = useRef<HTMLElement>(null)
  const lastBurstAt = useRef(0)

  const onPhotoClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (reduce) return
    const now = Date.now()
    if (now - lastBurstAt.current < 500) return
    lastBurstAt.current = now
    // Keyboard activation reports clientX/Y = 0; burst from the photo centre then.
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX || r.left + r.width / 2) / window.innerWidth
    const y = (e.clientY || r.top + r.height / 2) / window.innerHeight
    burstConfetti({ x, y }).catch(() => {})
  }

  const scrollToNext = () => {
    const behavior: ScrollBehavior = reduce ? 'auto' : 'smooth'
    const next = sectionRef.current?.nextElementSibling
    if (next instanceof HTMLElement) next.scrollIntoView({ behavior, block: 'start' })
    else window.scrollBy({ top: window.innerHeight, behavior })
  }

  return (
    <section
      id="cover"
      ref={sectionRef}
      aria-label="표지"
      className="flex min-h-[100dvh] flex-col items-center px-6 pt-[calc(32px+env(safe-area-inset-top))] pb-[calc(24px+env(safe-area-inset-bottom))]"
    >
      <motion.div
        className="flex w-full flex-1 flex-col items-center justify-center text-center"
        variants={stagger}
        initial={reduce ? false : 'hidden'}
        animate="shown"
      >
        {cover.eyebrow && (
          <motion.p variants={line} className="mb-7 font-display text-[11px] tracking-[0.35em] text-accent uppercase">
            {cover.eyebrow}
          </motion.p>
        )}

        <motion.button
          type="button"
          variants={photo}
          onClick={onPhotoClick}
          aria-label="사진을 누르면 축하 꽃가루가 터집니다"
          className="block w-[min(100%,calc(58dvh*3/4))] overflow-hidden rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <img
            src={asset(cover.image.src)}
            width={cover.image.width}
            height={cover.image.height}
            alt={cover.image.alt}
            loading="eager"
            fetchPriority="high"
            className="block aspect-[3/4] h-auto w-full object-cover"
          />
        </motion.button>

        <motion.h1 variants={line} className="mt-8 font-serif text-[1.75rem] leading-snug font-normal text-ink">
          {couple.groom.name} · {couple.bride.name}
        </motion.h1>

        <motion.p variants={line} className="mt-4 text-[0.95rem] leading-relaxed text-ink">
          {coverDateLine(event)}
        </motion.p>
        <motion.p variants={line} className="mt-1 text-[0.95rem] leading-relaxed text-ink-muted">
          {coverVenueLine(event)}
        </motion.p>
      </motion.div>

      <motion.button
        type="button"
        onClick={scrollToNext}
        aria-label="아래로 스크롤"
        className="mt-10 flex flex-col items-center gap-1 text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.9, ease: EASE }}
      >
        <motion.span
          className="flex flex-col items-center gap-1"
          animate={reduce ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="font-display text-[11px] tracking-[0.3em] uppercase">Scroll</span>
          <ChevronDown size={18} strokeWidth={1.5} aria-hidden="true" />
        </motion.span>
      </motion.button>
    </section>
  )
}
