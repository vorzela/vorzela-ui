import { ChevronDown } from 'lucide-react'
import type { SelectHTMLAttributes } from 'react'
import { useId } from 'react'

import { cx } from '~/lib/cx'

import { Label } from './label'
import styles from './native-select.module.scss'

export type NativeSelectSize = 'sm' | 'md' | 'lg'

export type NativeSelectOption = {
  value: string
  label: string
  disabled?: boolean
}

export interface NativeSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  size?: NativeSelectSize
  options?: NativeSelectOption[]
  placeholder?: string
  wrapClassName?: string
}

/**
 * Native `<select>` with the kit field chrome. Prefer this for short, static
 * option lists — it keeps the platform picker, keyboard and mobile behaviour.
 */
export function NativeSelect({
  label,
  hint,
  error,
  required,
  size = 'md',
  options,
  placeholder,
  wrapClassName,
  className,
  id,
  children,
  ...props
}: NativeSelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const hintId = hint ? `${selectId}-hint` : undefined
  const errorId = error ? `${selectId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div
      className={cx(
        styles.root,
        size === 'sm' && styles.sm,
        size === 'lg' && styles.lg,
        wrapClassName,
      )}
    >
      {label ? (
        <Label htmlFor={selectId} required={required} hint={undefined}>
          {label}
        </Label>
      ) : null}
      <div className={styles.field}>
        <select
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cx(styles.select, error && styles.error, className)}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled={required}>
              {placeholder}
            </option>
          ) : null}
          {options?.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
          {children}
        </select>
        <ChevronDown className={styles.chevron} aria-hidden />
      </div>
      {error ? (
        <p id={errorId} className={cx(styles.message, styles.messageError)}>
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className={styles.message}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
