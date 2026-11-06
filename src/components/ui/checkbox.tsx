import { Check, Minus } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

import { cx } from '~/lib/cx'
import styles from './checkbox.module.scss'

export interface CheckboxProps {
  checked?: boolean
  defaultChecked?: boolean
  indeterminate?: boolean
  onChange?: (checked: boolean) => void
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  label?: ReactNode
  hint?: string
  error?: string
  required?: boolean
  id?: string
  name?: string
  /** Applied to the outer wrapper. */
  className?: string
  /** Applied to the native input (e.g. table cells). */
  inputClassName?: string
  'aria-label'?: string
}

/**
 * Accessible checkbox — GuardCore API (`onChange`, `indeterminate`, `label`)
 * plus shadcn-style `onCheckedChange`.
 */
export function Checkbox({
  checked: checkedProp,
  defaultChecked = false,
  indeterminate = false,
  onChange,
  onCheckedChange,
  disabled,
  label,
  hint,
  error,
  required,
  id: idProp,
  name,
  className,
  inputClassName,
  'aria-label': ariaLabel,
}: CheckboxProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const inputRef = useRef<HTMLInputElement>(null)
  const [uncontrolled, setUncontrolled] = useState(defaultChecked)
  const checked = checkedProp ?? uncontrolled

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  const notify = (next: boolean) => {
    if (checkedProp === undefined) setUncontrolled(next)
    onChange?.(next)
    onCheckedChange?.(next)
  }

  return (
    <div className={cx(styles.field, className)}>
      <label
        className={cx(styles.row, disabled && styles.rowDisabled)}
        data-disabled={disabled ? 'true' : undefined}
      >
        <span className={styles.controlWrap}>
          <input
            ref={inputRef}
            type="checkbox"
            id={id}
            name={name}
            checked={checked}
            disabled={disabled}
            required={required}
            aria-label={ariaLabel}
            aria-checked={indeterminate ? 'mixed' : checked}
            aria-invalid={error ? true : undefined}
            aria-describedby={
              error ? `${id}-error` : hint ? `${id}-hint` : undefined
            }
            onChange={(event) => notify(event.currentTarget.checked)}
            className={cx(styles.control, inputClassName)}
          />
          <span className={styles.box} aria-hidden>
            <Check className={styles.check} />
            <Minus className={styles.dash} />
          </span>
        </span>

        {label ? (
          <span className={styles.label}>
            {label}
            {required ? (
              <span className={styles.required} aria-hidden>
                *
              </span>
            ) : null}
          </span>
        ) : null}
      </label>

      {hint && !error ? (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={`${id}-error`} role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
