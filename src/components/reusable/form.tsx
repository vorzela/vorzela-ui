/**
 * TanStack Form wrappers. Requires `@tanstack/react-form`.
 *
 * Form, FormInput, FormPassword, FormTextarea, FormSelect, FormCheckbox.
 */
import type React from 'react'

import { Checkbox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import { PasswordStrengthInput } from '~/components/ui/password-input'
import { Select, type SelectOption } from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'

// The form instance is generic over shape; callers own the concrete type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyForm = any

function fieldError(field: AnyForm, form: AnyForm): string | undefined {
  const raw = field.state.meta.errors?.[0]
  if (raw == null || raw === '') return undefined
  const attempted = (form?.state?.submissionAttempts ?? 0) > 0
  if (!field.state.meta.isTouched && !attempted) return undefined
  return typeof raw === 'string' ? raw : String(raw)
}

export interface FormProps
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  form?: AnyForm
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  children: React.ReactNode
}

/** `<form>` that calls `form.handleSubmit()` and prevents native navigation. */
export function Form({ form, onSubmit, children, ...rest }: FormProps) {
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form?.handleSubmit()
        onSubmit?.(event)
      }}
      {...rest}
    >
      {children}
    </form>
  )
}

export interface FormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  form: AnyForm
  name: string
  label?: string
  hint?: string
  required?: boolean
  validators?: AnyForm
  leadingNode?: React.ReactNode
  trailingNode?: React.ReactNode
  wrapClassName?: string
}

export function FormInput({
  form,
  name,
  label,
  hint,
  required,
  validators,
  leadingNode,
  trailingNode,
  wrapClassName,
  size: _size,
  onBlur,
  onChange,
  ...rest
}: FormInputProps) {
  return (
    <form.Field name={name} validators={validators}>
      {(field: AnyForm) => (
        <Input
          label={label}
          hint={hint}
          required={required}
          leading={leadingNode}
          trailing={trailingNode}
          wrapClassName={wrapClassName}
          value={field.state.value ?? ''}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            field.handleChange(event.target.value)
            onChange?.(event)
          }}
          onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
            field.handleBlur()
            onBlur?.(event)
          }}
          error={fieldError(field, form)}
          {...rest}
        />
      )}
    </form.Field>
  )
}

export interface FormPasswordProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'type' | 'onChange'> {
  form: AnyForm
  name: string
  label?: string
  hint?: string
  required?: boolean
  validators?: AnyForm
  wrapClassName?: string
}

export function FormPassword({
  form,
  name,
  label,
  hint,
  required: _required,
  validators,
  wrapClassName,
  ...rest
}: FormPasswordProps) {
  return (
    <form.Field name={name} validators={validators}>
      {(field: AnyForm) => (
        <div className={wrapClassName}>
          <PasswordStrengthInput
            label={label}
            hint={hint}
            value={field.state.value ?? ''}
            onChange={(value: string) => field.handleChange(value)}
            error={fieldError(field, form)}
            {...rest}
          />
        </div>
      )}
    </form.Field>
  )
}

export interface FormTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {
  form: AnyForm
  name: string
  label?: string
  hint?: string
  required?: boolean
  rows?: number
  validators?: AnyForm
  wrapClassName?: string
}

export function FormTextarea({
  form,
  name,
  label,
  hint,
  required,
  rows,
  validators,
  wrapClassName,
  ...rest
}: FormTextareaProps) {
  return (
    <form.Field name={name} validators={validators}>
      {(field: AnyForm) => (
        <Textarea
          label={label}
          hint={hint}
          required={required}
          rows={rows}
          wrapClassName={wrapClassName}
          value={field.state.value ?? ''}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
            field.handleChange(event.target.value)
          }
          onBlur={() => field.handleBlur()}
          error={fieldError(field, form)}
          {...rest}
        />
      )}
    </form.Field>
  )
}

export interface FormCheckboxProps {
  form: AnyForm
  name: string
  label?: React.ReactNode
  hint?: string
  required?: boolean
  disabled?: boolean
  validators?: AnyForm
  className?: string
}

export function FormCheckbox({
  form,
  name,
  label,
  hint,
  required,
  disabled,
  validators,
  className,
}: FormCheckboxProps) {
  return (
    <form.Field name={name} validators={validators}>
      {(field: AnyForm) => (
        <Checkbox
          checked={Boolean(field.state.value)}
          onChange={(checked: boolean) => field.handleChange(checked)}
          label={label}
          hint={hint}
          required={required}
          disabled={disabled}
          error={fieldError(field, form)}
          className={className}
        />
      )}
    </form.Field>
  )
}

export interface FormSelectProps {
  form: AnyForm
  name: string
  options: SelectOption[]
  label?: string
  hint?: string
  required?: boolean
  placeholder?: string
  searchable?: boolean
  disabled?: boolean
  validators?: AnyForm
  wrapClass?: string
  onChange?: (value: string) => void
}

export function FormSelect({
  form,
  name,
  validators,
  onChange,
  wrapClass,
  ...rest
}: FormSelectProps) {
  return (
    <form.Field name={name} validators={validators}>
      {(field: AnyForm) => (
        <Select
          value={field.state.value ?? ''}
          onChange={(value: string) => {
            field.handleChange(value)
            onChange?.(value)
          }}
          onBlur={() => field.handleBlur()}
          error={fieldError(field, form)}
          wrapClassName={wrapClass}
          {...rest}
        />
      )}
    </form.Field>
  )
}
