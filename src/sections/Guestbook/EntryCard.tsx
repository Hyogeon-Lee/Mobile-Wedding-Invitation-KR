import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import Button from '@/components/Button'
import { useToast } from '@/components/toast-context'
import { deleteGuestbook, type GuestbookEntry } from '@/lib/sheets'
import FieldError from './FieldError'
import { entryDomId, formatEntryDate, PASSWORD_MIN } from './guestbook'

const DELETE_FAILED = '삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.'
const DELETED = '메시지를 삭제했습니다'
const FIELD =
  'min-w-0 flex-1 rounded-none border-0 border-b border-line bg-transparent px-0 py-1.5 text-[1rem] text-ink ' +
  'placeholder:text-ink-muted transition-colors focus:border-accent focus:outline-none aria-invalid:border-accent'

interface DeletePromptProps {
  id: string
  entry: GuestbookEntry
  onCancel: () => void
  onDeleted: (id: string) => void
}

/** Inline password prompt under an entry. Escape cancels; errors stay next to the input. */
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
    onDeleted(entry.id)
  }

  return (
    <form
      id={id}
      onSubmit={submit}
      onKeyDown={onKeyDown}
      noValidate
      aria-label={`${entry.name}님의 메시지 삭제 확인`}
      className="mt-3 rounded-[12px] border border-line bg-bg-elevated p-3"
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
          enterKeyHint="done"
          placeholder="비밀번호"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={FIELD}
        />
        <Button type="submit" variant="primary" size="sm" aria-disabled={pending} className="aria-disabled:opacity-50">
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

  const cancel = () => {
    onPrompt(null)
    deleteRef.current?.focus({ preventScroll: true })
  }

  return (
    <li
      id={entryDomId(entry.id)}
      tabIndex={-1}
      className="py-5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 truncate font-serif text-[1rem] text-ink">{entry.name}</p>
        {date && (
          <time dateTime={entry.ts} className="shrink-0 text-[0.8125rem] text-ink-muted tabular-nums">
            {date}
          </time>
        )}
      </div>
      <p className="mt-2 text-[0.9375rem] leading-[1.8] whitespace-pre-line text-ink">{entry.message}</p>
      <div className="mt-1 flex justify-end">
        <button
          ref={deleteRef}
          type="button"
          aria-label={`${entry.name}님의 메시지 삭제`}
          aria-expanded={prompting}
          aria-controls={promptId}
          onClick={() => onPrompt(prompting ? null : entry.id)}
          className="-mr-2 h-8 px-2 text-[0.8125rem] text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          삭제
        </button>
      </div>
      {prompting && <DeletePrompt id={promptId} entry={entry} onCancel={cancel} onDeleted={onDeleted} />}
    </li>
  )
}
