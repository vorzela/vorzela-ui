import * as React from 'react'

import { Input } from './input'
import styles from './currency-input.module.scss'

export interface CurrencyInputProps {
  label?: string
  hint?: string
  error?: string
  success?: string
  required?: boolean
  disabled?: boolean
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  currency?: string
  locale?: string
  min?: number
  max?: number
  className?: string
  id?: string
}

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^\d.-]/g, '')
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : 0
}

/**
 * Currency field with locale-aware formatting on blur and a plain decimal
 * editor while focused. The symbol is an input adornment, not part of the value.
 */
export function CurrencyInput({
  label,
  hint,
  error,
  success,
  required,
  disabled,
  value: valueProp,
  defaultValue = 0,
  onChange,
  currency = 'USD',
  locale,
  min,
  max,
  className,
  id,
}: CurrencyInputProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const numeric = valueProp ?? uncontrolled
  const [draft, setDraft] = React.useState(String(numeric))
  const [focused, setFocused] = React.useState(false)

  const formatter = React.useMemo(() => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
      })
    } catch {
      return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' })
    }
  }, [currency, locale])

  const symbol = React.useMemo(() => {
    const part = formatter.formatToParts(0).find((item) => item.type === 'currency')
    return part?.value ?? currency
  }, [formatter, currency])

  React.useEffect(() => {
    if (!focused) setDraft(String(numeric))
  }, [focused, numeric])

  const commit = (next: number) => {
    const clamped = Math.min(
      max ?? Number.POSITIVE_INFINITY,
      Math.max(min ?? Number.NEGATIVE_INFINITY, next),
    )
    if (valueProp === undefined) setUncontrolled(clamped)
    onChange?.(clamped)
    return clamped
  }

  return (
    <Input
      id={id}
      label={label}
      hint={hint}
      error={error}
      success={success}
      required={required}
      disabled={disabled}
      className={className}
      leading={<span className={styles.symbol}>{symbol}</span>}
      inputMode="decimal"
      autoComplete="off"
      value={focused ? draft : formatter.format(numeric)}
      onFocus={(event) => {
        setFocused(true)
        setDraft(String(numeric))
        event.currentTarget.select()
      }}
      onBlur={() => {
        setFocused(false)
        const next = commit(parseAmount(draft))
        setDraft(String(next))
      }}
      onChange={(event) => {
        const raw = event.currentTarget.value
        setDraft(raw)
        commit(parseAmount(raw))
      }}
    />
  )
}
