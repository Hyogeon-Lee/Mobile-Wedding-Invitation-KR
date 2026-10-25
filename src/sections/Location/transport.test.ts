import { describe, expect, it } from 'vitest'
import { transportEntries } from './transport'

describe('transportEntries', () => {
  it('keeps the fixed display order regardless of object key order', () => {
    const entries = transportEntries({
      shuttle: ['셔틀 A'],
      car: ['차 A'],
      subway: ['지하철 A'],
    })
    expect(entries.map((e) => [e.key, e.label])).toEqual([
      ['subway', '지하철'],
      ['car', '자가용'],
      ['shuttle', '셔틀'],
    ])
  })
  it('drops missing keys and keys whose lines are all blank', () => {
    const entries = transportEntries({ subway: [], bus: ['  ', ''], parking: ['주차 1시간 무료'] })
    expect(entries.map((e) => e.key)).toEqual(['parking'])
  })
  it('trims lines and drops blank ones within a block', () => {
    const entries = transportEntries({ bus: [' 간선 146 ', '', '지선 3412'] })
    expect(entries[0].lines).toEqual(['간선 146', '지선 3412'])
  })
  it('returns an empty list when nothing is configured', () => {
    expect(transportEntries({})).toEqual([])
  })
})
