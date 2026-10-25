import { describe, expect, it } from 'vitest'
import {
  clampCount,
  COUNT_MAX,
  COUNT_MIN,
  defaultForm,
  firstInvalidField,
  MESSAGES,
  NAME_MAX,
  NOTE_MAX,
  parseCount,
  rsvpEventLine,
  summaryLine,
  toRsvpInput,
  validateRsvp,
  type RsvpForm,
} from './form'

const base: RsvpForm = { side: 'groom', name: '이OO', attending: true, count: 2, meal: 'yes', note: '' }

describe('validateRsvp', () => {
  it('accepts a complete attending form', () => {
    expect(validateRsvp(base)).toEqual({})
  })
  it('requires a non-blank name', () => {
    expect(validateRsvp({ ...base, name: '' })).toEqual({ name: MESSAGES.nameRequired })
    expect(validateRsvp({ ...base, name: '   ' })).toEqual({ name: MESSAGES.nameRequired })
  })
  it('limits the trimmed name to NAME_MAX characters', () => {
    expect(validateRsvp({ ...base, name: '가'.repeat(NAME_MAX) })).toEqual({})
    expect(validateRsvp({ ...base, name: ` ${'가'.repeat(NAME_MAX)} ` })).toEqual({})
    expect(validateRsvp({ ...base, name: '가'.repeat(NAME_MAX + 1) })).toEqual({ name: MESSAGES.nameTooLong })
  })
  it('requires a count only while attending', () => {
    expect(validateRsvp({ ...base, count: null })).toEqual({ count: MESSAGES.countRequired })
    expect(validateRsvp({ ...base, attending: false, count: null })).toEqual({})
    expect(validateRsvp({ ...base, attending: false, count: 99 })).toEqual({})
  })
  it('rejects counts outside the range and non-integers', () => {
    expect(validateRsvp({ ...base, count: COUNT_MIN - 1 })).toEqual({ count: MESSAGES.countRange })
    expect(validateRsvp({ ...base, count: COUNT_MAX + 1 })).toEqual({ count: MESSAGES.countRange })
    expect(validateRsvp({ ...base, count: 1.5 })).toEqual({ count: MESSAGES.countRange })
    expect(validateRsvp({ ...base, count: COUNT_MIN })).toEqual({})
    expect(validateRsvp({ ...base, count: COUNT_MAX })).toEqual({})
  })
  it('limits the trimmed note to NOTE_MAX characters', () => {
    expect(validateRsvp({ ...base, note: 'a'.repeat(NOTE_MAX) })).toEqual({})
    expect(validateRsvp({ ...base, note: ' '.repeat(NOTE_MAX + 5) })).toEqual({})
    expect(validateRsvp({ ...base, note: 'a'.repeat(NOTE_MAX + 1) })).toEqual({ note: MESSAGES.noteTooLong })
  })
  it('reports several fields at once', () => {
    expect(validateRsvp({ ...base, name: '', count: 0, note: 'a'.repeat(NOTE_MAX + 1) })).toEqual({
      name: MESSAGES.nameRequired,
      count: MESSAGES.countRange,
      note: MESSAGES.noteTooLong,
    })
  })
})

describe('firstInvalidField', () => {
  it('follows the visual order name → count → note', () => {
    expect(firstInvalidField({ name: 'x', count: 'y', note: 'z' })).toBe('name')
    expect(firstInvalidField({ count: 'y', note: 'z' })).toBe('count')
    expect(firstInvalidField({ note: 'z' })).toBe('note')
  })
  it('is null without errors', () => {
    expect(firstInvalidField({})).toBeNull()
  })
})

