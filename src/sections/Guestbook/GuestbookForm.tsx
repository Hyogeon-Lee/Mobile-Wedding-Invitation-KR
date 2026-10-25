import { useRef, useState, type ChangeEvent, type FormEvent, type RefObject } from 'react'
import Button from '@/components/Button'
import { useToast } from '@/components/toast-context'
import { addGuestbook, type GuestbookEntry } from '@/lib/sheets'
import FieldError from './FieldError'
import {
  describedBy,
  EMPTY_FORM,
  MESSAGE_MAX,
  NAME_MAX,
  PASSWORD_MIN,
  normalizeForm,
  validateForm,
  type FormError,
  type GuestbookField,
  type GuestbookFormValues,
} from './guestbook'

const ADD_FAILED = '메시지를 남기지 못했습니다. 잠시 후 다시 시도해 주세요.'
const ADDED = '소중한 마음 감사합니다'
// 16px on inputs keeps iOS Safari from zooming the page on focus.
const FIELD =
  'w-full rounded-none border-0 border-b border-line bg-transparent px-0 py-2 text-[1rem] text-ink ' +
  'placeholder:text-ink-muted transition-colors focus:border-accent focus:outline-none aria-invalid:border-accent'
const LABEL = 'block text-[0.8125rem] text-ink-muted'
const HINT = 'mt-1.5 text-[0.8125rem] text-ink-muted'
const errorId = (field: GuestbookField) => `guestbook-${field}-error`
const SERVER_ERROR_ID = 'guestbook-server-error'

interface GuestbookFormProps {
  /** Called with the entry the backend stored, so the list can show it at once. */
  onAdded: (entry: GuestbookEntry) => void
}

export default function GuestbookForm({ onAdded }: GuestbookFormProps) {
  const toast = useToast()
  const [values, setValues] = useState<GuestbookFormValues>(EMPTY_FORM)
  // Errors stay inline: a bottom toast sits behind the iOS keyboard and hides after 1.8 s.
  const [error, setError] = useState<FormError | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const fieldRefs: Record<GuestbookField, RefObject<HTMLElement | null>> = {
    name: nameRef,
    message: messageRef,
    password: passwordRef,
  }

  const update = (field: GuestbookField) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value
    setValues((v) => ({ ...v, [field]: value }))
    setError((err) => (err?.field === field ? null : err))
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return
    const invalid = validateForm(values)
    setError(invalid)
    setServerError(null)
    if (invalid) {
      fieldRefs[invalid.field].current?.focus()
      return
    }
    setSubmitting(true)
    const res = await addGuestbook(normalizeForm(values))
    setSubmitting(false)
    if (!res.ok) {
      setServerError(res.error || ADD_FAILED)
      return
    }
    onAdded(res.entry)
    setValues(EMPTY_FORM)
    toast.show(ADDED)
  }

  const count = values.message.length
  const fieldError = (field: GuestbookField) => (error?.field === field ? error.message : null)

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-label="축하 메시지 남기기"
      className="rounded-[12px] border border-line bg-bg-elevated p-5"
    >
      <div>
        <label htmlFor="guestbook-name" className={LABEL}>
          성함
        </label>
        <input
          ref={nameRef}
          id="guestbook-name"
          name="name"
          type="text"
          value={values.name}
          onChange={update('name')}
          maxLength={NAME_MAX}
          required
          autoComplete="name"
          enterKeyHint="next"
          aria-invalid={error?.field === 'name' || undefined}
          aria-describedby={describedBy(fieldError('name') && errorId('name'))}
          className={FIELD}
        />
        <FieldError id={errorId('name')} message={fieldError('name')} className="mt-1.5" />
      </div>

      <div className="mt-5">
        <label htmlFor="guestbook-message" className={LABEL}>
          메시지
        </label>
        <textarea
          ref={messageRef}
          id="guestbook-message"
          name="message"
          rows={4}
          value={values.message}
          onChange={update('message')}
          maxLength={MESSAGE_MAX}
          required
          placeholder="두 사람에게 전하고 싶은 축하의 말을 남겨 주세요."
          aria-describedby={describedBy(fieldError('message') && errorId('message'), 'guestbook-message-count')}
          aria-invalid={error?.field === 'message' || undefined}
          className={`${FIELD} resize-none leading-relaxed`}
        />
        <p
          id="guestbook-message-count"
          className={`${HINT} text-right tabular-nums ${count >= MESSAGE_MAX ? 'text-accent' : ''}`}
        >
          {count}/{MESSAGE_MAX}
        </p>
        <FieldError id={errorId('message')} message={fieldError('message')} className="mt-1.5" />
      </div>

      <div className="mt-3">
        <label htmlFor="guestbook-password" className={LABEL}>
          비밀번호
        </label>
        <input
          ref={passwordRef}
          id="guestbook-password"
          name="password"
          type="password"
          value={values.password}
          onChange={update('password')}
          minLength={PASSWORD_MIN}
          required
          autoComplete="off"
          enterKeyHint="done"
          aria-describedby={describedBy(fieldError('password') && errorId('password'), 'guestbook-password-help')}
          aria-invalid={error?.field === 'password' || undefined}
          className={FIELD}
        />
        <p id="guestbook-password-help" className={HINT}>
          {PASSWORD_MIN}자 이상 · 삭제 시 필요합니다
        </p>
        <FieldError id={errorId('password')} message={fieldError('password')} className="mt-1.5" />
      </div>

      <FieldError id={SERVER_ERROR_ID} message={serverError} className="mt-6" />

      <Button
        type="submit"
        variant="primary"
        aria-disabled={submitting}
        aria-describedby={serverError ? SERVER_ERROR_ID : undefined}
        className={`${serverError ? 'mt-3' : 'mt-6'} w-full aria-disabled:opacity-50`}
      >
        {submitting ? '남기는 중…' : '남기기'}
      </Button>
    </form>
  )
}
