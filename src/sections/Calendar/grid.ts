import { monthGrid } from '@/lib/date'

/** A day number, or null for a blank cell that pads the first and last week. */
export type CalendarCell = number | null

const DAYS_PER_WEEK = 7

/**
 * Cells of a month laid out on a Sunday-first week:
 * `firstWeekday` leading blanks, then 1..daysInMonth, then blanks up to a multiple of 7.
 */
export function calendarCells(year: number, month: number): CalendarCell[] {
  const { daysInMonth, firstWeekday } = monthGrid(year, month)
  const cells: CalendarCell[] = Array.from({ length: firstWeekday }, () => null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(day)
  const trailing = (DAYS_PER_WEEK - (cells.length % DAYS_PER_WEEK)) % DAYS_PER_WEEK
  for (let i = 0; i < trailing; i++) cells.push(null)
  return cells
}

/** The same cells split into rows of 7, one per table row. */
export function calendarWeeks(year: number, month: number): CalendarCell[][] {
  const cells = calendarCells(year, month)
  const weeks: CalendarCell[][] = []
  for (let i = 0; i < cells.length; i += DAYS_PER_WEEK) weeks.push(cells.slice(i, i + DAYS_PER_WEEK))
  return weeks
}
