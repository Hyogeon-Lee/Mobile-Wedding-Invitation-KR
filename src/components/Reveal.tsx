import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { EASE_SOFT } from '@/lib/motion'

interface RevealProps {
  children: ReactNode
  /** seconds */
  delay?: number
  /** px to travel upward while fading in */
  y?: number
  className?: string
  as?: 'div' | 'p' | 'li' | 'span'
  /**
   * Visible fraction that triggers the reveal. Use 'some' for blocks that can be taller than the
   * viewport (long lists, image grids): a fixed fraction can never be reached by a block taller
   * than viewport / fraction, which would leave it invisible forever.
   */
  amount?: number | 'some' | 'all'
}

/** Fade and rise on first entry into the viewport. Honors prefers-reduced-motion. */
export default function Reveal({ children, delay = 0, y = 6, className, as = 'div', amount = 'some' }: RevealProps) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount, margin: '0px 0px 64px 0px' }}
      transition={{ duration: reduce ? 0 : 0.65, ease: EASE_SOFT, delay: reduce ? 0 : delay }}
    >
      {children}
    </Tag>
  )
}
