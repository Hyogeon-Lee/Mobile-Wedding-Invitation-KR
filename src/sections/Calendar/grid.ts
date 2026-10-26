import { monthGrid } from '@/lib/date'

/** A day number, or null for a blank cell that pads the first and last week. */
type CalendarCell = number | null

const DAYS_PER_WEEK = 7

export function calendarCells(year: number, month: number): CalendarCell[] {
  const { daysInMonth, firstWeekday } = monthGrid(year, month)
  const cells: CalendarCell[] = Array.from({ length: firstWeekday }, () => null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(day)
  const trailing = (DAYS_PER_WEEK - (cells.length % DAYS_PER_WEEK)) % DAYS_PER_WEEK
  for (let i = 0; i < trailing; i++) cells.push(null)
  return cells
}

export function calendarWeeks(year: number, month: number): CalendarCell[][] {
  const cells = calendarCells(year, month)
  const weeks: CalendarCell[][] = []
  for (let i = 0; i < cells.length; i += DAYS_PER_WEEK) weeks.push(cells.slice(i, i + DAYS_PER_WEEK))
  return weeks
}

/** Whether a cell is the wedding day. Never true while the date is a placeholder, so no day is singled out. */
export function isWeddingCell(cell: CalendarCell, weddingDay: number, placeholder: boolean): boolean {
  return !placeholder && cell === weddingDay
}
