import type { Parent, Person } from '@/config/types'
import type { Contacts } from '@/lib/private'

export type Side = 'groom' | 'bride'

export const SIDES: readonly Side[] = ['groom', 'bride']

export const SIDE_LABEL: Record<Side, string> = { groom: '신랑', bride: '신부' }

export const DECEASED_MARK = '故'
/** U+2009 thin space between the deceased marker and the name. */
export const THIN_SPACE = ' '

/** Parents present in config (non-empty name), father first. */
export function presentParents(person: Person): Parent[] {
  return [person.father, person.mother].filter((p): p is Parent => Boolean(p && p.name.trim()))
}

export function parentDisplayName(parent: Parent): string {
  return parent.deceased ? `${DECEASED_MARK}${THIN_SPACE}${parent.name}` : parent.name
}

/** "이OO · 김OO의 아들"; "김OO의 아들" with one parent; "" when none is configured. */
export function parentsLine(person: Person): string {
  const parents = presentParents(person)
  if (parents.length === 0) return ''
  return `${parents.map(parentDisplayName).join(' · ')}의 ${person.relation}`
}

export interface ContactEntry {
  key: string
  /** "신랑", "신부 어머니" ... */
  role: string
  name: string
  phone: string
}

export interface ContactGroup {
  side: Side
  label: string
  entries: ContactEntry[]
}

/** Keeps digits and a leading "+" so tel:/sms: links open in every dialer. */
export function phoneDigits(phone: string): string {
  const trimmed = phone.trim()
  const plus = trimmed.startsWith('+') ? '+' : ''
  return plus + trimmed.replace(/\D/g, '')
}

export function telHref(phone: string): string {
  return `tel:${phoneDigits(phone)}`
}

export function smsHref(phone: string): string {
  return `sms:${phoneDigits(phone)}`
}

function hasPhone(phone: string | undefined): phone is string {
  return typeof phone === 'string' && /\d/.test(phone)
}

/**
 * Sheet rows per side: the person first, then father and mother.
 * A parent is listed only when present in config, not deceased, and given a number.
 * Sides without any number are dropped.
 */
export function buildContactGroups(couple: Record<Side, Person>, contacts: Contacts): ContactGroup[] {
  return SIDES.map((side) => {
    const person = couple[side]
    const label = SIDE_LABEL[side]
    const entries: ContactEntry[] = []

    const own = contacts[side]
    if (hasPhone(own)) entries.push({ key: side, role: label, name: person.name, phone: own })

    const parents = [
      { key: `${side}Father`, parent: person.father, phone: contacts[`${side}Father`], role: '아버지' },
      { key: `${side}Mother`, parent: person.mother, phone: contacts[`${side}Mother`], role: '어머니' },
    ]
    for (const { key, parent, phone, role } of parents) {
      if (!parent || !parent.name.trim() || parent.deceased || !hasPhone(phone)) continue
      entries.push({ key, role: `${label} ${role}`, name: parent.name, phone })
    }

    return { side, label, entries }
  }).filter((group) => group.entries.length > 0)
}
