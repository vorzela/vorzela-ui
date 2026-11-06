import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'

import { cx } from '~/lib/cx'
import styles from './stat.module.scss'

export type StatTrend = 'up' | 'down' | 'flat'

export interface StatProps {
  label: string
  value: ReactNode
  delta?: string
  trend?: StatTrend
  /** Set when a lower value is better (latency, errors). */
  invertTrend?: boolean
  hint?: string
  icon?: ReactNode
  className?: string
}

const TREND_ICON = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: ArrowRight,
} as const

const TREND_LABEL: Record<StatTrend, string> = {
  up: 'up trend',
  down: 'down trend',
  flat: 'no change',
}

export function Stat({
  label,
  value,
  delta,
  trend = 'flat',
  invertTrend = false,
  hint,
  icon,
  className,
}: StatProps) {
  const Icon = TREND_ICON[trend]
  const positive =
    trend === 'flat' ? null : invertTrend ? trend === 'down' : trend === 'up'
  const deltaTone =
    positive == null
      ? styles.toneNeutral
      : positive
        ? styles.tonePositive
        : styles.toneNegative

  return (
    <div className={cx(styles.root, className)}>
      <div className={styles.head}>
        <p className={styles.label}>{label}</p>
        {icon ? (
          <span className={styles.icon} aria-hidden>
            {icon}
          </span>
        ) : null}
      </div>
      <p className={styles.value}>{value}</p>
      {delta || hint ? (
        <div className={styles.meta}>
          {delta ? (
            <span className={cx(styles.delta, deltaTone)}>
              <Icon className={styles.deltaIcon} aria-hidden />
              <span>{delta}</span>
              <span className={styles.srOnly}>{TREND_LABEL[trend]}</span>
            </span>
          ) : null}
          {hint ? <span className={styles.hint}>{hint}</span> : null}
        </div>
      ) : null}
    </div>
  )
}

export interface StatGroupProps {
  children: ReactNode
  className?: string
}

export function StatGroup({ children, className }: StatGroupProps) {
  return <div className={cx(styles.group, className)}>{children}</div>
}
