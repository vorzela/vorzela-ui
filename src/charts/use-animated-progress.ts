import { useEffect, useState } from 'react'

import { useReducedMotion } from '~/hooks/use-reduced-motion'
import { easeOutCubic } from './chart-utils'

/**
 * Animates 0 → 1 on mount and whenever `resetKey` changes.
 * The RAF is always cancelled on unmount or reset.
 */
export function useAnimatedProgress({
  duration = 600,
  enabled = true,
  resetKey = '',
}: {
  duration?: number
  enabled?: boolean
  resetKey?: string
}): number {
  const reduced = useReducedMotion()
  const [progress, setProgress] = useState(0)
  const active = enabled && !reduced

  useEffect(() => {
    if (!active) {
      setProgress(1)
      return
    }
    let frame = 0
    let start = 0
    let finished = false

    const tick = (now: number) => {
      if (!start) start = now
      const next = Math.min(1, (now - start) / duration)
      setProgress(easeOutCubic(next))
      if (next < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        finished = true
      }
    }
    frame = requestAnimationFrame(tick)

    // Embedded browsers and background tabs can throttle RAF indefinitely.
    // Guarantee the chart settles on its real values regardless.
    const fallback = window.setTimeout(() => {
      if (!finished) {
        finished = true
        setProgress(1)
      }
    }, duration + 120)

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(fallback)
    }
  }, [active, duration, resetKey])

  return active ? progress : 1
}
