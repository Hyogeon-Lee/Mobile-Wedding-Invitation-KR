import { describe, expect, it } from 'vitest'
import { calendarTitle, ddaySentence, monthLabel } from './format'

const startsAt = '2027-05-15T12:00:00+09:00'

describe('calendarTitle', () => {
  it('prints placeholders (year only) while the date is unconfirmed', () => {
    expect(calendarTitle({ startsAt, datePlaceholder: true })).toBe('2027년 OO월 OO일 OO요일\n오후 OO시')
  })
  it('prints the KST date and time once confirmed', () => {
    expect(calendarTitle({ startsAt, datePlaceholder: false })).toBe('2027년 5월 15일 토요일\n오후 12시')
  })
})

describe('monthLabel', () => {
  it('hides the month while the date is a placeholder', () => {
    expect(monthLabel(2027, 5, true)).toBe('2027년 OO월')
    expect(monthLabel(2027, 5, false)).toBe('2027년 5월')
  })
})

describe('ddaySentence', () => {
  const names = { groom: '이OO', bride: '박OO' }
  it('uses OOO while the date is a placeholder', () => {
    expect(ddaySentence({ ...names, days: 120, placeholder: true })).toBe('이OO ♥ 박OO의 결혼식까지 OOO일 남았습니다')
  })
  it('counts down, marks the day itself and counts up afterwards', () => {
    expect(ddaySentence({ ...names, days: 120, placeholder: false })).toBe('이OO ♥ 박OO의 결혼식이 120일 남았습니다')
    expect(ddaySentence({ ...names, days: 0, placeholder: false })).toBe('오늘은 이OO ♥ 박OO의 결혼식 날입니다')
    expect(ddaySentence({ ...names, days: -3, placeholder: false })).toBe('이OO ♥ 박OO의 결혼식이 3일 지났습니다')
  })
})
