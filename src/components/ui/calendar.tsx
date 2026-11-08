/**
 * Standalone Calendar UI — no portal, no input, just the panel.
 * Used by <DatePicker> (inside a portal popup) and dashboard widgets.
 *
 * Three views: day → month → year (drill-down via the header).
 */
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'

import { useMounted } from '~/hooks/use-mounted'
import { cx } from '~/lib/cx'

import styles from './calendar.module.scss'
import {
  buildDayGrid,
  cellToIso,
  DAY_NAMES_SHORT,
  MONTH_NAMES_FULL,
  MONTH_NAMES_SHORT,
  parseIso,
  todayIso,
} from './calendar-utils'

export interface CalendarProps {
  /** Selected ISO date YYYY-MM-DD (or '') */
  value?: string
  /** Called when user clicks a day */
  onSelect?: (iso: string) => void
  /** Disable dates before this ISO */
  min?: string
  /** Disable dates after this ISO */
  max?: string
  /** Show "Today" shortcut in the footer */
  showToday?: boolean
  /** Extra class on the root div */
  className?: string
  /**
   * If provided, the calendar starts at this year/month instead of the
   * selected value (or today). Useful for controlled external state.
   */
  initialYear?: number
  initialMonth?: number
  /**
   * ISO date used to mark "today" (YYYY-MM-DD). Pass a server-computed value
   * to keep server and client output identical.
   */
  today?: string
}

function seedDate(
  value: string | undefined,
  initialYear: number | undefined,
  initialMonth: number | undefined,
  todayDt: Date,
): Date {
  const sel = parseIso(value ?? '')
  if (sel) return sel
  if (initialYear !== undefined && initialMonth !== undefined) {
    return new Date(initialYear, initialMonth, 1)
  }
  return todayDt
}

