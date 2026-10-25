import { useId, useRef, type KeyboardEvent } from 'react'

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
      <span id={labelId} className="mb-2 block text-[0.8125rem] font-medium text-ink-muted">
        {label}
      </span>
      <div
        ref={groupRef}
        role="radiogroup"
        aria-labelledby={labelId}
        onKeyDown={onKeyDown}
        className="flex rounded-full border border-line bg-bg-elevated p-1"
      >
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
              className={`h-10 flex-1 rounded-full text-[0.9375rem] transition-colors disabled:opacity-50 ${FOCUS_RING} ${
                checked ? 'bg-ink font-medium text-bg' : 'text-ink-muted hover:text-ink'
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
