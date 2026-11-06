import { cx } from '~/lib/cx'
import styles from './slider.module.scss'

export interface SliderProps {
  value?: number
  min?: number
  max?: number
  step?: number
  onChange?: (value: number) => void
  label?: string
  className?: string
  disabled?: boolean
}

export function Slider({
  value = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  className,
  disabled,
}: SliderProps) {
  const span = max - min
  const ratio = span > 0 ? (value - min) / span : 0
  const percent = Math.min(100, Math.max(0, ratio * 100))

  return (
    <div
      className={cx(styles.root, disabled && styles.disabled, className)}
    >
      {label ? (
        <div className={styles.header}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{value}</span>
        </div>
      ) : null}

      <div className={styles.rail}>
        <span
          className={styles.fill}
          style={{ inlineSize: `${percent}%` }}
          aria-hidden
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-label={label ?? 'Slider'}
          onChange={(event) => onChange?.(Number(event.currentTarget.value))}
          className={styles.control}
        />
      </div>
    </div>
  )
}
