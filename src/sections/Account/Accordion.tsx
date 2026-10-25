import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState, type ReactNode } from 'react'

interface AccordionProps {
  /** Prefix for the button/panel ids, e.g. "account-groom" */
  id: string
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** Disclosure card: heading button with aria-expanded, panel region animated on height. */
export default function Accordion({ id, title, children, defaultOpen = false }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const reduce = useReducedMotion()
  const buttonId = `${id}-button`
  const panelId = `${id}-panel`

  return (
    <div className="rounded-[12px] border border-line bg-bg-elevated">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 rounded-[12px] px-5 py-4 text-left text-[15px] font-medium text-ink transition-colors hover:bg-accent-soft/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span>{title}</span>
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={`shrink-0 text-ink-muted transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
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
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
          >
            <div className="border-t border-line px-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
