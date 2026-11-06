/**
 * TanStack Form wrapper around DatePicker. Values are ISO `YYYY-MM-DD` strings.
 */
import { DatePicker } from '~/components/ui/date-picker'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyForm = any

export interface FormDatePickerProps {
  form: AnyForm
  name: string
  label?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  min?: string
  max?: string
  validators?: AnyForm
  wrapClassName?: string
}

export function FormDatePicker({
  form,
  name,
  label,
  hint,
  required,
  disabled,
  min,
  max,
  validators,
  wrapClassName,
}: FormDatePickerProps) {
  return (
    <form.Field name={name} validators={validators}>
      {(field: AnyForm) => {
        const raw = field.state.meta.errors?.[0]
        const attempted = (form?.state?.submissionAttempts ?? 0) > 0
        const show = field.state.meta.isTouched || attempted
        const error =
          raw != null && raw !== '' && show
            ? typeof raw === 'string'
              ? raw
              : String(raw)
            : undefined

        return (
          <DatePicker
            label={label}
            hint={hint}
            required={required}
            disabled={disabled}
            min={min}
            max={max}
            wrapClassName={wrapClassName}
            value={field.state.value ?? ''}
            onChange={(iso: string) => field.handleChange(iso)}
            error={error}
          />
        )
      }}
    </form.Field>
  )
}
