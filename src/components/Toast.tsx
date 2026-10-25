import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { ToastContext } from './toast-context'

/**
 * Single bottom toast; last message wins. Visible for max(2.5 s, 90 ms per character).
 * Screen readers get an always-mounted sr-only live region (a region mounted together with its
 * text is often not announced), re-filled on each show so repeated messages are announced again.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const [announce, setAnnounce] = useState('')
  const timer = useRef<number | null>(null)
  const show = useCallback((m: string) => {
    setMessage(m)
    setAnnounce('')
    window.requestAnimationFrame(() => setAnnounce(m))
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMessage(null), Math.max(2500, m.length * 90))
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
          {message && (
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className="rounded-full bg-accent/95 px-5 py-2.5 text-[0.9375rem] text-white shadow-lg"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
