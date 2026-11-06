import * as React from 'react'

import { cx } from '~/lib/cx'
import styles from './range-slider.module.scss'

export interface RangeSliderProps {
  value?: [number, number]
  defaultValue?: [number, number]
  onChange?: (value: [number, number]) => void
  min?: number
  max?: number
  step?: number
  label?: string
  disabled?: boolean
  className?: string
}

/** Dual-thumb range input for price, radius and numeric intervals. */
export function RangeSlider({
  value: valueProp,
  defaultValue = [20, 80],
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label = 'Range',
  disabled = false,
  className,
}: RangeSliderProps) {
  const [uncontrolled, setUncontrolled] = React.useState<[number, number]>(
    defaultValue,
  )
  const value = valueProp ?? uncontrolled
  const [low, high] = value

  const update = (nextLow: number, nextHigh: number) => {
    if (valueProp === undefined) setUncontrolled([nextLow, nextHigh])
    onChange?.([nextLow, nextHigh])
  }

  const percent = (current: number) => ((current - min) / (max - min)) * 100

  return (
    <div className={cx(styles.root, className)}>
      <div className={styles.header}>
        <span>{label}</span>
        <span className={styles.value}>
          {low} – {high}
        </span>
      </div>
      <div className={styles.track}>
        <span className={styles.rail} aria-hidden />
        <span
          className={styles.fill}
          style={{ left: `${percent(low)}%`, right: `${100 - percent(high)}%` }}
          aria-hidden
        />
        <input
          type="range"
          aria-label={`${label} minimum`}
          min={min}
          max={max}
          step={step}
          value={low}
          disabled={disabled}
          className={styles.input}
          onChange={(event) =>
            update(Math.min(Number(event.currentTarget.value), high), high)
          }
        />
        <input
          type="range"
          aria-label={`${label} maximum`}
          min={min}
          max={max}
          step={step}
          value={high}
          disabled={disabled}
          className={styles.input}
          onChange={(event) =>
            update(low, Math.max(Number(event.currentTarget.value), low))
          }
        />
      </div>
    </div>
  )
}
