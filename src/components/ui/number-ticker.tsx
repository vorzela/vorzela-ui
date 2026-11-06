import * as React from 'react'

import { useReducedMotion } from '~/hooks/use-reduced-motion'
import { cx } from '~/lib/cx'
import styles from './number-ticker.module.scss'

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

export interface NumberTickerProps {
  value: number
  from?: number
  duration?: number
  format?: (value: number) => string
  className?: string
  suffix?: string
}

export function NumberTicker({
  value,
  from = 0,
  duration = 700,
  format = (n) => Math.round(n).toLocaleString(),
  className,
  suffix,
}: NumberTickerProps) {
  const reduced = useReducedMotion()
  const [display, setDisplay] = React.useState(from)
  const previous = React.useRef(from)
  const shown = reduced ? value : display

  React.useEffect(() => {
    if (reduced) {
      previous.current = value
      return
    }
    const start = performance.now()
    const initial = previous.current
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const next = initial + (value - initial) * easeOutCubic(progress)
      setDisplay(next)
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        previous.current = value
      }
    }

    frame = requestAnimationFrame(tick)
    const fallback = window.setTimeout(() => {
      setDisplay(value)
      previous.current = value
    }, duration + 120)

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(fallback)
    }
  }, [duration, reduced, value])

  return (
    <span className={cx(styles.root, className)}>
      <span aria-hidden>
        {format(shown)}
        {suffix}
      </span>
      <span className={styles.srOnly}>
        {format(value)}
        {suffix}
      </span>
    </span>
  )
}
