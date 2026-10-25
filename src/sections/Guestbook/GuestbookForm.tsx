import { useRef, useState, type ChangeEvent, type FormEvent, type RefObject } from 'react'
import Button from '@/components/Button'
import { useToast } from '@/components/toast-context'
import { addGuestbook, type GuestbookEntry } from '@/lib/sheets'
import {
  EMPTY_FORM,
  MESSAGE_MAX,
  NAME_MAX,
  PASSWORD_MIN,
  normalizeForm,
  validateForm,
  type GuestbookField,
  type GuestbookFormValues,
} from './guestbook'

const ADD_FAILED = '메시지를 남기지 못했습니다. 잠시 후 다시 시도해 주세요.'
const ADDED = '소중한 마음 감사합니다'
// 16px on inputs keeps iOS Safari from zooming the page on focus.
const FIELD =
  'w-full rounded-none border-0 border-b border-line bg-transparent px-0 py-2 text-[16px] text-ink ' +
  'placeholder:text-ink-muted/60 transition-colors focus:border-accent focus:outline-none aria-invalid:border-accent'
const LABEL = 'block text-[13px] text-ink-muted'
const HINT = 'mt-1.5 text-[13px] text-ink-muted'

interface GuestbookFormProps {
  /** Called with the entry the backend stored, so the list can show it at once. */
  onAdded: (entry: GuestbookEntry) => void
}

export default function GuestbookForm({ onAdded }: GuestbookFormProps) {
  const toast = useToast()
  const [values, setValues] = useState<GuestbookFormValues>(EMPTY_FORM)
  const [invalid, setInvalid] = useState<GuestbookField | null>(null)
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
    if (invalid === field) setInvalid(null)
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return
    const error = validateForm(values)
    if (error) {
      setInvalid(error.field)
      toast.show(error.message)
      fieldRefs[error.field].current?.focus()
      return
    }
    setSubmitting(true)
    const res = await addGuestbook(normalizeForm(values))
    setSubmitting(false)
    if (!res.ok) {
      toast.show(res.error || ADD_FAILED)
      return
    }
    onAdded(res.entry)
    setValues(EMPTY_FORM)
    toast.show(ADDED)
  }

  const count = values.message.length

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-label="축하 메시지 남기기"
      className="rounded-[12px] border border-line bg-bg-elevated p-5"
    >
      <div>
        <label htmlFor="guestbook-name" className={LABEL}>
          이름
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
          placeholder="성함"
          aria-invalid={invalid === 'name' || undefined}
          className={FIELD}
        />
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
          aria-describedby="guestbook-message-count"
          aria-invalid={invalid === 'message' || undefined}
          className={`${FIELD} resize-none leading-relaxed`}
        />
        <p
          id="guestbook-message-count"
          className={`${HINT} text-right tabular-nums ${count >= MESSAGE_MAX ? 'text-accent' : ''}`}
        >
          {count}/{MESSAGE_MAX}
        </p>
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
          placeholder={`${PASSWORD_MIN}자 이상`}
          aria-describedby="guestbook-password-help"
          aria-invalid={invalid === 'password' || undefined}
          className={FIELD}
        />
        <p id="guestbook-password-help" className={HINT}>
          삭제 시 필요합니다
        </p>
      </div>

      <Button
        type="submit"
        variant="primary"
        aria-disabled={submitting}
        className="mt-6 w-full aria-disabled:opacity-50"
      >
        {submitting ? '남기는 중…' : '남기기'}
      </Button>
    </form>
  )
}
