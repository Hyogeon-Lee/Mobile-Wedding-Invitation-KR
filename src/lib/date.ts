/**
 * Date helpers fixed to KST (UTC+9) regardless of the viewer's time zone.
 *
 * Principle: convert an instant to "KST wall-clock" by adding 9h to the UTC epoch and
 * reading the UTC getters. D-day is the difference in whole KST calendar days:
 *   D = floor(kstMidnight(event) / 86_400_000) - floor(kstMidnight(now) / 86_400_000)
 */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

export interface KstParts {
  year: number
  month: number // 1-12
  day: number // 1-31
  weekday: number // 0 (Sun) - 6 (Sat)
  hour: number // 0-23
  minute: number
}

export function toKstParts(instant: Date | string | number): KstParts {
  const t = typeof instant === 'number' ? instant : new Date(instant).getTime()
  const d = new Date(t + KST_OFFSET_MS)
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    weekday: d.getUTCDay(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
  }
}

/** Whole KST calendar days from `now` to `target` (positive = future). */
export function daysUntil(target: Date | string | number, now: Date | number = new Date()): number {
  const tt = typeof target === 'number' ? target : new Date(target).getTime()
  const nt = typeof now === 'number' ? now : now.getTime()
  const targetDay = Math.floor((tt + KST_OFFSET_MS) / DAY_MS)
  const nowDay = Math.floor((nt + KST_OFFSET_MS) / DAY_MS)
  return targetDay - nowDay
}

export const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토'] as const

/** "2027년 5월 15일 토요일" */
export function formatDateKo(instant: Date | string | number): string {
  const p = toKstParts(instant)
  return `${p.year}년 ${p.month}월 ${p.day}일 ${WEEKDAYS_KO[p.weekday]}요일`
}

/** "오후 12시" / "오후 1시 30분" */
export function formatTimeKo(instant: Date | string | number): string {
  const p = toKstParts(instant)
  const period = p.hour < 12 ? '오전' : '오후'
  const h12 = p.hour % 12 === 0 ? 12 : p.hour % 12
  return p.minute === 0 ? `${period} ${h12}시` : `${period} ${h12}시 ${p.minute}분`
}

/** "D-120", "D-DAY", "D+3"; "D-OOO" when the date is still a placeholder. */
export function formatDday(days: number, placeholder = false): string {
  if (placeholder) return 'D-OOO'
  if (days === 0) return 'D-DAY'
  return days > 0 ? `D-${days}` : `D+${Math.abs(days)}`
}

/** Days in a month and the weekday of its first day, in KST calendar terms. */
export function monthGrid(year: number, month: number): { daysInMonth: number; firstWeekday: number } {
  const first = Date.UTC(year, month - 1, 1)
  const next = Date.UTC(year, month, 1)
  return {
    daysInMonth: Math.round((next - first) / DAY_MS),
    firstWeekday: new Date(first).getUTCDay(),
  }
}
