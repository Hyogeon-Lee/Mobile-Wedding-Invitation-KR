import { toKstParts } from '@/lib/date'
import type { GuestbookEntry } from '@/lib/sheets'

export const NAME_MAX = 20
export const MESSAGE_MAX = 300
export const PASSWORD_MIN = 4
/** Entries shown per page; the rest sit behind "더 보기". */
export const PAGE_SIZE = 10

export interface GuestbookFormValues {
  name: string
  message: string
  password: string
}
export type GuestbookField = keyof GuestbookFormValues

export interface FormError {
  field: GuestbookField
  message: string
}

export const EMPTY_FORM: GuestbookFormValues = { name: '', message: '', password: '' }

/** Trims the public fields. The password is kept verbatim: the server hashes it exactly as typed. */
export function normalizeForm(values: GuestbookFormValues): GuestbookFormValues {
  return { name: values.name.trim(), message: values.message.trim(), password: values.password }
}

/** First failing field in display order with its Korean message, or null when the form is valid. */
export function validateForm(values: GuestbookFormValues): FormError | null {
  const v = normalizeForm(values)
  if (!v.name) return { field: 'name', message: '이름을 입력해 주세요.' }
  if (v.name.length > NAME_MAX) return { field: 'name', message: `이름은 ${NAME_MAX}자 이내로 입력해 주세요.` }
  if (!v.message) return { field: 'message', message: '메시지를 입력해 주세요.' }
  if (v.message.length > MESSAGE_MAX) {
    return { field: 'message', message: `메시지는 ${MESSAGE_MAX}자 이내로 입력해 주세요.` }
  }
  if (v.password.length < PASSWORD_MIN) {
    return { field: 'password', message: `비밀번호는 ${PASSWORD_MIN}자 이상 입력해 주세요.` }
  }
  return null
}

const pad2 = (n: number) => String(n).padStart(2, '0')

/** "2027.05.01" on the KST calendar; empty string when `ts` is not a parsable instant. */
export function formatEntryDate(ts: string): string {
  const t = new Date(ts).getTime()
  if (Number.isNaN(t)) return ''
  const p = toKstParts(t)
  return `${p.year}.${pad2(p.month)}.${pad2(p.day)}`
}

type RawEntry = { [K in keyof GuestbookEntry]?: unknown }

/**
 * Coerces rows from the sheet into string fields (a numeric-looking name comes back as a
 * number from Google Sheets) and drops rows without an id.
 */
export function sanitizeEntries(list: RawEntry[]): GuestbookEntry[] {
  const out: GuestbookEntry[] = []
  for (const raw of list) {
    if (!raw || raw.id === undefined || raw.id === null || raw.id === '') continue
    out.push({
      id: String(raw.id),
      ts: raw.ts === undefined || raw.ts === null ? '' : String(raw.ts),
      name: raw.name === undefined || raw.name === null ? '' : String(raw.name),
      message: raw.message === undefined || raw.message === null ? '' : String(raw.message),
    })
  }
  return out
}

/** Newest entry first; an entry with the same id replaces the old one instead of duplicating it. */
export function prependEntry(entries: GuestbookEntry[], entry: GuestbookEntry): GuestbookEntry[] {
  return [entry, ...entries.filter((e) => e.id !== entry.id)]
}

export function removeEntry(entries: GuestbookEntry[], id: string): GuestbookEntry[] {
  return entries.filter((e) => e.id !== id)
}

/** The first `shown` entries and how many remain behind the "더 보기" button. */
export function paginate(entries: GuestbookEntry[], shown: number): { visible: GuestbookEntry[]; remaining: number } {
  const visible = entries.slice(0, Math.max(0, shown))
  return { visible, remaining: entries.length - visible.length }
}
