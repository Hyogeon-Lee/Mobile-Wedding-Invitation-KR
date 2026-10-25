import { motion, useReducedMotion } from 'motion/react'
import { useId, useRef, type KeyboardEvent } from 'react'
import { SPRING_FAST } from '@/lib/motion'

export interface SegmentedOption<T extends string> {
  value: T
  label: string
}

interface SegmentedProps<T extends string> {
  /** Visible label rendered above the control */
  label: string
  value: T
  options: readonly SegmentedOption<T>[]
  onChange: (value: T) => void
  disabled?: boolean
}

const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

/**
 * Pill-shaped radiogroup (WAI-ARIA radio pattern): only the checked option is in the Tab
 * order, and Left/Right (or Up/Down) arrows move the selection and focus together.
 */
export default function Segmented<T extends string>({ label, value, options, onChange, disabled }: SegmentedProps<T>) {
  const labelId = useId()
  const groupRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const index = Math.max(0, options.findIndex((o) => o.value === value))

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (step === 0 || disabled) return
    e.preventDefault()
    const index = options.findIndex((o) => o.value === value)
    const nextIndex = (index + step + options.length) % options.length
    onChange(options[nextIndex].value)
    groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[nextIndex]?.focus()
  }

  return (
    <div>
      <span id={labelId} className="mb-2 block text-[0.8125rem] tracking-[0.02em] text-ink-muted">
        {label}
      </span>
      <div
        ref={groupRef}
        role="radiogroup"
        aria-labelledby={labelId}
        onKeyDown={onKeyDown}
        className={`relative grid auto-cols-fr grid-flow-col rounded-full bg-[rgb(47_107_79/0.08)] p-0.5 ${disabled ? 'opacity-50' : ''}`}
      >
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0.5 left-0.5 rounded-full bg-bg-elevated shadow-[0_1px_2px_rgb(54_66_59/0.16),0_0_0_0.5px_rgb(54_66_59/0.1)]"
          style={{ width: `calc((100% - 4px) / ${options.length})` }}
          initial={false}
          animate={{ x: `${index * 100}%` }}
          transition={reduce ? { duration: 0 } : SPRING_FAST}
        />
        {options.map((option) => {
          const checked = option.value === value
          return (
            <button
              key={option.label}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={`pressable relative z-10 h-11 rounded-full text-[0.9375rem] tracking-[0.02em] text-ink ${FOCUS_RING} ${
                checked ? 'font-semibold' : 'font-normal'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
