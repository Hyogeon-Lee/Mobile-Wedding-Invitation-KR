import type { WeddingConfig } from '@/config/types'
import { formatDateKo, formatTimeKo, toKstParts } from '@/lib/date'

type EventInfo = Pick<WeddingConfig['event'], 'startsAt' | 'datePlaceholder'>

/**
 * Section title: "2027년 5월 15일 토요일 오후 12시". While the date is a placeholder only the
 * year comes from `startsAt`; everything else prints as "OO".
 */
export function calendarTitle(event: EventInfo): string {
  if (event.datePlaceholder) return `${toKstParts(event.startsAt).year}년 OO월 OO일 OO요일 오후 OO시`
  return `${formatDateKo(event.startsAt)} ${formatTimeKo(event.startsAt)}`
}

/** Caption above the grid: "2027년 5월", or "2027년 OO월" while the date is a placeholder. */
export function monthLabel(year: number, month: number, placeholder: boolean): string {
  return placeholder ? `${year}년 OO월` : `${year}년 ${month}월`
}

interface SentenceInput {
  groom: string
  bride: string
  /** whole KST days until the wedding; 0 on the day, negative afterwards */
  days: number
  placeholder: boolean
}

/** "이OO ♥ 박OO의 결혼식이 120일 남았습니다", with the day/after/placeholder variants. */
export function ddaySentence({ groom, bride, days, placeholder }: SentenceInput): string {
  const couple = `${groom} ♥ ${bride}`
  if (placeholder) return `${couple}의 결혼식까지 OOO일 남았습니다`
  if (days === 0) return `오늘은 ${couple}의 결혼식 날입니다`
  if (days > 0) return `${couple}의 결혼식이 ${days}일 남았습니다`
  return `${couple}의 결혼식이 ${Math.abs(days)}일 지났습니다`
}
