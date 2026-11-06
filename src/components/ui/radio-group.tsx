import { useId } from 'react'

import { cx } from '~/lib/cx'
import styles from './radio-group.module.scss'

export type RadioOption = {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export type RadioOrientation = 'vertical' | 'horizontal'

export interface RadioGroupProps {
  options: RadioOption[]
  value?: string
  onChange?: (value: string) => void
  name?: string
  label?: string
  className?: string
  orientation?: RadioOrientation
}

export function RadioGroup({
  options,
  value,
  onChange,
  name,
  label,
  className,
  orientation = 'vertical',
}: RadioGroupProps) {
  const autoName = useId()
  const groupName = name ?? autoName

  return (
    <fieldset className={cx(styles.root, className)}>
      {label ? <legend className={styles.legend}>{label}</legend> : null}

      <div
        className={cx(
          styles.options,
          orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        )}
      >
        {options.map((option) => {
          const id = `${groupName}-${option.value}`
          const selected = value === option.value

          return (
            <label
              key={option.value}
              htmlFor={id}
              className={cx(styles.option, option.disabled && styles.disabled)}
              data-state={selected ? 'checked' : undefined}
              data-disabled={option.disabled ? 'true' : undefined}
            >
              <span className={styles.controlWrap}>
                <input
                  id={id}
                  type="radio"
                  name={groupName}
                  value={option.value}
                  checked={selected}
                  disabled={option.disabled}
                  onChange={() => onChange?.(option.value)}
                  className={styles.control}
                />
                <span className={styles.dot} aria-hidden />
              </span>

              <span className={styles.text}>
                <span className={styles.label}>{option.label}</span>
                {option.description ? (
                  <span className={styles.description}>
                    {option.description}
                  </span>
                ) : null}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
