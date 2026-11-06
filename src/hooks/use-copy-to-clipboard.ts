import { useCallback, useEffect, useRef, useState } from 'react'

export type CopyState = 'idle' | 'copied' | 'error'

/**
 * Clipboard copy with a self-clearing status and no leaked timers.
 * Requires a user gesture; never copy secrets automatically.
 */
export function useCopyToClipboard(resetAfterMs = 1800) {
  const [state, setState] = useState<CopyState>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  useEffect(() => clearTimer, [clearTimer])

  const copy = useCallback(
    async (value: string) => {
      clearTimer()
      try {
        if (!navigator.clipboard?.writeText) throw new Error('unsupported')
        await navigator.clipboard.writeText(value)
        setState('copied')
      } catch {
        setState('error')
      }
      timer.current = setTimeout(() => {
        setState('idle')
        timer.current = null
      }, resetAfterMs)
    },
    [clearTimer, resetAfterMs],
  )

  return { state, copy, reset: () => setState('idle') }
}
