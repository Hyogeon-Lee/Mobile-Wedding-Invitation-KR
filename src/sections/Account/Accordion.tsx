import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { EASE_OUT, SPRING_FAST } from '@/lib/motion'

interface AccordionProps {
  /** Prefix for the button/panel ids, e.g. "account-groom" */
  id: string
  title: string
  children: ReactNode
}

export default function Accordion({ id, title, children }: AccordionProps) {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const buttonId = `${id}-button`
  const panelId = `${id}-panel`

  return (
    <div>
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 py-5 text-left text-ink transition-colors hover:bg-mint/60 active:bg-mint/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span className="font-serif text-[1.0625rem]">{title}</span>
          <motion.span
            aria-hidden="true"
            className="flex shrink-0 text-accent"
            initial={false}
            animate={{ rotate: open ? 180 : 0 }}
            transition={SPRING_FAST}
          >
            <ChevronDown size={18} />
          </motion.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="panel"
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            className="overflow-hidden"
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reduce ? { duration: 0.2, ease: EASE_OUT } : SPRING_FAST}
          >
            <div className="border-t border-line">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
