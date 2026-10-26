import { describe, expect, it } from 'vitest'
import type { Person } from '@/config/types'
import type { Contacts } from '@/lib/private'
import { buildContactGroups, phoneDigits, presentParents, smsHref, telHref } from './family'

const groom: Person = { name: '이OO', relation: '아들', father: { name: '이AA' }, mother: { name: '김BB' } }
const bride: Person = { name: '박OO', relation: '딸', father: { name: '박CC' }, mother: { name: '최DD' } }

const contacts: Contacts = {
  groom: '010-1111-1111',
  bride: '010-2222-2222',
  groomFather: '010-3333-3333',
  groomMother: '010-4444-4444',
  brideFather: '010-5555-5555',
  brideMother: '010-6666-6666',
}

describe('presentParents', () => {
  it('returns father then mother when both exist', () => {
    expect(presentParents(groom).map((p) => p.name)).toEqual(['이AA', '김BB'])
  })
  it('skips a missing or blank parent', () => {
    expect(presentParents({ ...groom, father: undefined }).map((p) => p.name)).toEqual(['김BB'])
    expect(presentParents({ ...groom, mother: { name: '  ' } }).map((p) => p.name)).toEqual(['이AA'])
    expect(presentParents({ name: '이OO', relation: '아들' })).toEqual([])
  })
})

describe('phone links', () => {
  it('strips formatting and keeps a leading plus', () => {
    expect(phoneDigits('010-1234-5678')).toBe('01012345678')
    expect(phoneDigits(' +82 10-1234-5678 ')).toBe('+821012345678')
    expect(telHref('010-1234-5678')).toBe('tel:01012345678')
    expect(smsHref('010-1234-5678')).toBe('sms:01012345678')
  })
})

describe('buildContactGroups', () => {
  it('lists person, father, mother per side in order', () => {
    const groups = buildContactGroups({ groom, bride }, contacts)
    expect(groups.map((g) => g.side)).toEqual(['groom', 'bride'])
    expect(groups[0].entries.map((e) => [e.role, e.name, e.phone])).toEqual([
      ['신랑', '이OO', '010-1111-1111'],
      ['신랑 아버지', '이AA', '010-3333-3333'],
      ['신랑 어머니', '김BB', '010-4444-4444'],
    ])
    expect(groups[1].entries.map((e) => e.role)).toEqual(['신부', '신부 아버지', '신부 어머니'])
  })
  it('omits a parent missing from config even when a number exists', () => {
    const groups = buildContactGroups({ groom: { ...groom, father: undefined }, bride }, contacts)
    expect(groups[0].entries.map((e) => e.role)).toEqual(['신랑', '신랑 어머니'])
  })
  it('omits a parent without a number', () => {
    const groups = buildContactGroups({ groom, bride }, { ...contacts, brideMother: undefined, brideFather: '' })
    expect(groups[1].entries.map((e) => e.role)).toEqual(['신부'])
  })
  it('omits a deceased parent', () => {
    const groups = buildContactGroups({ groom: { ...groom, mother: { name: '김BB', deceased: true } }, bride }, contacts)
    expect(groups[0].entries.map((e) => e.role)).toEqual(['신랑', '신랑 아버지'])
  })
  it('drops a side with no numbers at all', () => {
    const groups = buildContactGroups(
      { groom, bride },
      { groom: '', bride: '010-2222-2222', groomFather: undefined, groomMother: undefined },
    )
    expect(groups.map((g) => g.side)).toEqual(['bride'])
  })
})
