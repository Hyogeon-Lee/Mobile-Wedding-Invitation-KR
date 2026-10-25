import { describe, expect, it } from 'vitest'
import { calendarCells, calendarWeeks, isWeddingCell } from './grid'

describe('calendarCells', () => {
  it('pads leading blanks up to the first weekday and trailing blanks to a full week', () => {
    // 2027-05-01 is a Saturday: 6 blanks, 31 days, 5 blanks = 42 cells
    const cells = calendarCells(2027, 5)
    expect(cells).toHaveLength(42)
    expect(cells.slice(0, 7)).toEqual([null, null, null, null, null, null, 1])
    expect(cells[36]).toBe(31)
    expect(cells.slice(37)).toEqual([null, null, null, null, null])
  })
  it('adds no trailing blanks when the month ends on a Saturday', () => {
    // 2026-02-01 is a Sunday and February 2026 has 28 days: exactly 4 weeks
    const cells = calendarCells(2026, 2)
    expect(cells).toHaveLength(28)
    expect(cells[0]).toBe(1)
    expect(cells[27]).toBe(28)
  })
  it('handles leap years', () => {
    // 2028-02-01 is a Tuesday, 29 days: 2 + 29 + 4 = 35
    const cells = calendarCells(2028, 2)
    expect(cells).toHaveLength(35)
    expect(cells.filter((c) => c !== null)).toHaveLength(29)
  })
})

describe('calendarWeeks', () => {
  it('splits cells into rows of seven', () => {
    const weeks = calendarWeeks(2027, 5)
    expect(weeks).toHaveLength(6)
    for (const week of weeks) expect(week).toHaveLength(7)
    expect(weeks[0]).toEqual([null, null, null, null, null, null, 1])
    expect(weeks[2]).toEqual([9, 10, 11, 12, 13, 14, 15])
    expect(weeks[5]).toEqual([30, 31, null, null, null, null, null])
  })
})

describe('isWeddingCell', () => {
  it('marks only the wedding day once the date is confirmed', () => {
    expect(isWeddingCell(15, 15, false)).toBe(true)
    expect(isWeddingCell(14, 15, false)).toBe(false)
    expect(isWeddingCell(null, 15, false)).toBe(false)
  })
  it('marks no cell while the date is a placeholder', () => {
    const marked = calendarCells(2027, 5).filter((cell) => isWeddingCell(cell, 15, true))
    expect(marked).toEqual([])
  })
})
