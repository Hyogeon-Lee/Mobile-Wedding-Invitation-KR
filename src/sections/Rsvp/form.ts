import type { WeddingConfig } from '@/config/types'
import { formatDateKo, toKstParts } from '@/lib/date'
import type { RsvpInput } from '@/lib/sheets'

export type Side = RsvpInput['side']
export type Meal = RsvpInput['meal']

export const NAME_MAX = 20
export const NOTE_MAX = 300
export const COUNT_MIN = 1
export const COUNT_MAX = 10

/** Form state as typed by the guest; `count` is null while the field is cleared. */
export interface RsvpForm {
  side: Side
  name: string
  attending: boolean
  count: number | null
  meal: Meal
  note: string
}

export interface RsvpErrors {
  name?: string
  count?: string
  note?: string
}

type RsvpField = keyof RsvpErrors

export const SIDE_OPTIONS = [
  { value: 'groom', label: '신랑 측' },
  { value: 'bride', label: '신부 측' },
] as const satisfies readonly { value: Side; label: string }[]

export const ATTENDING_OPTIONS = [
  { value: 'yes', label: '참석' },
  { value: 'no', label: '불참' },
] as const

export const MEAL_OPTIONS = [
  { value: 'yes', label: '식사 함' },
  { value: 'no', label: '식사 안 함' },
  { value: '', label: '미정' },
] as const satisfies readonly { value: Meal; label: string }[]

export const MESSAGES = {
  nameRequired: '성함을 입력해 주세요.',
  nameTooLong: `성함은 ${NAME_MAX}자 이내로 입력해 주세요.`,
  countRequired: '참석 인원을 입력해 주세요.',
  countRange: `참석 인원은 ${COUNT_MIN}명부터 ${COUNT_MAX}명까지 입력할 수 있습니다.`,
  noteTooLong: `전하실 말씀은 ${NOTE_MAX}자 이내로 입력해 주세요.`,
} as const

export function defaultForm(): RsvpForm {
  return { side: 'groom', name: '', attending: true, count: COUNT_MIN, meal: '', note: '' }
}

/** Count is validated only while attending, name and note are trimmed first */
export function validateRsvp(form: RsvpForm): RsvpErrors {
  const errors: RsvpErrors = {}
  const name = form.name.trim()
  if (name === '') errors.name = MESSAGES.nameRequired
  else if (name.length > NAME_MAX) errors.name = MESSAGES.nameTooLong

  if (form.attending) {
    if (form.count === null) errors.count = MESSAGES.countRequired
    else if (!Number.isInteger(form.count) || form.count < COUNT_MIN || form.count > COUNT_MAX) {
      errors.count = MESSAGES.countRange
    }
  }

  if (form.note.trim().length > NOTE_MAX) errors.note = MESSAGES.noteTooLong
  return errors
}

const FIELD_ORDER: readonly RsvpField[] = ['name', 'count', 'note']

/** First invalid field in visual order, used to move focus after a failed submit. */
export function firstInvalidField(errors: RsvpErrors): RsvpField | null {
  return FIELD_ORDER.find((field) => errors[field] !== undefined) ?? null
}

export function clampCount(value: number): number {
  if (!Number.isFinite(value)) return COUNT_MIN
  return Math.min(COUNT_MAX, Math.max(COUNT_MIN, Math.round(value)))
}

/** Raw input value → number, or null when empty or not numeric. Not clamped so validation can report the range. */
export function parseCount(raw: string): number | null {
  const text = raw.trim()
  if (text === '') return null
  const n = Number(text)
  return Number.isFinite(n) ? n : null
}

/** Payload for `addRsvp`: trimmed/limited strings; count and meal are reset when not attending. */
export function toRsvpInput(form: RsvpForm): RsvpInput {
  const note = form.note.trim().slice(0, NOTE_MAX)
  return {
    side: form.side,
    name: form.name.trim().slice(0, NAME_MAX),
    attending: form.attending,
    count: form.attending ? clampCount(form.count ?? COUNT_MIN) : 0,
    meal: form.attending ? form.meal : '',
    note: note === '' ? undefined : note,
  }
}

const MEAL_SUMMARY: Record<Meal, string> = { yes: '식사 함', no: '식사 안 함', '': '식사 미정' }

/** "신랑 측 · 이OO · 참석 2명 · 식사 함" / "신부 측 · 박OO · 불참" shown in the success state. */
export function summaryLine(input: RsvpInput): string {
  const side = SIDE_OPTIONS.find((o) => o.value === input.side)?.label ?? ''
  const parts = [side, input.name]
  if (input.attending) parts.push(`참석 ${input.count}명`, MEAL_SUMMARY[input.meal])
  else parts.push('불참')
  return parts.join(' · ')
}

type EventInfo = Pick<WeddingConfig['event'], 'startsAt' | 'datePlaceholder' | 'venueName'>

/** Date and venue on one line, only the year is printed while the date is a placeholder */
export function rsvpEventLine(event: EventInfo): string {
  const date = event.datePlaceholder ? `${toKstParts(event.startsAt).year}년 OO월 OO일` : formatDateKo(event.startsAt)
  return `${date} · ${event.venueName}`
}