describe('clampCount', () => {
  it('clamps into [COUNT_MIN, COUNT_MAX] and rounds', () => {
    expect(clampCount(0)).toBe(COUNT_MIN)
    expect(clampCount(11)).toBe(COUNT_MAX)
    expect(clampCount(2.6)).toBe(3)
    expect(clampCount(5)).toBe(5)
  })
  it('falls back to COUNT_MIN for non-finite values', () => {
    expect(clampCount(Number.NaN)).toBe(COUNT_MIN)
    expect(clampCount(Number.POSITIVE_INFINITY)).toBe(COUNT_MIN)
  })
})

describe('parseCount', () => {
  it('maps an empty or non-numeric field to null', () => {
    expect(parseCount('')).toBeNull()
    expect(parseCount('   ')).toBeNull()
    expect(parseCount('abc')).toBeNull()
  })
  it('keeps the raw number so validation can report the range', () => {
    expect(parseCount(' 3 ')).toBe(3)
    expect(parseCount('15')).toBe(15)
    expect(parseCount('1.5')).toBe(1.5)
  })
})

describe('toRsvpInput', () => {
  it('trims text, keeps count and meal while attending, omits a blank note', () => {
    expect(toRsvpInput({ ...base, name: '  이OO ', note: '   ' })).toEqual({
      side: 'groom',
      name: '이OO',
      attending: true,
      count: 2,
      meal: 'yes',
      note: undefined,
    })
  })
  it('zeroes the count and clears the meal when not attending', () => {
    expect(toRsvpInput({ ...base, side: 'bride', attending: false, count: 4, meal: 'no', note: ' 축하해요 ' })).toEqual({
      side: 'bride',
      name: '이OO',
      attending: false,
      count: 0,
      meal: '',
      note: '축하해요',
    })
  })
  it('clamps a stray count and truncates over-long text defensively', () => {
    const out = toRsvpInput({ ...base, count: 99, name: '가'.repeat(NAME_MAX + 3), note: 'b'.repeat(NOTE_MAX + 3) })
    expect(out.count).toBe(COUNT_MAX)
    expect(out.name).toHaveLength(NAME_MAX)
    expect(out.note).toHaveLength(NOTE_MAX)
    expect(toRsvpInput({ ...base, count: null }).count).toBe(COUNT_MIN)
  })
})

describe('summaryLine', () => {
  it('describes an attending guest with count and meal', () => {
    expect(summaryLine(toRsvpInput(base))).toBe('신랑 측 · 이OO · 참석 2명 · 식사 함')
    expect(summaryLine(toRsvpInput({ ...base, meal: '' }))).toBe('신랑 측 · 이OO · 참석 2명 · 식사 미정')
    expect(summaryLine(toRsvpInput({ ...base, meal: 'no' }))).toBe('신랑 측 · 이OO · 참석 2명 · 식사 안 함')
  })
  it('describes a declining guest without count or meal', () => {
    expect(summaryLine(toRsvpInput({ ...base, side: 'bride', name: '박OO', attending: false }))).toBe(
      '신부 측 · 박OO · 불참',
    )
  })
})

describe('rsvpEventLine', () => {
  const startsAt = '2027-05-15T12:00:00+09:00'
  it('prints only the year while the date is a placeholder', () => {
    expect(rsvpEventLine({ startsAt, datePlaceholder: true, venueName: '노블발렌티 삼성' })).toBe(
      '2027년 OO월 OO일 · 노블발렌티 삼성',
    )
  })
  it('prints the full Korean date once confirmed', () => {
    expect(rsvpEventLine({ startsAt, datePlaceholder: false, venueName: '노블발렌티 삼성' })).toBe(
      '2027년 5월 15일 토요일 · 노블발렌티 삼성',
    )
  })
})

describe('defaultForm', () => {
  it('starts as groom side, attending, one guest, meal undecided, and returns a fresh object', () => {
    const a = defaultForm()
    expect(a).toEqual({ side: 'groom', name: '', attending: true, count: COUNT_MIN, meal: '', note: '' })
    expect(defaultForm()).not.toBe(a)
    expect(validateRsvp({ ...a, name: '홍길동' })).toEqual({})
  })
})
