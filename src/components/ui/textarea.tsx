import { CircleAlert, CircleCheck } from 'lucide-react'
import * as React from 'react'
import { useId } from 'react'

import { cx } from '~/lib/cx'
import { Label } from './label'
import styles from './textarea.module.scss'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
  success?: string
  /** Show a live character count. Needs `maxLength` to be meaningful. */
  showCount?: boolean
  wrapClassName?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      hint,
      error,
      success,
      showCount = false,
      wrapClassName,
      id: idProp,
      className,
      required,
      disabled,
      rows = 4,
      maxLength,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref,
  ) {
    const generatedId = useId()
    const id = idProp ?? generatedId

    const [count, setCount] = React.useState(
      () => String(value ?? defaultValue ?? '').length,
    )

    // Keep the counter in sync when the field is controlled.
    React.useEffect(() => {
      if (value !== undefined) setCount(String(value).length)
    }, [value])

    const hasError = Boolean(error)
    const hasSuccess = Boolean(success) && !hasError
    const describedBy =
      [
        hint ? `${id}-hint` : null,
        hasError ? `${id}-error` : null,
        hasSuccess ? `${id}-success` : null,
      ]
        .filter(Boolean)
        .join(' ') || undefined

    const atLimit = maxLength !== undefined && count >= maxLength

    return (
      <div className={cx(styles.field, wrapClassName)}>
        {label ? (
          <Label
            htmlFor={id}
            required={required}
            hint={hint}
            hintId={`${id}-hint`}
          >
            {label}
          </Label>
        ) : null}

        <div
          className={cx(
            styles.shell,
            hasError ? styles.invalid : hasSuccess ? styles.valid : undefined,
            disabled && styles.disabled,
          )}
        >
          <textarea
            {...props}
            ref={ref}
            id={id}
            rows={rows}
            required={required}
            disabled={disabled}
            maxLength={maxLength}
            value={value}
            defaultValue={defaultValue}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            className={cx(styles.control, className)}
            onChange={(event) => {
              setCount(event.currentTarget.value.length)
              onChange?.(event)
            }}
          />

          {hasError ? (
            <span className={cx(styles.status, styles.statusError)}>
              <CircleAlert aria-hidden />
            </span>
          ) : hasSuccess ? (
            <span className={cx(styles.status, styles.statusSuccess)}>
              <CircleCheck aria-hidden />
            </span>
          ) : null}
        </div>

        {hasError || hasSuccess || (showCount && maxLength !== undefined) ? (
          <div className={styles.message}>
            {hasError ? (
              <p id={`${id}-error`} role="alert" className={styles.errorText}>
                {error}
              </p>
            ) : hasSuccess ? (
              <p id={`${id}-success`} className={styles.successText}>
                {success}
              </p>
            ) : null}

            {showCount && maxLength !== undefined ? (
              <p className={cx(styles.counter, atLimit && styles.counterAtLimit)}>
                {count} / {maxLength}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    )
  },
)
