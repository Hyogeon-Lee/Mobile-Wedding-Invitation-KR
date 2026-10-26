import type { WeddingConfig } from '@/config/types'
import { formatDateKo, formatTimeKo, toKstParts } from '@/lib/date'

type EventInfo = Pick<WeddingConfig['event'], 'startsAt' | 'datePlaceholder'>

/** Section title, e.g. "2027년 5월 15일 토요일 오후 12시", split over two lines. A placeholder date keeps only the year. */
export function calendarTitle(event: EventInfo): string {
  // Section renders the title with whitespace-pre-line, so the title never wraps mid-phrase
  if (event.datePlaceholder) return `${toKstParts(event.startsAt).year}년 OO월 OO일 OO요일\n오후 OO시`
  return `${formatDateKo(event.startsAt)}\n${formatTimeKo(event.startsAt)}`
}

export function monthLabel(year: number, month: number, placeholder: boolean): string {
  return placeholder ? `${year}년 OO월` : `${year}년 ${month}월`
}

interface SentenceInput {
  groom: string
  bride: string
  /** Whole KST days until the wedding: 0 on the day, negative afterwards */
  days: number
  placeholder: boolean
}

export function ddaySentence({ groom, bride, days, placeholder }: SentenceInput): string {
  const couple = `${groom} ♥ ${bride}`
  if (placeholder) return `${couple}의 결혼식까지 OOO일 남았습니다`
  if (days === 0) return `오늘은 ${couple}의 결혼식 날입니다`
  if (days > 0) return `${couple}의 결혼식이 ${days}일 남았습니다`
  return `${couple}의 결혼식이 ${Math.abs(days)}일 지났습니다`
}
