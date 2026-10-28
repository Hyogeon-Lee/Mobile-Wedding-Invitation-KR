import { AlertCircle, Check, Loader2, Minus, Plus, Send } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Fragment, useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import Button from '@/components/Button'
import { FIELD, FIELD_INVALID_RING, FIELD_SURFACE } from '@/components/field'
import PreviewNotice from '@/components/PreviewNotice'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import { wedding } from '@/config/wedding'
import { haptic } from '@/lib/haptic'
import { EASE_OUT, REVEAL_STEP, SPRING, SPRING_FAST } from '@/lib/motion'
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

const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
const LABEL = 'mb-2 block text-[0.8125rem] tracking-[0.02em] text-ink-muted'
const STEP_BUTTON =
  `pressable flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-ink ${FOCUS_RING} ` +
  'hover:bg-accent-soft/60 active:bg-accent-soft disabled:opacity-40 disabled:hover:bg-transparent [--press-scale:0.92]'

type Status = 'idle' | 'submitting' | 'success'

interface FieldErrorProps {
  id: string
  message?: string | null
  className?: string
}

function FieldError({ id, message, className = 'mt-2' }: FieldErrorProps) {
  if (!message) return null
  return (
    <p id={id} role="alert" className={`${className} flex items-start gap-1.5 text-[0.9375rem] leading-relaxed text-ink`}>
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
  const reduce = useReducedMotion()

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

  const update = <K extends keyof RsvpForm>(key: K, value: RsvpForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

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
      haptic()
    } else {
      setServerError(result.error || '전송에 실패했습니다. 잠시 후 다시 시도해 주세요.')
      setStatus('idle')
    }
  }

  const reset = () => {
    setForm(defaultForm())
    setAttempted(false)
    setServerError(null)
    setSent(null)
    setStatus('idle')
    setRound((r) => r + 1)
  }

  useEffect(() => {
    if (status === 'success') successRef.current?.focus({ preventScroll: true })
  }, [status])

  useEffect(() => {
    if (round > 0) nameRef.current?.focus({ preventScroll: true })
  }, [round])

  const { event, rsvp } = wedding

  return (
    <Section id="rsvp" eyebrow={rsvp.eyebrow} title={rsvp.title} top="md" bottom="sm">
      <Reveal>
        <p className="text-[0.9375rem] leading-[1.8] text-ink-muted">
          {rsvp.intro.map((line, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </p>
        <p className="mt-4 font-serif text-[1rem] leading-relaxed text-ink">{rsvpEventLine(event)}</p>
      </Reveal>

      <Reveal delay={REVEAL_STEP} className="mt-12">
        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="rounded-2xl border border-line bg-bg-elevated px-6 py-10 text-center"
          >
            <div ref={successRef} tabIndex={-1} role="status" className="outline-none">
              <motion.span
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...SPRING, delay: 0.08 }}
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent"
              >
                <Check size={22} aria-hidden="true" />
              </motion.span>
              <p className="mt-5 font-serif text-[1.125rem] leading-snug text-ink">전달되었습니다. 감사합니다.</p>
              {sent && <p className="mt-2 text-[0.9375rem] leading-[1.8] text-ink-muted">{summaryLine(sent)}</p>}
            </div>
            <Button variant="outline" size="sm" className="mt-7" onClick={reset}>
              다시 작성
            </Button>
          </motion.div>
        ) : (
          <motion.form
            noValidate
            onSubmit={onSubmit}
            initial={round > 0 ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="space-y-7"
          >
            {isPreviewBackend && <PreviewNotice>미리보기 모드 · 지금은 전송 내용이 저장되지 않습니다</PreviewNotice>}

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
                enterKeyHint="done"
                className={`${FIELD} h-12`}
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

            <AnimatePresence initial={false}>
              {form.attending && (
                <motion.div
                  key="attending"
                  className="mb-0"
                  initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0, overflow: 'hidden' }}
                  animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                  exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0, overflow: 'hidden' }}
                  transition={reduce ? { duration: 0.2, ease: EASE_OUT } : SPRING_FAST}
                >
                  <div className="space-y-7 pb-7">
                    <div>
                      <label htmlFor={countId} className={LABEL}>
                        참석 인원
                        <span className="ml-1">(본인 포함)</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 items-center rounded-full ${
                            errors.count ? `bg-[rgb(55_118_86/0.05)] ${FIELD_INVALID_RING}` : FIELD_SURFACE
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
                            className={`h-12 w-14 bg-transparent text-center text-[1rem] text-ink tabular-nums ${FOCUS_RING} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
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
                        <span className="text-[0.9375rem] text-ink-muted">명</span>
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label htmlFor={noteId} className={LABEL}>
                전하실 말씀
                <span className="ml-1">(선택)</span>
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
                className={`${FIELD} resize-none py-3 leading-relaxed`}
              />
              <p id={noteHintId} className="mt-1.5 text-right text-[0.8125rem] text-ink-muted tabular-nums">
                {form.note.length}/{NOTE_MAX}
              </p>
              <FieldError id={noteErrorId} message={errors.note} />
            </div>

            <div className="pt-1">
              <FieldError id={serverErrorId} message={serverError} className="mb-3" />
              <Button
                type="submit"
                variant="primary"
                className="w-full [--press-scale:0.98] aria-disabled:cursor-progress"
                aria-disabled={submitting || undefined}
                aria-busy={submitting}
                aria-describedby={serverError ? serverErrorId : undefined}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} aria-hidden="true" className="motion-safe:animate-spin" />
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
          </motion.form>
        )}
      </Reveal>
    </Section>
  )
}
