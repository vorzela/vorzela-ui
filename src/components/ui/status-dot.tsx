import { cx } from '~/lib/cx'
import styles from './status-dot.module.scss'

export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'
export type StatusDotSize = 'sm' | 'md' | 'lg'

const TONE: Record<StatusTone, string> = {
  neutral: styles.neutral,
  info: styles.info,
  success: styles.success,
  warning: styles.warning,
  danger: styles.danger,
}

const SIZE: Record<StatusDotSize, string> = {
  sm: styles.sm,
  md: '',
  lg: styles.lg,
}

export interface StatusDotProps {
  tone?: StatusTone
  size?: StatusDotSize
  /** Animate a halo — reserve for live states. */
  pulse?: boolean
  /** Accessible name. Without it the dot is treated as decorative. */
  label?: string
  className?: string
}

export function StatusDot({
  tone = 'neutral',
  size = 'md',
  pulse = false,
  label,
  className,
}: StatusDotProps) {
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cx(styles.root, SIZE[size], className)}
    >
      {pulse ? <span className={cx(styles.ping, TONE[tone])} /> : null}
      <span className={cx(styles.dot, TONE[tone])} />
    </span>
  )
}
