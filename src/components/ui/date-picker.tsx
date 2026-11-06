/**
 * Masked text input + Calendar popup for picking a date.
 *
 * DISPLAY format : dd/mm/yyyy  (user-visible, auto-masked as you type)
 * VALUE  format  : YYYY-MM-DD  (ISO — TanStack Form / backend)
 *
 * The popup is portal-rendered (never clipped) and has a fixed 320 px width
 * so the calendar layout is always well-proportioned regardless of input width.
 */
import {
  Calendar as CalendarIcon,
  CircleAlert,
  CircleCheck,
  X,
} from 'lucide-react'
import type { ChangeEvent, CSSProperties, MouseEvent } from 'react'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { useMounted } from '~/hooks/use-mounted'
import { cx } from '~/lib/cx'

import { Calendar } from './calendar'
import { parseIso, todayIso } from './calendar-utils'
import styles from './date-picker.module.scss'
import { Label } from './label'

function isoToDisplay(iso: string): string {
  if (!iso || iso.length < 10) return ''
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return ''
  return `${d}/${m}/${y}`
}

function displayToIso(display: string): string {
  const parts = display.split('/')
  if (parts.length !== 3) return ''
  const [d, m, y] = parts
  if (d.length !== 2 || m.length !== 2 || y.length !== 4) return ''
  const iso = `${y}-${m}-${d}`
  const dt = new Date(`${iso}T00:00:00`)
  return isNaN(dt.getTime()) ? '' : iso
}

export interface DatePickerProps {
  /** Controlled value — ISO YYYY-MM-DD or '' */
  value?: string
  /** Called with ISO YYYY-MM-DD or '' */
  onChange?: (iso: string) => void
  label?: string
  hint?: string
  error?: string
  success?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  /** ISO YYYY-MM-DD — dates before this are disabled */
  min?: string
  /** ISO YYYY-MM-DD — dates after this are disabled */
  max?: string
  wrapClassName?: string
  id?: string
}

// Calendar popup is always 320 px wide — NOT tied to input width
const PANEL_W = 320

export function DatePicker({
  value,
  onChange,
  label,
  hint,
  error,
  success,
  required,
  placeholder,
  disabled,
  min,
  max,
  wrapClassName,
  id: idProp,
}: DatePickerProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const today = todayIso()

  const wrapRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const mounted = useMounted()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(() => ({
    value,
    text: isoToDisplay(value ?? ''),
  }))
  const [pos, setPos] = useState({ top: 0, bottom: 0, left: 0 })
  const [dropUp, setDropUp] = useState(false)

  // Derive the displayed text from the latest external value during render.
  const inputText = draft.value === value ? draft.text : isoToDisplay(value ?? '')
  const setInputText = (text: string) => setDraft({ value, text })

  function measure() {
    const r = wrapRef.current?.getBoundingClientRect()
    if (!r) return
    const spaceBelow = window.innerHeight - r.bottom
    const clampedLeft = Math.min(r.left, window.innerWidth - PANEL_W - 8)
    setDropUp(spaceBelow < 380)
    setPos({
      top: r.bottom + 6,
      bottom: window.innerHeight - r.top + 6,
      left: Math.max(8, clampedLeft),
    })
  }

  function openPicker() {
    if (disabled) return
    measure()
    setOpen(true)
  }

  function closePicker() {
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const handler = (event: globalThis.MouseEvent) => {
      const target = event.target as Node
      if (
        !wrapRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        closePicker()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        closePicker()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  function handleSelect(iso: string) {
    onChange?.(iso)
    setInputText(isoToDisplay(iso))
    closePicker()
  }

  function handleClear(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    onChange?.('')
    setInputText('')
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    const digits = event.currentTarget.value.replace(/\D/g, '').slice(0, 8)

    let formatted = digits
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`
    }

    setInputText(formatted)

    if (digits.length === 8) {
      const iso = displayToIso(formatted)
      if (iso) onChange?.(iso)
    } else if (digits.length === 0) {
      onChange?.('')
    }
  }

  const hasError = Boolean(error)
  const hasSuccess = Boolean(success) && !hasError
  const hasValue = Boolean(value)
  const describedBy =
    [
      hint ? `${id}-hint` : null,
      hasError ? `${id}-error` : null,
      hasSuccess ? `${id}-success` : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined

  const seedDate = parseIso(value ?? '') ?? parseIso(today)!

  const panelStyle: CSSProperties = {
    width: `${PANEL_W}px`,
    left: `${pos.left}px`,
    ...(dropUp ? { bottom: `${pos.bottom}px` } : { top: `${pos.top}px` }),
  }

  return (
    <div className={cx(styles.root, wrapClassName)} ref={wrapRef}>
      {label ? (
        <Label htmlFor={id} required={required} hint={hint} hintId={`${id}-hint`}>
          {label}
        </Label>
      ) : null}

      <div
        className={cx(
          styles.field,
          hasError ? styles.invalid : hasSuccess ? styles.valid : open ? styles.open : undefined,
          disabled && styles.disabled,
        )}
      >
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label="Open calendar"
          aria-expanded={open}
          onClick={openPicker}
          className={styles.iconButton}
        >
          <CalendarIcon size={16} aria-hidden />
        </button>

        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder={placeholder ?? 'dd/mm/yyyy'}
          disabled={disabled}
          value={inputText}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          onChange={handleInput}
          onFocus={() => {
            if (!open) openPicker()
          }}
          className={styles.input}
        />

        {hasValue && !disabled ? (
          <button
            type="button"
            aria-label="Clear date"
            onClick={handleClear}
            className={styles.clear}
          >
            <X size={14} aria-hidden />
          </button>
        ) : null}

        {hasError && !hasValue ? (
          <span className={cx(styles.status, styles.statusError)}>
            <CircleAlert size={16} aria-hidden />
          </span>
        ) : null}
        {hasSuccess ? (
          <span className={cx(styles.status, styles.statusSuccess)}>
            <CircleCheck size={16} aria-hidden />
          </span>
        ) : null}
      </div>

      {error ? (
        <p id={`${id}-error`} role="alert" className={cx(styles.message, styles.errorText)}>
          {error}
        </p>
      ) : null}
      {success && !hasError ? (
        <p id={`${id}-success`} className={cx(styles.message, styles.successText)}>
          {success}
        </p>
      ) : null}

      {open && mounted
        ? createPortal(
            <div
              ref={panelRef}
              style={panelStyle}
              role="dialog"
              aria-modal={false}
              aria-label="Choose a date"
              className={styles.panel}
            >
              <Calendar
                value={value}
                onSelect={handleSelect}
                min={min}
                max={max}
                showToday
                initialYear={seedDate.getFullYear()}
                initialMonth={seedDate.getMonth()}
              />
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
