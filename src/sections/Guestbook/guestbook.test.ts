import { describe, expect, it } from 'vitest'
import type { GuestbookEntry } from '@/lib/sheets'
import {
  describedBy,
  entryDomId,
  formatEntryDate,
  MESSAGE_MAX,
  NAME_MAX,
  normalizeForm,
  paginate,
  prependEntry,
  removeEntry,
  sanitizeEntries,
  validateForm,
} from './guestbook'

const valid = {
  name: ' 이OO ',
  message: ' 결혼 축하해요!\n행복하세요 ',
  password: ' 1234 ',
}
const entry = (id: string): GuestbookEntry => ({
  id,
  ts: '2027-05-01T12:00:00+09:00',
  name: `n${id}`,
  message: 'm',
})

describe('normalizeForm', () => {
  it('trims name and message but keeps the password verbatim', () => {
    expect(normalizeForm(valid)).toEqual({
      name: '이OO',
      message: '결혼 축하해요!\n행복하세요',
      password: ' 1234 ',
    })
  })
})

describe('validateForm', () => {
  it('accepts a complete form', () => {
    expect(validateForm(valid)).toBeNull()
  })
  it('reports the first failing field in display order', () => {
    expect(validateForm({ name: '  ', message: '', password: '' })).toEqual({
      field: 'name',
      message: '성함을 입력해 주세요.',
    })
    expect(validateForm({ ...valid, message: '  ' })?.field).toBe('message')
    expect(validateForm({ ...valid, password: '123' })).toEqual({
      field: 'password',
      message: '비밀번호는 4자 이상 입력해 주세요.',
    })
  })
  it('enforces the maximum lengths after trimming', () => {
    expect(validateForm({ ...valid, name: ` ${'가'.repeat(NAME_MAX)} ` })).toBeNull()
    expect(validateForm({ ...valid, name: '가'.repeat(NAME_MAX + 1) })).toEqual({
      field: 'name',
      message: `성함은 ${NAME_MAX}자 이내로 입력해 주세요.`,
    })
    expect(validateForm({ ...valid, message: '가'.repeat(MESSAGE_MAX) })).toBeNull()
    expect(validateForm({ ...valid, message: '가'.repeat(MESSAGE_MAX + 1) })?.field).toBe('message')
  })
})

describe('formatEntryDate', () => {
  it('prints YYYY.MM.DD on the KST calendar', () => {
    expect(formatEntryDate('2027-05-01T03:00:00+09:00')).toBe('2027.05.01')
    // UTC 15:30 on Apr 30 is already May 1 in KST
    expect(formatEntryDate('2027-04-30T15:30:00Z')).toBe('2027.05.01')
  })
  it('returns an empty string for an unparsable timestamp', () => {
    expect(formatEntryDate('')).toBe('')
    expect(formatEntryDate('not a date')).toBe('')
  })
})

describe('sanitizeEntries', () => {
  it('coerces sheet values to strings and drops rows without an id', () => {
    const rows = [
      { id: 'a', ts: '2027-05-01T00:00:00Z', name: 1234, message: 56 },
      { id: '', ts: '', name: 'x', message: 'y' },
      { ts: '', name: 'x', message: 'y' },
      null,
      { id: 7, ts: null, name: undefined, message: 'ok' },
    ] as unknown as GuestbookEntry[]
    expect(sanitizeEntries(rows)).toEqual([
      { id: 'a', ts: '2027-05-01T00:00:00Z', name: '1234', message: '56' },
      { id: '7', ts: '', name: '', message: 'ok' },
    ])
  })
})

describe('prependEntry / removeEntry', () => {
  it('puts the new entry first and replaces one with the same id', () => {
    const list = [entry('1'), entry('2')]
    expect(prependEntry(list, entry('3')).map((e) => e.id)).toEqual(['3', '1', '2'])
    expect(prependEntry(list, { ...entry('2'), message: 'edited' }).map((e) => e.id)).toEqual(['2', '1'])
    expect(list.map((e) => e.id)).toEqual(['1', '2'])
  })
  it('removes by id without touching the input', () => {
    const list = [entry('1'), entry('2')]
    expect(removeEntry(list, '1').map((e) => e.id)).toEqual(['2'])
    expect(removeEntry(list, 'zzz')).toHaveLength(2)
    expect(list).toHaveLength(2)
  })
})

describe('paginate', () => {
  const list = Array.from({ length: 12 }, (_, i) => entry(String(i)))
  it('shows the first page and counts the rest', () => {
    expect(paginate(list, 10)).toMatchObject({ remaining: 2 })
    expect(paginate(list, 10).visible).toHaveLength(10)
    expect(paginate(list, 20)).toMatchObject({ remaining: 0 })
    expect(paginate(list, 20).visible).toHaveLength(12)
  })
  it('tolerates an empty list and a non-positive page size', () => {
    expect(paginate([], 10)).toEqual({ visible: [], remaining: 0 })
    expect(paginate(list, -1)).toEqual({ visible: [], remaining: 12 })
  })
})

describe('describedBy', () => {
  it('joins the present ids in order and skips falsy ones', () => {
    expect(describedBy('a-error', 'a-help')).toBe('a-error a-help')
    expect(describedBy(null, 'a-help')).toBe('a-help')
    expect(describedBy(false, undefined, '')).toBeUndefined()
    expect(describedBy()).toBeUndefined()
  })
})

describe('entryDomId', () => {
  it('prefixes the entry id', () => {
    expect(entryDomId('1700000000-abc')).toBe('guestbook-entry-1700000000-abc')
  })
})
