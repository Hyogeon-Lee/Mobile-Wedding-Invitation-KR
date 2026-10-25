import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import Button from '@/components/Button'
import PreviewNotice from '@/components/PreviewNotice'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import { REVEAL_STEP } from '@/lib/motion'
import { isPreviewBackend } from '@/lib/sheets'
import EntryCard from './EntryCard'
import GuestbookForm from './GuestbookForm'
import { entryDomId, PAGE_SIZE, paginate } from './guestbook'
import { useGuestbook } from './useGuestbook'

const PREVIEW_NOTICE = '미리보기 모드 · 메시지가 이 기기에만 저장됩니다'
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
  const { entries, loading, error, reload, insert, remove } = useGuestbook()
  const [shown, setShown] = useState(PAGE_SIZE)
  const [promptId, setPromptId] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  // Entry to focus once "더 보기" has rendered the next page (the button may unmount).
  const focusAfterMore = useRef<string | null>(null)

  useEffect(() => {
    const id = focusAfterMore.current
    if (!id) return
    focusAfterMore.current = null
    document.getElementById(entryDomId(id))?.focus({ preventScroll: true })
  }, [shown])

  const showMore = () => {
    focusAfterMore.current = entries[shown]?.id ?? null
    setShown((s) => s + PAGE_SIZE)
  }

  // The retry button unmounts while the skeleton shows; keep focus inside the list.
  const retry = () => {
    listRef.current?.focus({ preventScroll: true })
    reload()
  }

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
      {isPreviewBackend && <PreviewNotice className="-mt-6 mb-8">{PREVIEW_NOTICE}</PreviewNotice>}

      <Reveal>
        <GuestbookForm onAdded={insert} />
      </Reveal>

      <Reveal delay={REVEAL_STEP} amount="some" className="mt-12">
        <div ref={listRef} tabIndex={-1} aria-busy={loading} className="outline-none">
          <h3 className="sr-only">남겨진 메시지</h3>
          {loading ? (
            <Skeleton />
          ) : (
            <>
              {entries.length > 0 && !error && (
                <p className="mb-2 text-right text-[0.8125rem] text-ink-muted tabular-nums">{entries.length}개의 메시지</p>
              )}
              <ul className={entries.length > 0 ? 'divide-y divide-line border-y border-line' : undefined}>
                <AnimatePresence initial={false}>
                  {visible.map((entry) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      prompting={promptId === entry.id}
                      onPrompt={setPromptId}
                      onDeleted={handleDeleted}
                    />
                  ))}
                </AnimatePresence>
              </ul>
              {error ? (
                <div className={`border-y border-line py-10 text-center ${entries.length > 0 ? 'mt-6' : ''}`}>
                  <p role="alert" className="text-[0.9375rem] leading-[1.8] text-ink-muted">
                    {error}
                    <br />
                    잠시 후 다시 시도해 주세요.
                  </p>
                  <Button variant="outline" size="sm" onClick={retry} className="mt-4">
                    다시 시도
                  </Button>
                </div>
              ) : (
                entries.length === 0 && (
                  <p className="border-y border-line py-10 text-center text-[0.9375rem] leading-[1.8] text-ink-muted">
                    아직 남겨진 메시지가 없습니다.
                    <br />첫 번째 축하를 전해 주세요.
                  </p>
                )
              )}
              {remaining > 0 && (
                <div className="mt-6 flex justify-center">
                  <Button variant="outline" size="sm" onClick={showMore}>
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
