import type { Parent, Person } from '@/config/types'

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
