import type { Transition } from 'motion/react'

/** Same curve as CSS --ease-out. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const

/** Critically damped (no overshoot); keeps velocity when re-targeted mid-flight. */
export const SPRING = { type: 'spring', bounce: 0, visualDuration: 0.35 } as const satisfies Transition
export const SPRING_FAST = { type: 'spring', bounce: 0, visualDuration: 0.3 } as const satisfies Transition

export const REVEAL_STEP = 0.08
