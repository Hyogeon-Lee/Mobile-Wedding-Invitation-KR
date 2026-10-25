import { AlertCircle, Check, Info, Loader2, Minus, Plus, Send } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import Button from '@/components/Button'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import { wedding } from '@/config/wedding'
import { addRsvp, isPreviewBackend, type RsvpInput } from '@/lib/sheets'
import Segmented from './Segmented'
import {
  ATTENDING_OPTIONS,
  clampCount,
  COUNT_MAX,
  COUNT_MIN,
  defaultForm,
  firstInvalidField,
  MEAL_OPTIONS,
  NAME_MAX,
  NOTE_MAX,
  parseCount,
  rsvpEventLine,
  SIDE_OPTIONS,
  summaryLine,
  toRsvpInput,
  validateRsvp,
  type RsvpErrors,
  type RsvpForm,
} from './form'

const REVEAL_STEP = 0.12
const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
const LABEL = 'mb-2 block text-[13px] font-medium tracking-wide text-ink-muted'
const FIELD =
  'w-full rounded-[12px] border bg-bg-elevated px-4 text-[16px] text-ink placeholder:text-ink-muted/70 ' +
  `transition-colors disabled:opacity-50 ${FOCUS_RING}`
const STEP_BUTTON =
  `flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-ink transition-colors ${FOCUS_RING} ` +
  'hover:bg-accent-soft/60 active:bg-accent-soft disabled:opacity-40 disabled:hover:bg-transparent'

type Status = 'idle' | 'submitting' | 'success'

function fieldClass(invalid: boolean, extra = ''): string {
  return `${FIELD} ${invalid ? 'border-accent' : 'border-line'} ${extra}`
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-2 flex items-start gap-1.5 text-[14px] leading-relaxed text-ink">
      <AlertCircle size={15} aria-hidden="true" className="mt-[4px] shrink-0 text-accent" />
      <span>{message}</span>
    </p>
  )
}

