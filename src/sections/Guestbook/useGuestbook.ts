import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchGuestbook, type GuestbookEntry } from '@/lib/sheets'
import { prependEntry, removeEntry, sanitizeEntries } from './guestbook'

const LOAD_FAILED = '방명록을 불러오지 못했습니다.'

/**
 * Guestbook entries, loaded on mount. A failed load sets `error` instead of looking like an
 * empty guestbook. `insert`/`remove` update the local list without refetching.
 */
export function useGuestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Only the latest request may update state (guards unmount and overlapping retries).
  const requestId = useRef(0)

  const request = useCallback(() => {
    const id = ++requestId.current
    fetchGuestbook()
      .then((res) => {
        if (id !== requestId.current) return
        if (res.ok && Array.isArray(res.entries)) setEntries(sanitizeEntries(res.entries))
        else setError(LOAD_FAILED)
        setLoading(false)
      })
      .catch(() => {
        if (id !== requestId.current) return
        setError(LOAD_FAILED)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const ids = requestId
    request()
    return () => {
      ids.current++
    }
  }, [request])

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    request()
  }, [request])

  const insert = useCallback((entry: GuestbookEntry) => setEntries((prev) => prependEntry(prev, entry)), [])
  const remove = useCallback((id: string) => setEntries((prev) => removeEntry(prev, id)), [])

  return { entries, loading, error, reload, insert, remove }
}
