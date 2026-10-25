import type { Account, Accounts } from '@/lib/private'

export type Side = 'groom' | 'bride'

export const SIDES: readonly Side[] = ['groom', 'bride']

export const SIDE_LABEL: Record<Side, string> = { groom: '신랑', bride: '신부' }

export interface AccountGroup {
  side: Side
  /** "신랑측 계좌번호" */
  title: string
  entries: Account[]
}

function isFilled(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * One group per side, groom first. A row needs holder, bank and number
 * (VITE_ACCOUNTS is free-form JSON); a side without any valid row is dropped.
 */
export function accountGroups(accounts: Accounts): AccountGroup[] {
  return SIDES.map((side) => {
    const list: unknown = accounts[side]
    const entries = (Array.isArray(list) ? (list as Partial<Account>[]) : []).filter(
      (a): a is Account => Boolean(a) && isFilled(a.holder) && isFilled(a.bank) && isFilled(a.number),
    )
    return { side, title: `${SIDE_LABEL[side]}측 계좌번호`, entries }
  }).filter((group) => group.entries.length > 0)
}

/** Clipboard text: "OO은행 000-000-000000". */
export function copyValue(account: Account): string {
  return `${account.bank.trim()} ${account.number.trim()}`
}

export interface PayLink {
  key: 'kakaopay' | 'toss'
  label: string
  href: string
}

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'kakaotalk:', 'kakaopay:', 'supertoss:'])

/** Accepts web links and the two apps' deep-link schemes; rejects javascript:/data: and malformed values. */
export function isSafeHref(url: string | undefined): url is string {
  if (!isFilled(url)) return false
  try {
    return ALLOWED_PROTOCOLS.has(new URL(url.trim()).protocol)
  } catch {
    return false
  }
}

/** Kakao Pay first, then Toss; only links that pass `isSafeHref`. */
export function payLinks(account: Account): PayLink[] {
  const links: PayLink[] = []
  if (isSafeHref(account.kakaopayUrl))
    links.push({ key: 'kakaopay', label: '카카오페이', href: account.kakaopayUrl.trim() })
  if (isSafeHref(account.tossUrl)) links.push({ key: 'toss', label: '토스', href: account.tossUrl.trim() })
  return links
}
