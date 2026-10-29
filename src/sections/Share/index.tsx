import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import CopyButton from '@/components/CopyButton'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import { useToast } from '@/components/toast-context'
import { wedding } from '@/config/wedding'
import { copyText } from '@/lib/clipboard'
import { kakaoKey, loadKakaoSdk, siteUrl } from '@/lib/kakao'
import { REVEAL_STEP } from '@/lib/motion'
import { fallbackCopyMessage, isShareAbort, kakaoFeedPayload, shareImageUrl } from './share'

/** Fetch the Kakao SDK this far before the buttons scroll in, so a tap calls sendDefault without a network wait */
const SDK_PRELOAD_MARGIN = '400px 0px'
/** Preview image under public/, regenerated with `npm run og` */
const OG_IMAGE_PATH = 'og-image.png'

function KakaoBubble() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M12 3C6.48 3 2 6.47 2 10.75c0 2.72 1.78 5.1 4.46 6.47l-.93 3.44c-.08.3.26.54.52.37l4.07-2.7c.61.08 1.24.12 1.88.12 5.52 0 10-3.47 10-7.7S17.52 3 12 3Z" />
    </svg>
  )
}

export default function Share() {
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const { share } = wedding
  const url = siteUrl()
  const actionsRef = useRef<HTMLDivElement>(null)
  const actionsNear = useInView(actionsRef, { once: true, margin: SDK_PRELOAD_MARGIN })

  useEffect(() => {
    if (actionsNear && kakaoKey) void loadKakaoSdk()
  }, [actionsNear])

  const shareViaKakao = async () => {
    if (busy) return
    setBusy(true)
    try {
      const ready = await loadKakaoSdk()
      if (ready && window.Kakao) {
        try {
          window.Kakao.Share.sendDefault(
            kakaoFeedPayload({
              title: share.kakaoTitle,
              description: share.kakaoDescription,
              imageUrl: shareImageUrl(url, OG_IMAGE_PATH),
              url,
            }),
          )
          return
        } catch (error) {
          // KakaoError (invalid settings/template) is thrown synchronously, so fall through to Web Share / copy
          console.warn('[share] Kakao sendDefault failed', error)
        }
      }
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({ title: share.kakaoTitle, text: share.kakaoDescription, url })
          return
        } catch (error) {
          if (isShareAbort(error)) return
        }
      }
      const copied = await copyText(url)
      toast.show(copied ? fallbackCopyMessage(kakaoKey !== '') : '복사에 실패했습니다. 길게 눌러 복사해 주세요.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Section id="share" eyebrow={share.eyebrow} title={share.title} top="md" bottom="sm">
      <Reveal>
        <p className="text-center text-[0.9375rem] leading-[1.8] text-ink-muted">{share.intro}</p>
      </Reveal>

      <Reveal delay={REVEAL_STEP} className="mt-10">
        <div ref={actionsRef} className="flex flex-col gap-3">
          <button
            type="button"
            onClick={shareViaKakao}
            disabled={busy}
            aria-busy={busy}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] px-6 text-[0.9375rem] font-medium text-[#191919] pressable [--press-scale:0.98] select-none hover:bg-[#F6DD00] active:bg-[#EDD500] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
          >
            <KakaoBubble />
            {share.buttonLabel}
          </button>
          <CopyButton
            text={url}
            label="링크 복사하기"
            successMessage="링크가 복사되었습니다"
            size="md"
            className="w-full [--press-scale:0.98]"
          />
        </div>
        <p className="mt-4 text-center text-[0.8125rem] leading-relaxed break-all text-ink-muted">{url}</p>
      </Reveal>
    </Section>
  )
}
