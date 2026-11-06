import { ChevronDown, CircleAlert, CircleCheck } from 'lucide-react'
import * as React from 'react'
import { useId, useState } from 'react'

import { cx } from '~/lib/cx'

import styles from './floating-label-input.module.scss'

/**
 * Floating-label fields.
 *
 * The label starts as a placeholder inside the control and glides to the
 * top-left when the field is focused or filled. Float state is driven by CSS
 * (`:focus` + `:not(:placeholder-shown)`) so browser autofill and controlled
 * values both work without JS. `placeholder` is reserved for the CSS probe —
 * put format guidance in `hint` instead.
 */

export type FloatingVariant = 'filled' | 'outlined' | 'underline'
export type FloatingSize = 'sm' | 'md' | 'lg'

const FRAME_VARIANT: Record<FloatingVariant, string> = {
  filled: styles.filled,
  outlined: styles.outlined,
  underline: styles.underline,
}

const FRAME_SIZE: Record<FloatingSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
}

export interface FloatingFieldBaseProps {
  label: string
  /** Helper text under the field. Hidden while `error` or `success` shows. */
  hint?: string
  error?: string
  success?: string
  required?: boolean
  variant?: FloatingVariant
  size?: FloatingSize
  leading?: React.ReactNode
  trailing?: React.ReactNode
  /** Force the floated state (e.g. `type="date"` or a custom control). */
  filled?: boolean
  /**
   * Colour behind the outlined notch. Defaults to the page background.
   * Pass `hsl(var(--card))` when the field sits on a card.
   */
  notchBg?: string
  wrapClassName?: string
}

function FieldMessage({
  hint,
  error,
  success,
  hintId,
  errorId,
  successId,
}: {
  hint?: string
  error?: string
  success?: string
  hintId: string
  errorId: string
  successId: string
}) {
  if (error) {
    return (
      <p id={errorId} role="alert" className={cx(styles.message, styles.errorText)}>
        <CircleAlert className={styles.messageIcon} aria-hidden />
        <span>{error}</span>
      </p>
    )
  }
  if (success) {
    return (
      <p id={successId} className={cx(styles.message, styles.successText)}>
        <CircleCheck className={styles.messageIcon} aria-hidden />
        <span>{success}</span>
      </p>
    )
  }
  if (hint) {
    return (
      <p id={hintId} className={styles.hint}>
        {hint}
      </p>
    )
  }
  return null
}

function FieldShell({
  label,
  hint,
  error,
  success,
  required,
  variant = 'filled',
  size = 'md',
  leading,
  trailing,
  filled,
  notchBg,
  wrapClassName,
  id,
  children,
  multiline = false,
  chevron = false,
  disabled,
}: FloatingFieldBaseProps & {
  id: string
  children: React.ReactNode
  multiline?: boolean
  chevron?: boolean
  disabled?: boolean
}) {
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const successId = `${id}-success`
  const hasError = Boolean(error)
  const hasSuccess = Boolean(success) && !hasError
  const hasLeading = leading != null
  const hasTrailing = trailing != null || chevron

  return (
    <div className={cx(styles.root, wrapClassName)}>
      <div
        data-filled={filled ? 'true' : undefined}
        data-invalid={hasError ? 'true' : undefined}
        style={
          notchBg
            ? ({ '--vz-float-notch': notchBg } as React.CSSProperties)
            : undefined
        }
        className={cx(
          styles.frame,
          FRAME_VARIANT[variant],
          FRAME_SIZE[size],
          hasError && styles.invalid,
          hasSuccess && styles.valid,
          disabled && styles.disabled,
        )}
      >
        {hasLeading ? (
          <span className={styles.leading} aria-hidden>
            {leading}
          </span>
        ) : null}

        <div className={styles.controlWrap}>
          {children}
          <label
            htmlFor={id}
            className={cx(
              styles.label,
              hasLeading && styles.labelLeading,
              multiline && styles.labelMultiline,
            )}
          >
            {label}
            {required ? (
              <>
                <span className={styles.required} aria-hidden>
                  *
                </span>
                <span className={styles.srOnly}> (required)</span>
              </>
            ) : null}
          </label>
        </div>

        {hasTrailing ? (
          <span className={styles.trailing}>
            {trailing ?? <ChevronDown className={styles.chevronIcon} aria-hidden />}
          </span>
        ) : null}
      </div>

      <FieldMessage
        hint={hint}
        error={error}
        success={success}
        hintId={hintId}
        errorId={errorId}
        successId={successId}
      />
    </div>
  )
}

