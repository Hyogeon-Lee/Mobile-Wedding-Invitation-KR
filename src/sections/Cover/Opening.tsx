import { useEffect } from 'react'
import { motion } from 'motion/react'
import { wedding } from '@/config/wedding'
import { EASE_SOFT } from '@/lib/motion'
import lettering from './opening-lettering.json'

interface OpeningProps {
  onComplete: () => void
}

export default function Opening({ onComplete }: OpeningProps) {
  const { cover, couple } = wedding

  useEffect(() => {
    const timer = window.setTimeout(onComplete, 3400)
    return () => window.clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden bg-ink px-6 text-center text-white"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: EASE_SOFT }}
    >
      <motion.img
        src={cover.image.src}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        initial={{ opacity: 0, scale: 1.035, x: -10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 1.2, ease: EASE_SOFT }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgb(21_32_25/0.6),rgb(21_32_25/0.68)_55%,rgb(21_32_25/0.6))]" />
      <div className="relative z-10">
        <motion.p
          className="mb-8 text-[0.75rem] tracking-[0.22em] uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {cover.eyebrow}
        </motion.p>
        <p className="sr-only">We're getting married! 우리, 결혼합니다</p>
        <svg aria-hidden="true" className="mx-auto w-[min(17.5rem,74vw)]" viewBox="0 0 300 250" fill="none">
          <g transform="scale(2.4)" stroke="currentColor" strokeWidth="0.62" strokeLinecap="round" strokeLinejoin="round">
            {lettering.map((d, index) => (
              <motion.path
                key={index}
                d={d}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ pathLength: { duration: 0.7, delay: 0.6 + index * 0.7, ease: 'linear' }, opacity: { duration: 0.1, delay: 0.6 + index * 0.7 } }}
              />
            ))}
          </g>
          <motion.path
            d="M73 226 Q150 228 247 214 M89 236 Q170 234 237 226"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ pathLength: { duration: 0.35, delay: 2.7, ease: EASE_SOFT }, opacity: { duration: 0.1, delay: 2.7 } }}
          />
        </svg>
        <motion.p
          className="mt-8 font-serif text-[1rem]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 2.3 }}
        >
          {couple.groom.name} · {couple.bride.name}
        </motion.p>
      </div>
      <button
        type="button"
        onClick={onComplete}
        className="pressable absolute bottom-[calc(24px+env(safe-area-inset-bottom))] z-10 min-h-11 rounded-full px-5 text-[0.875rem] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        바로 보기
      </button>
    </motion.div>
  )
}
