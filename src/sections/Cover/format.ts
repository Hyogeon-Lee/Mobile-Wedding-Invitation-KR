import type { WeddingConfig } from '@/config/types'
import { formatDateKo, formatTimeKo, toKstParts } from '@/lib/date'

type EventInfo = WeddingConfig['event']

/** "2027년 5월 15일 토요일 오후 12시". A placeholder date keeps only the year, so no unconfirmed date leaks out. */
export function coverDateLine(event: Pick<EventInfo, 'startsAt' | 'datePlaceholder'>): string {
  if (event.datePlaceholder) return `${toKstParts(event.startsAt).year}년 OO월 OO일 OO요일 오후 OO시`
  return `${formatDateKo(event.startsAt)} ${formatTimeKo(event.startsAt)}`
}

export function coverVenueLine(event: Pick<EventInfo, 'venueName' | 'hall'>): string {
  return [event.venueName, event.hall].filter((s) => s.trim() !== '').join(' ')
}
