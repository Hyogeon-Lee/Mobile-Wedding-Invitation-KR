import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { EASE_OUT } from '@/lib/motion'

interface RevealProps {
  children: ReactNode
  /** seconds */
  delay?: number
  /** px to travel upward while fading in */
  y?: number
  className?: string
  /** render as a different element; default div */
  as?: 'div' | 'p' | 'li' | 'span'
  /**
   * Visible fraction that triggers the reveal. Use 'some' for blocks that can be taller than the
   * viewport (long lists, image grids): a fixed fraction can never be reached by a block taller
   * than viewport / fraction, which would leave it invisible forever.
   */
  amount?: number | 'some' | 'all'
}

/**
 * Fade + rise on first entry into the viewport. Honors prefers-reduced-motion.
 * Motion principle from the plan: 0.4–0.8 s, ease-out, one effect per element.
 */
export default function Reveal({ children, delay = 0, y = 16, className, as = 'div', amount = 0.25 }: RevealProps) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount, margin: amount === 'some' ? '0px 0px -10% 0px' : undefined }}
      transition={{ duration: 0.6, ease: EASE_OUT, delay }}
    >
      {children}
    </Tag>
  )
}
