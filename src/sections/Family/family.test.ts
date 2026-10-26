import { describe, expect, it } from 'vitest'
import type { Person } from '@/config/types'
import { presentParents } from './family'

const groom: Person = { name: '이OO', relation: '아들', father: { name: '이AA' }, mother: { name: '김BB' } }
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
