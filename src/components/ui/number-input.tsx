import { Minus, Plus } from 'lucide-react'
import * as React from 'react'

import { useControllableState } from '~/hooks/use-controllable-state'
import { cx } from '~/lib/cx'
import styles from './number-input.module.scss'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function round(value: number, precision: number) {
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

export interface NumberInputProps {
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  precision?: number
  disabled?: boolean
  label?: string
  suffix?: string
  className?: string
  id?: string
}

export function NumberInput({
  value,
  defaultValue = 0,
  onChange,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
  step = 1,
  precision = 0,
  disabled = false,
  label,
  suffix,
  className,
  id,
}: NumberInputProps) {
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue,
    onChange,
  })
  const [draft, setDraft] = React.useState<string | null>(null)
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const display = draft ?? String(current)

  const commit = (next: number) => {
    const bounded = clamp(round(next, precision), min, max)
    setCurrent(bounded)
    setDraft(null)
  }

  const nudge = (direction: 1 | -1) => {
    if (disabled) return
    commit(current + step * direction)
  }

  return (
    <div className={cx(styles.root, className)}>
      {label ? (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      ) : null}

      <div className={cx(styles.shell, disabled && styles.disabled)}>
        <button
          type="button"
          onClick={() => nudge(-1)}
          disabled={disabled || current <= min}
          aria-label="Decrease"
          className={cx(styles.step, styles.decrement)}
        >
          <Minus aria-hidden />
        </button>

        <div className={styles.field}>
          <input
            id={inputId}
            value={display}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => {
              const parsed = Number.parseFloat(display)
              commit(Number.isFinite(parsed) ? parsed : current)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.currentTarget.blur()
              } else if (event.key === 'ArrowUp') {
                event.preventDefault()
                nudge(1)
              } else if (event.key === 'ArrowDown') {
                event.preventDefault()
                nudge(-1)
              }
            }}
            disabled={disabled}
            inputMode="decimal"
            aria-label={label ? undefined : 'Number value'}
            className={styles.control}
          />
          {suffix ? (
            <span className={styles.suffix} aria-hidden>
              {suffix}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => nudge(1)}
          disabled={disabled || current >= max}
          aria-label="Increase"
          className={cx(styles.step, styles.increment)}
        >
          <Plus aria-hidden />
        </button>
      </div>
    </div>
  )
}
