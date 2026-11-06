import * as React from 'react'
import { useId } from 'react'

import { cx } from '~/lib/cx'
import styles from './switch.module.scss'

export type SwitchSize = 'sm' | 'md' | 'lg'

const SIZE: Record<SwitchSize, string> = {
  sm: styles.sm,
  md: '',
  lg: styles.lg,
}

export interface SwitchProps {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  label?: React.ReactNode
  description?: string
  /** Put the switch after the label instead of before it. */
  reverse?: boolean
  size?: SwitchSize
  disabled?: boolean
  id?: string
  name?: string
  value?: string
  className?: string
}

export function Switch({
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  label,
  description,
  reverse = false,
  size = 'md',
  disabled = false,
  id: idProp,
  name,
  value,
  className,
}: SwitchProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const labelId = `${id}-label`
  const descriptionId = description ? `${id}-description` : undefined

  const [uncontrolled, setUncontrolled] = React.useState(defaultChecked)
  const checked = checkedProp ?? uncontrolled

  const toggle = () => {
    const next = !checked
    if (checkedProp === undefined) setUncontrolled(next)
    onCheckedChange?.(next)
  }

  const control = (
    <button
      type="button"
      role="switch"
      id={id}
      name={name}
      value={value}
      aria-checked={checked}
      aria-describedby={descriptionId}
      aria-label={label ? undefined : 'Toggle'}
      aria-labelledby={label ? labelId : undefined}
      disabled={disabled}
      className={cx(styles.switch, SIZE[size], className)}
      onClick={toggle}
    >
      <span className={styles.thumb} />
    </button>
  )

  if (!label && !description) return control

  return (
    <div className={styles.field} data-reverse={reverse ? 'true' : undefined}>
      {reverse ? (
        <>
          <span className={styles.text}>
            {label ? (
              <label htmlFor={id} id={labelId} className={styles.label}>
                {label}
              </label>
            ) : null}
            {description ? (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            ) : null}
          </span>
          {control}
        </>
      ) : (
        <>
          {control}
          <span className={styles.text}>
            {label ? (
              <label htmlFor={id} id={labelId} className={styles.label}>
                {label}
              </label>
            ) : null}
            {description ? (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            ) : null}
          </span>
        </>
      )}
    </div>
  )
}
