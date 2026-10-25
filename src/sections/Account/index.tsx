import { ExternalLink } from 'lucide-react'
import CopyButton from '@/components/CopyButton'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import { accounts, isSampleData, type Account } from '@/lib/private'
import Accordion from './Accordion'
import { accountGroups, copyValue, payLinks } from './accounts'

const REVEAL_STEP = 0.12
const INTRO = ['참석이 어려우신 분들을 위해 계좌번호를 안내드립니다.', '전해주시는 마음은 소중하게 간직하겠습니다.']
const groups = accountGroups(accounts)

function AccountRow({ account }: { account: Account }) {
  const links = payLinks(account)
  return (
    <li className="py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-medium text-ink">{account.holder}</p>
          <p className="mt-0.5 text-[15px] text-ink-muted tabular-nums">
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
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1 rounded-full px-2 text-[13px] font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {link.label}
              <ExternalLink size={12} aria-hidden="true" />
              <span className="sr-only">로 송금 (새 창)</span>
            </a>
          ))}
        </div>
      )}
    </li>
  )
}

export default function Account() {
  return (
    <Section id="account" eyebrow="GIFT" title="마음 전하실 곳" tone="tinted">
      {isSampleData && (
        <p className="-mt-6 mb-8 text-center">
          <span className="rounded-full border border-line bg-bg-elevated px-2.5 py-0.5 text-[12px] font-medium tracking-wide text-accent">
            예시 계좌
          </span>
        </p>
      )}

      <Reveal>
        <p className="text-center text-[15px] leading-relaxed text-ink-muted">
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
