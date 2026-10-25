import { describe, expect, it } from 'vitest'
import type { Account, Accounts } from '@/lib/private'
import { accountGroups, copyValue, isSafeHref, payLinks } from './accounts'

const groomRow: Account = { holder: '이OO', bank: 'OO은행', number: '000-000-000000' }
const brideRow: Account = { holder: '박OO', bank: 'XX은행', number: '111-111-111111' }

describe('accountGroups', () => {
  it('lists groom then bride with Korean titles', () => {
    const groups = accountGroups({ groom: [groomRow], bride: [brideRow] })
    expect(groups.map((g) => [g.side, g.title])).toEqual([
      ['groom', '신랑측 계좌번호'],
      ['bride', '신부측 계좌번호'],
    ])
    expect(groups[0].entries).toEqual([groomRow])
  })
  it('hides a side whose array is empty', () => {
    expect(accountGroups({ groom: [], bride: [brideRow] }).map((g) => g.side)).toEqual(['bride'])
    expect(accountGroups({ groom: [], bride: [] })).toEqual([])
  })
  it('drops rows missing holder, bank or number and tolerates a non-array side', () => {
    const malformed = {
      groom: [groomRow, { holder: '', bank: 'OO은행', number: '1' }, { holder: '이OO', bank: 'OO은행' }, null],
      bride: 'oops',
    } as unknown as Accounts
    const groups = accountGroups(malformed)
    expect(groups.map((g) => g.side)).toEqual(['groom'])
    expect(groups[0].entries).toEqual([groomRow])
  })
})

describe('copyValue', () => {
  it('joins bank and number with a single space, trimmed', () => {
    expect(copyValue({ holder: 'a', bank: ' OO은행 ', number: ' 000-000-000000 ' })).toBe('OO은행 000-000-000000')
  })
})

describe('isSafeHref', () => {
  it('accepts web links and the pay apps’ schemes', () => {
    expect(isSafeHref('https://qr.kakaopay.com/abc')).toBe(true)
    expect(isSafeHref('http://toss.me/abc')).toBe(true)
    expect(isSafeHref('supertoss://send?bank=OO&accountNo=1')).toBe(true)
    expect(isSafeHref('kakaotalk://kakaopay/money/to/bank')).toBe(true)
  })
  it('rejects empty, malformed and script URLs', () => {
    expect(isSafeHref(undefined)).toBe(false)
    expect(isSafeHref('  ')).toBe(false)
    expect(isSafeHref('toss.me/abc')).toBe(false)
    expect(isSafeHref('javascript:alert(1)')).toBe(false)
    expect(isSafeHref('data:text/html,hi')).toBe(false)
  })
})

describe('payLinks', () => {
  it('returns Kakao Pay before Toss with trimmed hrefs', () => {
    const links = payLinks({ ...groomRow, tossUrl: ' https://toss.me/x ', kakaopayUrl: 'https://qr.kakaopay.com/y' })
    expect(links.map((l) => [l.key, l.label, l.href])).toEqual([
      ['kakaopay', '카카오페이', 'https://qr.kakaopay.com/y'],
      ['toss', '토스', 'https://toss.me/x'],
    ])
  })
  it('is empty when no link is set or the link is unsafe', () => {
    expect(payLinks(groomRow)).toEqual([])
    expect(payLinks({ ...groomRow, kakaopayUrl: 'javascript:void 0' })).toEqual([])
  })
})
