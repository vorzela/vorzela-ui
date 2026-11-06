import { cx } from '~/lib/cx'
import styles from './progress.module.scss'

export type ProgressSize = 'sm' | 'md' | 'lg'
export type ProgressTone = 'primary' | 'success' | 'warning' | 'destructive'

const SIZE: Record<ProgressSize, string> = {
  sm: styles.sm,
  md: '',
  lg: styles.lg,
}

const TONE: Record<ProgressTone, string> = {
  primary: '',
  success: styles.success,
  warning: styles.warning,
  destructive: styles.destructive,
}

export interface ProgressProps {
  /** 0–100. Omit to render an indeterminate bar. */
  value?: number
  size?: ProgressSize
  tone?: ProgressTone
  label?: string
  showValue?: boolean
  className?: string
}

export function Progress({
  value,
  size = 'md',
  tone = 'primary',
  label,
  showValue = true,
  className,
}: ProgressProps) {
  const indeterminate = value === undefined
  const clamped = indeterminate ? 0 : Math.min(100, Math.max(0, value))
  const rounded = Math.round(clamped)

  return (
    <div className={cx(styles.root, SIZE[size], className)}>
      {label ? (
        <div className={styles.header}>
          <span className={styles.label}>{label}</span>
          {!indeterminate && showValue ? (
            <span className={styles.value}>{rounded}%</span>
          ) : null}
        </div>
      ) : null}

      <div
        role="progressbar"
        aria-label={label ?? 'Progress'}
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : 100}
        aria-valuenow={indeterminate ? undefined : rounded}
        aria-valuetext={indeterminate ? undefined : `${rounded}%`}
        className={cx(styles.track, TONE[tone])}
      >
        <div
          className={cx(styles.indicator, indeterminate && styles.indeterminate)}
          style={indeterminate ? undefined : { width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
