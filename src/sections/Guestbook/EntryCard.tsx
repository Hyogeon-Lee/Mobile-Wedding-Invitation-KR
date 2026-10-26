import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import Button from '@/components/Button'
import { FIELD } from '@/components/field'
import { useToast } from '@/components/toast-context'
import { haptic } from '@/lib/haptic'
import { SPRING_FAST } from '@/lib/motion'
import { deleteGuestbook, type GuestbookEntry } from '@/lib/sheets'
import FieldError from './FieldError'
import { entryDomId, formatEntryDate, PASSWORD_MIN } from './guestbook'

const DELETE_FAILED = '삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.'
const DELETED = '메시지를 삭제했습니다'

interface DeletePromptProps {
  id: string
  entry: GuestbookEntry
  onCancel: () => void
  onDeleted: (id: string) => void
}

function DeletePrompt({ id, entry, onCancel, onDeleted }: DeletePromptProps) {
  const toast = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const inputId = `${id}-password`
  const errorId = `${id}-error`

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const onKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== 'Escape') return
    e.preventDefault()
    e.stopPropagation()
    onCancel()
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (pending) return
    if (password.length < PASSWORD_MIN) {
      setError(`비밀번호는 ${PASSWORD_MIN}자 이상 입력해 주세요.`)
      inputRef.current?.focus()
      return
    }
    setPending(true)
    setError(null)
    const res = await deleteGuestbook(entry.id, password)
    if (!res.ok) {
      setPending(false)
      setError(res.error || DELETE_FAILED)
      inputRef.current?.focus()
      return
    }
    toast.show(DELETED)
    haptic()
    onDeleted(entry.id)
  }

  return (
    <form
      id={id}
      onSubmit={submit}
      onKeyDown={onKeyDown}
      noValidate
      aria-label={`${entry.name}님의 메시지 삭제 확인`}
      className="mt-3"
    >
      <div className="flex items-center gap-2">
        <label htmlFor={inputId} className="sr-only">
          삭제 비밀번호
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={PASSWORD_MIN}
          autoComplete="off"
          enterKeyHint="go"
          placeholder="비밀번호"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${FIELD} h-11 min-w-0 flex-1`}
        />
        <Button type="submit" variant="outline" size="sm" aria-disabled={pending} className="aria-disabled:cursor-progress">
          {pending ? '확인 중…' : '확인'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          취소
        </Button>
      </div>
      <FieldError id={errorId} message={error} />
    </form>
  )
}

interface EntryCardProps {
  entry: GuestbookEntry
  /** true while this card shows its password prompt; the parent keeps one open at a time */
  prompting: boolean
  onPrompt: (id: string | null) => void
  onDeleted: (id: string) => void
}

export default function EntryCard({ entry, prompting, onPrompt, onDeleted }: EntryCardProps) {
  const deleteRef = useRef<HTMLButtonElement>(null)
  const promptId = `guestbook-delete-${entry.id}`
  const date = formatEntryDate(entry.ts)
  const reduce = useReducedMotion()

  const cancel = () => {
    onPrompt(null)
    deleteRef.current?.focus({ preventScroll: true })
  }

  return (
    <motion.li
      id={entryDomId(entry.id)}
      tabIndex={-1}
      className="outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
      animate={{ opacity: 1, height: 'auto', transitionEnd: { overflow: 'visible' } }}
      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
      transition={reduce ? { duration: 0 } : SPRING_FAST}
    >
      <div className="py-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="min-w-0 truncate font-serif text-[1rem] text-ink">{entry.name}</p>
          {date && (
            <time dateTime={entry.ts} className="shrink-0 text-[0.8125rem] text-ink-muted tabular-nums">
              {date}
            </time>
          )}
        </div>
        <p className="mt-2 text-[0.9375rem] leading-[1.8] whitespace-pre-line text-ink">{entry.message}</p>
        <div className="-mb-2 flex justify-end">
          <button
            ref={deleteRef}
            type="button"
            aria-label={`${entry.name}님의 메시지 삭제`}
            aria-expanded={prompting}
            aria-controls={promptId}
            onClick={() => onPrompt(prompting ? null : entry.id)}
            className="pressable -mr-3 inline-flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-[0.8125rem] text-ink-muted hover:text-ink active:bg-ink/5 active:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            삭제
          </button>
        </div>
        {prompting && <DeletePrompt id={promptId} entry={entry} onCancel={cancel} onDeleted={onDeleted} />}
      </div>
    </motion.li>
  )
}
