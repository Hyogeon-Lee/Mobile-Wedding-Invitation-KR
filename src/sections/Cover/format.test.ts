import { describe, expect, it } from 'vitest'
import { coverDateLine, coverVenueLine } from './format'

describe('coverDateLine', () => {
  it('prints placeholders (year only) while the date is unconfirmed', () => {
    expect(coverDateLine({ startsAt: '2027-05-15T12:00:00+09:00', datePlaceholder: true })).toBe(
      '2027년 OO월 OO일 OO요일 오후 OO시',
    )
  })
  it('prints the KST date and time once confirmed', () => {
    expect(coverDateLine({ startsAt: '2027-05-15T12:00:00+09:00', datePlaceholder: false })).toBe(
      '2027년 5월 15일 토요일 오후 12시',
    )
    expect(coverDateLine({ startsAt: '2027-05-15T13:30:00+09:00', datePlaceholder: false })).toBe(
      '2027년 5월 15일 토요일 오후 1시 30분',
    )
  })
})

describe('coverVenueLine', () => {
  it('joins venue and hall with a space', () => {
    expect(coverVenueLine({ venueName: '노블발렌티 삼성', hall: 'OO홀' })).toBe('노블발렌티 삼성 OO홀')
  })
  it('drops an empty hall', () => {
    expect(coverVenueLine({ venueName: '노블발렌티 삼성', hall: '' })).toBe('노블발렌티 삼성')
    expect(coverVenueLine({ venueName: '노블발렌티 삼성', hall: '  ' })).toBe('노블발렌티 삼성')
  })
})