export default function Rsvp() {
  const [form, setForm] = useState<RsvpForm>(defaultForm)
  const [attempted, setAttempted] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [serverError, setServerError] = useState<string | null>(null)
  const [sent, setSent] = useState<RsvpInput | null>(null)
  // Incremented by "다시 작성" so the effect below can move focus into the fresh form.
  const [round, setRound] = useState(0)

  const nameRef = useRef<HTMLInputElement>(null)
  const countRef = useRef<HTMLInputElement>(null)
  const noteRef = useRef<HTMLTextAreaElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  const id = useId()
  const nameId = `${id}-name`
  const nameErrorId = `${id}-name-error`
  const countId = `${id}-count`
  const countErrorId = `${id}-count-error`
  const noteId = `${id}-note`
  const noteHintId = `${id}-note-hint`
  const noteErrorId = `${id}-note-error`
  const serverErrorId = `${id}-server-error`

  // Errors are derived, not stored: shown only after the first submit attempt and
  // recomputed on every edit so a message disappears as soon as the field is fixed.
  const errors: RsvpErrors = attempted ? validateRsvp(form) : {}
  const submitting = status === 'submitting'
  const count = form.count ?? COUNT_MIN

  const update = useCallback(<K extends keyof RsvpForm>(key: K, value: RsvpForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return
    const found = validateRsvp(form)
    const first = firstInvalidField(found)
    if (first) {
      setAttempted(true)
      const refs = { name: nameRef, count: countRef, note: noteRef }
      refs[first].current?.focus()
      return
    }
    const input = toRsvpInput(form)
    setServerError(null)
    setStatus('submitting')
    const result = await addRsvp(input)
    if (result.ok) {
      setSent(input)
      setStatus('success')
    } else {
      setServerError(result.error || '전송에 실패했습니다. 잠시 후 다시 시도해 주세요.')
      setStatus('idle')
    }
  }

  const reset = useCallback(() => {
    setForm(defaultForm())
    setAttempted(false)
    setServerError(null)
    setSent(null)
    setStatus('idle')
    setRound((r) => r + 1)
  }, [])

  useEffect(() => {
    if (status === 'success') successRef.current?.focus({ preventScroll: true })
  }, [status])

  useEffect(() => {
    if (round > 0) nameRef.current?.focus({ preventScroll: true })
  }, [round])

  const { event } = wedding

  return (
    <Section id="rsvp" eyebrow="RSVP" title="참석 의사 전달">
      <Reveal className="text-center">
        <p className="text-[15px] leading-relaxed text-ink-muted">
          귀한 발걸음을 미리 알려주시면
          <br />
          정성껏 준비하는 데 큰 도움이 됩니다.
          <br />
          참석이 어려우셔도 편하게 전해 주세요.
        </p>
        <p className="mt-4 font-serif text-[16px] leading-relaxed text-ink">{rsvpEventLine(event)}</p>
      </Reveal>

      <Reveal delay={REVEAL_STEP} className="mt-10">
        {status === 'success' ? (
          <div className="rounded-[12px] border border-line bg-bg-elevated px-6 py-10 text-center">
            <div ref={successRef} tabIndex={-1} role="status" className="outline-none">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Check size={22} aria-hidden="true" />
              </span>
              <p className="mt-5 font-serif text-[18px] leading-snug text-ink">전달되었습니다. 감사합니다.</p>
              {sent && <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{summaryLine(sent)}</p>}
            </div>
            <Button variant="outline" size="sm" className="mt-7" onClick={reset}>
              다시 작성
            </Button>
          </div>
        ) : (
          <form noValidate onSubmit={onSubmit} className="space-y-7">
            {isPreviewBackend && (
              <p
                role="note"
                className="flex items-start gap-2 rounded-[12px] border border-line bg-bg-elevated px-4 py-3 text-[13px] leading-relaxed text-ink-muted"
              >
                <Info size={14} aria-hidden="true" className="mt-[4px] shrink-0 text-accent" />
                <span>미리보기 모드 · Google 연동 전에는 전송 내용이 저장되지 않습니다</span>
              </p>
            )}

            <Segmented
              label="구분"
              value={form.side}
              options={SIDE_OPTIONS}
              onChange={(side) => update('side', side)}
              disabled={submitting}
            />

            <div>
              <label htmlFor={nameId} className={LABEL}>
                성함
                <span aria-hidden="true" className="ml-1 text-accent">
                  *
                </span>
              </label>
              <input
                ref={nameRef}
                id={nameId}
                name="name"
                type="text"
                autoComplete="name"
                placeholder="참석자 성함"
                maxLength={NAME_MAX}
                value={form.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => update('name', e.target.value)}
                disabled={submitting}
                aria-required="true"
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? nameErrorId : undefined}
                className={fieldClass(Boolean(errors.name), 'h-12')}
              />
              <FieldError id={nameErrorId} message={errors.name} />
            </div>

            <Segmented
              label="참석 여부"
              value={form.attending ? 'yes' : 'no'}
              options={ATTENDING_OPTIONS}
              onChange={(v) => update('attending', v === 'yes')}
              disabled={submitting}
            />

            {form.attending && (
              <>
                <div>
                  <label htmlFor={countId} className={LABEL}>
                    참석 인원
                    <span className="ml-1 font-normal">(본인 포함)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 items-center rounded-full border bg-bg-elevated ${
                        errors.count ? 'border-accent' : 'border-line'
                      }`}
                    >
                      <button
                        type="button"
                        aria-label="인원 줄이기"
                        onClick={() => update('count', clampCount(count - 1))}
                        disabled={submitting || count <= COUNT_MIN}
                        className={STEP_BUTTON}
                      >
                        <Minus size={16} aria-hidden="true" />
                      </button>
                      <input
                        ref={countRef}
                        id={countId}
                        name="count"
                        type="number"
                        inputMode="numeric"
                        min={COUNT_MIN}
                        max={COUNT_MAX}
                        step={1}
                        value={form.count ?? ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => update('count', parseCount(e.target.value))}
                        disabled={submitting}
                        aria-invalid={errors.count ? true : undefined}
                        aria-describedby={errors.count ? countErrorId : undefined}
                        className={`h-12 w-14 bg-transparent text-center text-[16px] text-ink tabular-nums ${FOCUS_RING} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                      />
                      <button
                        type="button"
                        aria-label="인원 늘리기"
                        onClick={() => update('count', clampCount(count + 1))}
                        disabled={submitting || count >= COUNT_MAX}
                        className={STEP_BUTTON}
                      >
                        <Plus size={16} aria-hidden="true" />
                      </button>
                    </div>
                    <span className="text-[15px] text-ink-muted">명</span>
                  </div>
                  <FieldError id={countErrorId} message={errors.count} />
                </div>

                <Segmented
                  label="식사 여부"
                  value={form.meal}
                  options={MEAL_OPTIONS}
                  onChange={(meal) => update('meal', meal)}
                  disabled={submitting}
                />
              </>
            )}

            <div>
              <label htmlFor={noteId} className={LABEL}>
                전하실 말씀
                <span className="ml-1 font-normal">(선택)</span>
              </label>
              <textarea
                ref={noteRef}
                id={noteId}
                name="note"
                rows={3}
                maxLength={NOTE_MAX}
                placeholder="축하 인사나 요청 사항을 남겨 주세요"
                value={form.note}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => update('note', e.target.value)}
                disabled={submitting}
                aria-invalid={errors.note ? true : undefined}
                aria-describedby={errors.note ? `${noteErrorId} ${noteHintId}` : noteHintId}
                className={fieldClass(Boolean(errors.note), 'resize-none py-3 leading-relaxed')}
              />
              <p id={noteHintId} className="mt-1.5 text-right text-[12px] text-ink-muted tabular-nums">
                {form.note.length} / {NOTE_MAX}
              </p>
              <FieldError id={noteErrorId} message={errors.note} />
            </div>

            <div className="pt-1">
              {serverError && (
                <p
                  id={serverErrorId}
                  role="alert"
                  className="mb-3 flex items-start gap-1.5 text-[14px] leading-relaxed text-ink"
                >
                  <AlertCircle size={15} aria-hidden="true" className="mt-[4px] shrink-0 text-accent" />
                  <span>{serverError}</span>
                </p>
              )}
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={submitting}
                aria-busy={submitting}
                aria-describedby={serverError ? serverErrorId : undefined}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} aria-hidden="true" className="animate-spin" />
                    전송 중…
                  </>
                ) : (
                  <>
                    <Send size={16} aria-hidden="true" />
                    참석 의사 전달하기
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </Reveal>
    </Section>
  )
}
