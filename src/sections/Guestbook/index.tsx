import { useCallback, useRef, useState } from 'react'
import Button from '@/components/Button'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import { isPreviewBackend } from '@/lib/sheets'
import EntryCard from './EntryCard'
import GuestbookForm from './GuestbookForm'
import { PAGE_SIZE, paginate } from './guestbook'
import { useGuestbook } from './useGuestbook'

const REVEAL_STEP = 0.12
const PREVIEW_NOTICE = '미리보기 모드 · 이 기기에만 저장됩니다 (Google 연동 전)'
const SKELETON_ROWS = 3

function Skeleton() {
  return (
    <>
      <p role="status" className="sr-only">
        방명록을 불러오는 중입니다
      </p>
      <ul aria-hidden="true" className="divide-y divide-line border-y border-line motion-safe:animate-pulse">
        {Array.from({ length: SKELETON_ROWS }, (_, i) => (
          <li key={i} className="py-5">
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-16 rounded bg-line" />
              <div className="h-3 w-20 rounded bg-line" />
            </div>
            <div className="mt-4 h-3.5 w-full rounded bg-line" />
            <div className="mt-2 h-3.5 w-3/4 rounded bg-line" />
          </li>
        ))}
      </ul>
    </>
  )
}

export default function Guestbook() {
  const { entries, loading, insert, remove } = useGuestbook()
  const [shown, setShown] = useState(PAGE_SIZE)
  const [promptId, setPromptId] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // The deleted card unmounts with the focused prompt inside it; park focus on the list.
  const handleDeleted = useCallback(
    (id: string) => {
      remove(id)
      setPromptId(null)
      listRef.current?.focus({ preventScroll: true })
    },
    [remove],
  )

  const { visible, remaining } = paginate(entries, shown)

  return (
    <Section id="guestbook" eyebrow="GUESTBOOK" title="축하의 한마디">
      {isPreviewBackend && (
        <p role="note" className="-mt-6 mb-8 text-center">
          <span className="inline-block rounded-full border border-line bg-bg-elevated px-3 py-1 text-[13px] font-medium text-accent">
            {PREVIEW_NOTICE}
          </span>
        </p>
      )}

      <Reveal>
        <GuestbookForm onAdded={insert} />
      </Reveal>

      <Reveal delay={REVEAL_STEP} className="mt-12">
        <div ref={listRef} tabIndex={-1} aria-busy={loading} className="outline-none">
          <h3 className="sr-only">남겨진 메시지</h3>
          {loading ? (
            <Skeleton />
          ) : (
            <>
              {entries.length > 0 && (
                <p className="mb-2 text-right text-[13px] text-ink-muted tabular-nums">{entries.length}개의 메시지</p>
              )}
              <ul
                aria-live="polite"
                aria-relevant="additions"
                className={entries.length > 0 ? 'divide-y divide-line border-y border-line' : undefined}
              >
                {visible.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    prompting={promptId === entry.id}
                    onPrompt={setPromptId}
                    onDeleted={handleDeleted}
                  />
                ))}
              </ul>
              {entries.length === 0 && (
                <p className="border-y border-line py-10 text-center text-[15px] leading-relaxed text-ink-muted">
                  아직 남겨진 메시지가 없습니다.
                  <br />첫 번째 축하를 전해 주세요.
                </p>
              )}
              {remaining > 0 && (
                <div className="mt-6 flex justify-center">
                  <Button variant="outline" size="sm" onClick={() => setShown((s) => s + PAGE_SIZE)}>
                    더 보기 ({remaining})
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </Reveal>
    </Section>
  )
}
