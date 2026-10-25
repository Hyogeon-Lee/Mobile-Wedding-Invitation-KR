import { useCallback, useEffect, useState } from 'react'
import { listGuestbook, type GuestbookEntry } from '@/lib/sheets'
import { prependEntry, removeEntry, sanitizeEntries } from './guestbook'

/**
 * Guestbook entries, loaded once on mount. `insert`/`remove` update the local list so a
 * successful add or delete shows at once without a second round trip to the backend.
 */
export function useGuestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    listGuestbook()
      .then((list) => {
        if (cancelled) return
        setEntries(sanitizeEntries(list))
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const insert = useCallback((entry: GuestbookEntry) => setEntries((prev) => prependEntry(prev, entry)), [])
  const remove = useCallback((id: string) => setEntries((prev) => removeEntry(prev, id)), [])

  return { entries, loading, insert, remove }
}
