import * as React from 'react'

import { cx } from '~/lib/cx'
import styles from './color-picker.module.scss'

const DEFAULT_PRESETS = [
  '#0a84ff',
  '#30d158',
  '#ff9f0a',
  '#ff453a',
  '#bf5af2',
  '#64d2ff',
]

export interface ColorPickerProps {
  label?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  presets?: string[]
  disabled?: boolean
  className?: string
  id?: string
}

/** Colour swatch plus editable hex value and optional presets. */
export function ColorPicker({
  label = 'Colour',
  value: valueProp,
  defaultValue = '#0a84ff',
  onChange,
  presets = DEFAULT_PRESETS,
  disabled = false,
  className,
  id,
}: ColorPickerProps) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const value = valueProp ?? uncontrolled

  const setValue = (next: string) => {
    if (valueProp === undefined) setUncontrolled(next)
    onChange?.(next)
  }

  return (
    <div className={cx(styles.root, className)}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <div className={styles.row}>
        <input
          id={inputId}
          type="color"
          value={value}
          disabled={disabled}
          className={styles.swatch}
          onChange={(event) => setValue(event.currentTarget.value)}
        />
        <input
          type="text"
          value={value}
          disabled={disabled}
          aria-label={`${label} hex value`}
          className={styles.hex}
          onChange={(event) => {
            const next = event.currentTarget.value
            setValue(next)
          }}
        />
      </div>
      <div className={styles.presets}>
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            className={styles.preset}
            style={{ background: preset }}
            aria-label={`Use colour ${preset}`}
            onClick={() => setValue(preset)}
          />
        ))}
      </div>
    </div>
  )
}
