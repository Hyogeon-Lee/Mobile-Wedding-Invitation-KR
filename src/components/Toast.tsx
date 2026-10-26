import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { ToastContext } from './toast-context'
import { EASE_OUT, SPRING_FAST } from '@/lib/motion'

/**
 * Single bottom toast; last message wins. Visible for max(3 s, 110 ms per character).
 * Screen readers get an always-mounted sr-only live region (a region mounted together with its
 * text is often not announced), re-filled on each show so repeated messages are announced again.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; seq: number } | null>(null)
  const [announce, setAnnounce] = useState('')
  const timer = useRef<number | null>(null)
  const show = useCallback((m: string) => {
    setToast((prev) => ({ message: m, seq: (prev?.seq ?? 0) + 1 }))
    setAnnounce('')
    window.requestAnimationFrame(() => setAnnounce(m))
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), Math.max(3000, m.length * 110))
  }, [])
  const value = useMemo(() => ({ show }), [show])
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div role="status" aria-live="polite" className="sr-only">
        {announce}
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(24px+env(safe-area-inset-bottom))] z-50 flex justify-center px-6">
        <AnimatePresence>
          {toast && (
            <motion.div
              key="toast"
              aria-hidden="true"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={SPRING_FAST}
              style={{ transformOrigin: '50% 100%' }}
              className="material max-w-[min(100%,22.5rem)] rounded-full px-5 py-2.5 text-center text-[0.9375rem] text-ink [--material-shadow:0_10px_30px_-12px_rgb(55_118_86/0.35)]"
            >
              <motion.span
                key={toast.seq}
                className="block"
                initial={toast.seq > 1 ? { opacity: 0.4, scale: 0.98 } : false}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
              >
                {toast.message}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
