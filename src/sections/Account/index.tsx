import { ExternalLink } from 'lucide-react'
import type { CSSProperties } from 'react'
import CopyButton from '@/components/CopyButton'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import { useToast } from '@/components/toast-context'
import { LightBloom } from '@/effects'
import { openAppScheme } from '@/lib/openApp'
import { accounts, isSampleData, type Account } from '@/lib/private'
import Accordion from './Accordion'
import { accountGroups, copyValue, payLinks } from './accounts'

const REVEAL_STEP = 0.12
const INTRO = ['참석이 어려우신 분들을 위해 계좌번호를 안내드립니다.', '전해 주시는 마음은 소중하게 간직하겠습니다.']
const groups = accountGroups(accounts)

/**
 * Static white light pooled behind the heading and intro: reads as light spreading from the centre
 * and keeps text-ink-muted / text-accent above 4.5:1 where the bloom blobs are densest.
 */
const LIGHT_WASH: CSSProperties = {
  background:
    'radial-gradient(ellipse 80% 62% at 50% 46%, rgb(255 255 255 / 0.74) 0%, rgb(255 255 255 / 0.6) 55%, rgb(255 255 255 / 0) 100%)',
}

/** Mint-to-blush band with drifting light; -z-10 inside the isolated section keeps it under the header and content. */
function AccountBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-linear-to-b from-mint/80 via-bg to-blush/60"
    >
      <LightBloom palette={['mint', 'blush']} intensity="soft" />
      <div className="absolute inset-x-0 top-0 h-96" style={LIGHT_WASH} />
    </div>
  )
}

function AccountRow({ account }: { account: Account }) {
  const links = payLinks(account)
  const toast = useToast()
  return (
    <li className="py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.9375rem] text-ink">{account.holder}</p>
          <p className="mt-0.5 text-[0.9375rem] text-ink-muted tabular-nums">
            {account.bank} {account.number}
          </p>
        </div>
        <CopyButton text={copyValue(account)} successMessage="계좌번호가 복사되었습니다" className="shrink-0" />
      </div>
      {links.length > 0 && (
        <div className="-ml-2 mt-2 flex flex-wrap gap-1">
          {links.map((link) => (
            <a
              key={link.key}
              href={link.href}
              {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              onClick={
                link.external
                  ? undefined
                  : (e) => {
                      // App schemes give no failure signal; infer "not installed" from the page staying visible.
                      e.preventDefault()
                      openAppScheme(link.href, {
                        timeoutMs: 2500,
                        onFail: () => toast.show(`${link.label} 앱이 설치되어 있어야 합니다`),
                      })
                    }
              }
              className="inline-flex h-8 items-center gap-1 rounded-full px-2 text-[0.8125rem] text-ink-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {link.label}
              <ExternalLink size={12} aria-hidden="true" />
              <span className="sr-only">{link.external ? '로 송금 (새 창)' : '로 송금 (앱 열림)'}</span>
            </a>
          ))}
        </div>
      )}
    </li>
  )
}

export default function Account() {
  return (
    <Section
      id="account"
      eyebrow="GIFT"
      title="마음 전하실 곳"
      tone="plain"
      className="relative isolate overflow-hidden"
      badge={
        isSampleData ? (
          <span className="rounded-full border border-line bg-bg-elevated px-3 py-0.5 text-[0.75rem] tracking-wide text-accent">
            예시 계좌
          </span>
        ) : undefined
      }
    >
      <AccountBackdrop />

      <Reveal>
        <p className="text-center text-[0.9375rem] leading-[1.85] text-ink-muted">
          {INTRO[0]}
          <br />
          {INTRO[1]}
        </p>
      </Reveal>

      {groups.length > 0 && (
        <Reveal delay={REVEAL_STEP} className="mt-10 flex flex-col gap-3">
          {groups.map((group) => (
            <Accordion key={group.side} id={`account-${group.side}`} title={group.title}>
              <ul className="divide-y divide-line">
                {group.entries.map((account, i) => (
                  <AccountRow key={i} account={account} />
                ))}
              </ul>
            </Accordion>
          ))}
        </Reveal>
      )}
    </Section>
  )
}
