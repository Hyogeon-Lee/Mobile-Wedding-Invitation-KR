import { MessageSquare, Phone, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Button from '@/components/Button'
import { smsHref, telHref, type ContactGroup } from './family'
import { useBodyScrollLock } from './useBodyScrollLock'

interface ContactSheetProps {
  open: boolean
  onClose: () => void
  groups: ContactGroup[]
  /** true when the numbers are placeholder samples (VITE_CONTACTS not set) */
  sample: boolean
}

const TITLE_ID = 'family-contact-title'
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** Bottom-sheet dialog listing phone/SMS links for the couple and their parents. */
export default function ContactSheet({ open, onClose, groups, sample }: ContactSheetProps) {
  const reduce = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  useBodyScrollLock(open)

  // Focus management: move focus into the sheet, keep Tab inside it, close on Escape,
  // and return focus to the opener when the sheet closes.
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const panel = panelRef.current
    panel?.focus({ preventScroll: true })

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panel) return
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) {
        e.preventDefault()
        panel.focus()
        return
      }
      const index = items.indexOf(document.activeElement as HTMLElement)
      if (e.shiftKey && index <= 0) {
        e.preventDefault()
        items[items.length - 1].focus()
      } else if (!e.shiftKey && (index === -1 || index === items.length - 1)) {
        e.preventDefault()
        items[0].focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      opener?.focus({ preventScroll: true })
    }
  }, [open, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="family-contact-backdrop"
          className="fixed inset-0 z-50 bg-ink/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.3 }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      {open && (
        <motion.div
          key="family-contact-sheet"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={TITLE_ID}
          tabIndex={-1}
          data-lenis-prevent=""
          className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85dvh] w-full max-w-[480px] overflow-y-auto overscroll-contain rounded-t-3xl border-t border-line bg-bg-elevated px-6 pt-3 pb-[calc(24px+env(safe-area-inset-bottom))] outline-none"
          initial={reduce ? false : { y: '100%' }}
          animate={{ y: 0 }}
          exit={reduce ? { opacity: 0 } : { y: '100%' }}
          transition={reduce ? { duration: 0 } : { duration: 0.45, ease: EASE }}
        >
          <div aria-hidden="true" className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />

          <header className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <h3 id={TITLE_ID} className="font-serif text-[1.125rem] text-ink">
                연락하기
              </h3>
              {sample && (
                <span className="rounded-full border border-line bg-bg-elevated px-2 py-0.5 font-sans text-[0.75rem] text-accent">
                  예시 번호
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </header>

          {groups.map((group) => (
            <section key={group.side} aria-label={`${group.label} 측 연락처`} className="mt-4">
              <h4 className="font-sans text-[0.75rem] tracking-[0.15em] text-accent">{group.label} 측</h4>
              <ul className="mt-1 divide-y divide-line">
                {group.entries.map((entry) => (
                  <li key={entry.key} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="text-[0.8125rem] text-ink-muted">{entry.role}</p>
                      <p className="font-serif text-[1rem] leading-snug text-ink">{entry.name}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button href={telHref(entry.phone)} variant="outline" size="sm" className="bg-white" aria-label={`${entry.role} ${entry.name}님께 전화`}>
                        <Phone size={14} aria-hidden="true" />
                        전화
                      </Button>
                      <Button href={smsHref(entry.phone)} variant="outline" size="sm" className="bg-white" aria-label={`${entry.role} ${entry.name}님께 문자`}>
                        <MessageSquare size={14} aria-hidden="true" />
                        문자
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
