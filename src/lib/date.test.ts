import { describe, expect, it } from 'vitest'
import { daysUntil, formatDateKo, formatDday, formatTimeKo, monthGrid, toKstParts } from './date'

describe('toKstParts', () => {
  it('reads KST wall-clock regardless of host TZ', () => {
    const p = toKstParts('2027-05-15T12:00:00+09:00')
    expect(p).toMatchObject({ year: 2027, month: 5, day: 15, weekday: 6, hour: 12, minute: 0 })
  })
  it('rolls over midnight correctly (UTC 15:30 = KST 00:30 next day)', () => {
    const p = toKstParts('2027-05-14T15:30:00Z')
    expect(p).toMatchObject({ year: 2027, month: 5, day: 15, hour: 0, minute: 30 })
  })
})

describe('daysUntil', () => {
  const event = '2027-05-15T12:00:00+09:00'
  it('counts whole KST days, not 24h blocks', () => {
    // KST 2027-05-14 23:59 -> 1 day left even though < 24h remain
    expect(daysUntil(event, new Date('2027-05-14T14:59:00Z'))).toBe(1)
    // KST 2027-05-15 00:01 -> D-DAY
    expect(daysUntil(event, new Date('2027-05-14T15:01:00Z'))).toBe(0)
  })
  it('is negative after the event', () => {
    expect(daysUntil(event, new Date('2027-05-18T03:00:00+09:00'))).toBe(-3)
  })
})

describe('formatters', () => {
  it('formats Korean date, time, and D-day', () => {
    expect(formatDateKo('2027-05-15T12:00:00+09:00')).toBe('2027년 5월 15일 토요일')
    expect(formatTimeKo('2027-05-15T12:00:00+09:00')).toBe('오후 12시')
    expect(formatTimeKo('2027-05-15T13:30:00+09:00')).toBe('오후 1시 30분')
    expect(formatTimeKo('2027-05-15T09:00:00+09:00')).toBe('오전 9시')
    expect(formatDday(10)).toBe('D-10')
    expect(formatDday(0)).toBe('D-DAY')
    expect(formatDday(-2)).toBe('D+2')
    expect(formatDday(10, true)).toBe('D-OOO')
  })
})

describe('monthGrid', () => {
  it('returns days and first weekday', () => {
    expect(monthGrid(2027, 5)).toEqual({ daysInMonth: 31, firstWeekday: 6 }) // 2027-05-01 is Saturday
    expect(monthGrid(2028, 2)).toEqual({ daysInMonth: 29, firstWeekday: 2 }) // leap year, Tuesday
  })
})