export interface FloatingLabelInputProps
  extends FloatingFieldBaseProps,
    Omit<React.ComponentPropsWithoutRef<'input'>, 'placeholder' | 'size'> {}

export const FloatingLabelInput = React.forwardRef<
  HTMLInputElement,
  FloatingLabelInputProps
>(function FloatingLabelInput(
  {
    label,
    hint,
    error,
    success,
    required,
    variant = 'filled',
    size = 'md',
    leading,
    trailing,
    filled,
    notchBg,
    wrapClassName,
    className,
    id: idProp,
    disabled,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const hasError = Boolean(error)

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      success={success}
      required={required}
      variant={variant}
      size={size}
      leading={leading}
      trailing={trailing}
      filled={filled}
      notchBg={notchBg}
      wrapClassName={wrapClassName}
      id={id}
      disabled={disabled}
    >
      <input
        ref={ref}
        id={id}
        placeholder=" "
        required={required}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        aria-describedby={
          error
            ? `${id}-error`
            : success
              ? `${id}-success`
              : hint
                ? `${id}-hint`
                : undefined
        }
        className={cx(
          styles.control,
          styles.input,
          leading && styles.withLeading,
          trailing && styles.withTrailing,
          className,
        )}
        {...props}
      />
    </FieldShell>
  )
})

export interface FloatingLabelTextareaProps
  extends FloatingFieldBaseProps,
    Omit<React.ComponentPropsWithoutRef<'textarea'>, 'placeholder'> {}

export const FloatingLabelTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FloatingLabelTextareaProps
>(function FloatingLabelTextarea(
  {
    label,
    hint,
    error,
    success,
    required,
    variant = 'filled',
    size = 'md',
    leading,
    trailing,
    filled,
    notchBg,
    wrapClassName,
    className,
    id: idProp,
    disabled,
    rows = 4,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const hasError = Boolean(error)

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      success={success}
      required={required}
      variant={variant}
      size={size}
      leading={leading}
      trailing={trailing}
      filled={filled}
      notchBg={notchBg}
      wrapClassName={wrapClassName}
      id={id}
      multiline
      disabled={disabled}
    >
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        placeholder=" "
        required={required}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        aria-describedby={
          error
            ? `${id}-error`
            : success
              ? `${id}-success`
              : hint
                ? `${id}-hint`
                : undefined
        }
        className={cx(
          styles.control,
          styles.textarea,
          leading && styles.withLeading,
          trailing && styles.withTrailing,
          className,
        )}
        {...props}
      />
    </FieldShell>
  )
})

export interface FloatingLabelSelectProps
  extends FloatingFieldBaseProps,
    Omit<React.ComponentPropsWithoutRef<'select'>, 'size' | 'placeholder'> {}

export const FloatingLabelSelect = React.forwardRef<
  HTMLSelectElement,
  FloatingLabelSelectProps
>(function FloatingLabelSelect(
  {
    label,
    hint,
    error,
    success,
    required,
    variant = 'filled',
    size = 'md',
    leading,
    trailing,
    filled,
    notchBg,
    wrapClassName,
    className,
    id: idProp,
    disabled,
    value,
    defaultValue,
    onChange,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const hasError = Boolean(error)
  const [internal, setInternal] = useState(() =>
    defaultValue == null ? '' : String(defaultValue),
  )
  const current = value == null ? internal : String(value)
  const isFilled = Boolean(filled) || current.length > 0

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      success={success}
      required={required}
      variant={variant}
      size={size}
      leading={leading}
      trailing={trailing}
      filled={isFilled}
      notchBg={notchBg}
      wrapClassName={wrapClassName}
      id={id}
      chevron={trailing == null}
      disabled={disabled}
    >
      <select
        ref={ref}
        id={id}
        {...(value === undefined ? { defaultValue } : { value })}
        required={required}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        aria-describedby={
          error
            ? `${id}-error`
            : success
              ? `${id}-success`
              : hint
                ? `${id}-hint`
                : undefined
        }
        onChange={(event) => {
          setInternal(event.target.value)
          onChange?.(event)
        }}
        className={cx(
          styles.control,
          styles.select,
          leading && styles.withLeading,
          className,
        )}
        {...props}
      />
    </FieldShell>
  )
})
