import { MessageSquare, Phone, X } from 'lucide-react'
import { AnimatePresence, motion, useDragControls, useReducedMotion, type PanInfo } from 'motion/react'
import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { EASE_OUT, SPRING } from '@/lib/motion'
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
/** Release past this fraction of the panel height, or flick down faster than DISMISS_VELOCITY px/s, to close. */
const DISMISS_FRACTION = 0.25
const DISMISS_VELOCITY = 500
const ACTION =
  'pressable flex size-11 items-center justify-center rounded-full bg-accent-soft text-accent [-webkit-touch-callout:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

export default function ContactSheet({ open, onClose, groups, sample }: ContactSheetProps) {
  const reduce = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const controls = useDragControls()
  useBodyScrollLock(open)

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

  const startDrag = (e: ReactPointerEvent) => {
    if ((e.target as Element).closest('button, a')) return
    controls.start(e)
  }

  const onDragEnd = (_: PointerEvent, info: PanInfo) => {
    const h = panelRef.current?.offsetHeight ?? 0
    if (info.offset.y > h * DISMISS_FRACTION || (info.offset.y > 0 && info.velocity.y > DISMISS_VELOCITY)) onClose()
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="family-contact-backdrop"
          className="fixed inset-0 z-50 bg-ink/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.2 : 0.3, ease: EASE_OUT }}
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
          className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85dvh] w-full max-w-[480px] overflow-y-auto overscroll-contain material rounded-t-[28px] px-6 pt-0 [--material-bg:rgb(255_255_255/0.88)] [--material-shadow:0_-12px_40px_-20px_rgb(55_118_86/0.35)] pb-[calc(24px+env(safe-area-inset-bottom))] outline-none"
          drag={reduce ? false : 'y'}
          dragListener={false}
          dragControls={controls}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.08, bottom: 1 }}
          dragMomentum={false}
          onDragEnd={onDragEnd}
          initial={reduce ? { opacity: 0 } : { y: '100%' }}
          animate={reduce ? { opacity: 1 } : { y: 0 }}
          exit={reduce ? { opacity: 0 } : { y: '100%' }}
          transition={reduce ? { duration: 0.2, ease: EASE_OUT } : SPRING}
        >
          <div onPointerDown={reduce ? undefined : startDrag} className="-mx-6 touch-none px-6 select-none">
            <div aria-hidden="true" className="flex h-6 items-start justify-center pt-2">
              <div className="h-[5px] w-9 rounded-full bg-ink/25" />
            </div>
            <header className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <h3 id={TITLE_ID} className="font-serif text-[1.125rem] text-ink">
                  연락하기
                </h3>
                {sample && (
                  <span className="rounded-full border border-line bg-bg-elevated px-2 py-0.5 text-[0.75rem] tracking-[0.02em] text-accent">
                    예시 번호
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="pressable -mr-2 flex size-11 items-center justify-center rounded-full bg-ink/5 text-ink-muted hover:text-ink active:bg-ink/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <X size={18} strokeWidth={2.25} aria-hidden="true" />
              </button>
            </header>
          </div>

          {groups.map((group) => (
            <section key={group.side} aria-label={`${group.label} 측 연락처`} className="mt-5">
              <h4 className="px-4 text-[0.8125rem] tracking-[0.02em] text-ink-muted">{group.label} 측</h4>
              <ul className="mt-2 divide-y divide-line overflow-hidden rounded-2xl bg-bg-elevated">
                {group.entries.map((entry) => (
                  <li key={entry.key} className="flex min-h-16 items-center justify-between gap-3 py-2.5 pr-3 pl-4">
                    <div className="min-w-0">
                      <p className="text-[0.8125rem] text-ink-muted">{entry.role}</p>
                      <p className="font-serif text-[1rem] leading-snug text-ink">{entry.name}</p>
                    </div>
                    <div className="flex shrink-0 gap-3">
                      <a href={telHref(entry.phone)} aria-label={`${entry.role} ${entry.name}님께 전화`} className={ACTION}>
                        <Phone size={18} aria-hidden="true" />
                      </a>
                      <a href={smsHref(entry.phone)} aria-label={`${entry.role} ${entry.name}님께 문자`} className={ACTION}>
                        <MessageSquare size={18} aria-hidden="true" />
                      </a>
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
