import { ExternalLink } from 'lucide-react'
import { Fragment } from 'react'
import CopyButton from '@/components/CopyButton'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import { useToast } from '@/components/toast-context'
import { wedding } from '@/config/wedding'
import { REVEAL_STEP } from '@/lib/motion'
import { openAppScheme } from '@/lib/openApp'
import { accounts, isSampleData, type Account } from '@/lib/private'
import Accordion from './Accordion'
import { accountGroups, copyValue, payLinks } from './accounts'

const groups = accountGroups(accounts)

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
        <div className="-ml-3 mt-1 flex flex-wrap gap-x-2">
          {links.map((link) => (
            <a
              key={link.key}
              href={link.href}
              {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              onClick={
                link.external
                  ? undefined
                  : (e) => {
                      e.preventDefault()
                      openAppScheme(link.href, {
                        timeoutMs: 2500,
                        onFail: () => toast.show(`${link.label} 앱이 설치되어 있어야 합니다`),
                      })
                    }
              }
              className={`pressable inline-flex h-11 items-center gap-1 rounded-full px-3 text-[0.8125rem] text-ink-muted select-none hover:text-accent active:bg-mint/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${link.external ? '' : '[-webkit-touch-callout:none]'}`}
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
      eyebrow={wedding.account.eyebrow}
      title={wedding.account.title}
      top="md"
      bottom="md"
      wash="mint"
      badge={
        isSampleData ? (
          <span className="rounded-full border border-line bg-bg-elevated px-3 py-0.5 text-[0.75rem] tracking-[0.02em] text-accent">
            예시 계좌
          </span>
        ) : undefined
      }
    >
      <Reveal>
        <p className="text-[0.9375rem] leading-[1.8] text-ink-muted">
          {wedding.account.intro.map((line, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </p>
      </Reveal>

      {groups.length > 0 && (
        <Reveal delay={REVEAL_STEP} className="mt-10 divide-y divide-line border-y border-line">
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