export function Calendar({
  value,
  onSelect,
  min,
  max,
  showToday = true,
  className,
  initialYear,
  initialMonth,
  today: todayProp,
}: CalendarProps) {
  const mounted = useMounted()
  const providedToday = parseIso(todayProp ?? '') ? todayProp! : ''
  const today = providedToday || todayIso()
  const todayDt = parseIso(today)!

  const seeded = seedDate(value, initialYear, initialMonth, todayDt)
  const [cursorYear, setCursorYear] = useState(() => seeded.getFullYear())
  const [cursorMonth, setCursorMonth] = useState(() => seeded.getMonth())
  const [view, setView] = useState<'day' | 'month' | 'year'>('day')

  const selectedIso = value ?? ''
  // Hide "today" markers until hydration so a server in another timezone
  // cannot render a different day than the client. An explicit `today` prop
  // is deterministic and is kept for both renders.
  const displayToday = mounted ? today : providedToday
  const displayTodayDt = parseIso(displayToday)
  const hasExplicitSeed =
    Boolean(value) ||
    (initialYear !== undefined && initialMonth !== undefined) ||
    Boolean(providedToday)

  const prevMonth = () => {
    if (cursorMonth === 0) {
      setCursorYear((y) => y - 1)
      setCursorMonth(11)
    } else {
      setCursorMonth((m) => m - 1)
    }
  }
  const nextMonth = () => {
    if (cursorMonth === 11) {
      setCursorYear((y) => y + 1)
      setCursorMonth(0)
    } else {
      setCursorMonth((m) => m + 1)
    }
  }
  const prevYear = () => setCursorYear((y) => y - 1)
  const nextYear = () => setCursorYear((y) => y + 1)

  const decadeStart = (y: number) => Math.floor(y / 12) * 12
  const prevDecade = () => setCursorYear((y) => y - 12)
  const nextDecade = () => setCursorYear((y) => y + 12)

  const dayGrid = useMemo(
    () => buildDayGrid(cursorYear, cursorMonth),
    [cursorYear, cursorMonth],
  )
  const yearGrid = useMemo(() => {
    const s = decadeStart(cursorYear)
    return Array.from({ length: 12 }, (_, i) => s + i)
  }, [cursorYear])

  // Without a value, initial month or explicit `today`, the starting month is
  // only knowable on the client — render nothing on the server so the markup
  // cannot disagree with the hydrated output.
  if (!mounted && !hasExplicitSeed) return null

  function isDisabled(iso: string) {
    if (min && iso < min) return true
    if (max && iso > max) return true
    return false
  }

  function handleDayClick(iso: string) {
    if (isDisabled(iso)) return
    onSelect?.(iso)
  }

  return (
    <div className={cx(styles.root, className)}>
      {view === 'day' ? (
        <>
          <div className={styles.header}>
            <button
              type="button"
              onClick={prevMonth}
              className={styles.navButton}
              aria-label="Previous month"
            >
              <ChevronLeft aria-hidden size={15} />
            </button>
            <button
              type="button"
              onClick={() => setView('month')}
              className={styles.headerButton}
            >
              {MONTH_NAMES_FULL[cursorMonth]} {cursorYear}
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className={styles.navButton}
              aria-label="Next month"
            >
              <ChevronRight aria-hidden size={15} />
            </button>
          </div>

          <div className={styles.weekdays}>
            {DAY_NAMES_SHORT.map((name) => (
              <div key={name} className={styles.weekday}>
                <span className={styles.weekdayLabel}>{name}</span>
              </div>
            ))}
          </div>

          <div className={styles.grid}>
            {dayGrid.map((cell) => {
              const iso = cellToIso(cell)
              const isSel = iso === selectedIso
              const isToday = iso === displayToday
              const isDis = isDisabled(iso)

              return (
                <div key={iso} className={styles.dayCell}>
                  <button
                    type="button"
                    disabled={isDis}
                    onClick={() => handleDayClick(iso)}
                    aria-label={iso}
                    aria-pressed={isSel}
                    className={cx(
                      styles.day,
                      isDis && styles.dayDisabled,
                      !isDis && isSel && styles.daySelected,
                      !isDis && !isSel && isToday && styles.dayToday,
                      !isDis && !isSel && !isToday && cell.outside && styles.dayOutside,
                    )}
                  >
                    {cell.day}
                  </button>
                </div>
              )
            })}
          </div>

          {showToday ? (
            <div className={styles.footer}>
              <button
                type="button"
                disabled={isDisabled(displayToday)}
                onClick={() => {
                  setCursorYear(todayDt.getFullYear())
                  setCursorMonth(todayDt.getMonth())
                  handleDayClick(today)
                }}
                className={styles.todayButton}
              >
                Today
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {view === 'month' ? (
        <>
          <div className={styles.header}>
            <button
              type="button"
              onClick={prevYear}
              className={styles.navButton}
              aria-label="Previous year"
            >
              <ChevronLeft aria-hidden size={15} />
            </button>
            <button
              type="button"
              onClick={() => setView('year')}
              className={styles.headerButton}
            >
              {cursorYear}
            </button>
            <button
              type="button"
              onClick={nextYear}
              className={styles.navButton}
              aria-label="Next year"
            >
              <ChevronRight aria-hidden size={15} />
            </button>
          </div>

          <div className={styles.choiceGrid}>
            {MONTH_NAMES_SHORT.map((name, i) => {
              const d = parseIso(selectedIso)
              const isSel = d?.getFullYear() === cursorYear && d?.getMonth() === i
              const isNow =
                displayTodayDt?.getFullYear() === cursorYear &&
                displayTodayDt?.getMonth() === i

              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setCursorMonth(i)
                    setView('day')
                  }}
                  aria-pressed={isSel}
                  className={cx(
                    styles.choice,
                    isSel && styles.choiceSelected,
                    !isSel && isNow && styles.choiceToday,
                  )}
                >
                  {name}
                </button>
              )
            })}
          </div>
        </>
      ) : null}

      {view === 'year' ? (
        <>
          <div className={styles.header}>
            <button
              type="button"
              onClick={prevDecade}
              className={styles.navButton}
              aria-label="Previous decade"
            >
              <ChevronLeft aria-hidden size={15} />
            </button>
            <div className={cx(styles.headerButton, styles.headerStatic)}>
              {yearGrid[0]} – {yearGrid[11]}
            </div>
            <button
              type="button"
              onClick={nextDecade}
              className={styles.navButton}
              aria-label="Next decade"
            >
              <ChevronRight aria-hidden size={15} />
            </button>
          </div>

          <div className={styles.choiceGrid}>
            {yearGrid.map((yr) => {
              const isSel = parseIso(selectedIso)?.getFullYear() === yr
              const isNow = displayTodayDt?.getFullYear() === yr

              return (
                <button
                  key={yr}
                  type="button"
                  onClick={() => {
                    setCursorYear(yr)
                    setView('month')
                  }}
                  aria-pressed={isSel}
                  className={cx(
                    styles.choice,
                    isSel && styles.choiceSelected,
                    !isSel && isNow && styles.choiceToday,
                  )}
                >
                  {yr}
                </button>
              )
            })}
          </div>
        </>
      ) : null}
    </div>
  )
}
