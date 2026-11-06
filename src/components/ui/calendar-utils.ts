/**
 * Calendar constants and date helpers shared by <Calendar> and <DatePicker>.
 * Kept in a component-free module so the component file can Fast Refresh.
 */

export const DAY_NAMES_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const

export const MONTH_NAMES_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

export function todayIso(): string {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}

export function parseIso(iso: string): Date | null {
  if (!iso) return null
  const dt = new Date(`${iso}T00:00:00`)
  return isNaN(dt.getTime()) ? null : dt
}

export interface DayCell {
  year: number
  month: number // 0-indexed
  day: number
  outside: boolean
}

export function buildDayGrid(year: number, month: number): DayCell[] {
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()
  const cells: DayCell[] = []

  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({
      year: month === 0 ? year - 1 : year,
      month: month === 0 ? 11 : month - 1,
      day: daysInPrev - i,
      outside: true,
    })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ year, month, day: d, outside: false })
  }
  const trailing = 42 - cells.length
  for (let d = 1; d <= trailing; d++) {
    cells.push({
      year: month === 11 ? year + 1 : year,
      month: month === 11 ? 0 : month + 1,
      day: d,
      outside: true,
    })
  }
  return cells
}

export function cellToIso(c: DayCell): string {
  return `${c.year}-${String(c.month + 1).padStart(2, '0')}-${String(c.day).padStart(2, '0')}`
}
