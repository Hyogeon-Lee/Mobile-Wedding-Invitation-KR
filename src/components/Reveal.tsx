import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  /** seconds */
  delay?: number
  /** px to travel upward while fading in */
  y?: number
  className?: string
  /** render as a different element; default div */
  as?: 'div' | 'p' | 'li' | 'span'
}

/**
 * Fade + rise on first entry into the viewport. Honors prefers-reduced-motion.
 * Motion principle from the plan: 0.4–0.8 s, ease-out, one effect per element.
 */
export default function Reveal({ children, delay = 0, y = 16, className, as = 'div' }: RevealProps) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </Tag>
  )
}
