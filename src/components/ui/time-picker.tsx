import { Clock } from 'lucide-react'
import * as React from 'react'

import { Input } from './input'

export interface TimePickerProps {
  label?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  hint?: string
  min?: string
  max?: string
  step?: number
  disabled?: boolean
  required?: boolean
  className?: string
  id?: string
}

/** Native time field with a clock adornment and ISO 24-hour value. */
export function TimePicker({
  label,
  value,
  defaultValue,
  onChange,
  hint,
  min,
  max,
  step = 900,
  disabled,
  required,
  className,
  id,
}: TimePickerProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.currentTarget.value)
  }

  return (
    <Input
      id={id}
      type="time"
      label={label}
      hint={hint}
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      required={required}
      className={className}
      leading={<Clock aria-hidden />}
      onChange={handleChange}
    />
  )
}
