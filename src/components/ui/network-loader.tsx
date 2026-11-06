/**
 * components/ui/network-loader.tsx
 *
 * Top-of-viewport progress bar for network activity — the NProgress /
 * Inertia / Livewire / YouTube pattern.
 *
 * Two ways to drive it:
 *
 * 1. Automatically: `<NetworkLoader auto />` patches `window.fetch` while it
 *    is mounted and counts in-flight requests.
 * 2. Manually: `const loader = useNetworkLoader()` then `loader.start()` /
 *    `loader.done()` / `loader.error()` around any async work (router
 *    loaders, TanStack Query, XHR, web sockets, …).
 *
 * The bar is indeterminate on purpose: it trickles toward 90% while work is
 * pending and snaps to 100% when the last request settles, so it never claims
 * a percentage it cannot know.
 */
import * as React from 'react'

import { Portal } from '~/components/primitives/portal'
import { useReducedMotion } from '~/hooks/use-reduced-motion'
import { cx } from '~/lib/cx'
import { Spinner } from './spinner'
import {
  consumeNetworkLoaderFailure,
  failNetworkLoader,
  finishNetworkLoader,
  getPendingNetworkRequests,
  startNetworkLoader,
  subscribeNetworkLoader,
} from './network-loader-store'
import styles from './network-loader.module.scss'

let patchDepth = 0
let originalFetch: typeof window.fetch | undefined

/** Patch `window.fetch` once, counting every request in flight. */
function patchFetch() {
  if (typeof window === 'undefined' || patchDepth++ > 0) return
  if (!window.fetch) {
    patchDepth = 0
    return
  }
  originalFetch = window.fetch
  window.fetch = async (...args) => {
    startNetworkLoader()
    try {
      const response = await originalFetch!.apply(window, args)
      if (response.ok) finishNetworkLoader()
      else failNetworkLoader()
      return response
    } catch (error) {
      failNetworkLoader()
      throw error
    }
  }
}

/** Restore the original fetch when the last auto loader unmounts. */
function unpatchFetch() {
  if (typeof window === 'undefined') return
  patchDepth = Math.max(0, patchDepth - 1)
  if (patchDepth === 0 && originalFetch) {
    window.fetch = originalFetch
    originalFetch = undefined
  }
}

export type NetworkLoaderProps = {
  /** Patch `window.fetch` while mounted. */
  auto?: boolean
  /** Wait this long before showing, so fast requests never flash the bar. */
  delay?: number
  /** Keep the bar on screen at least this long once shown. */
  minimum?: number
  /** Interval between trickle steps, in ms. */
  speed?: number
  /** Bar colour. Defaults to the primary token. */
  color?: string
  /** Colour used when a tracked request failed. */
  errorColor?: string
  /** Bar thickness in px. */
  height?: number
  /** Stacking order. */
  zIndex?: number
  /** Pin the bar to the top or bottom edge. */
  position?: 'top' | 'bottom'
  /** Show a small spinner at the trailing edge. */
  showSpinner?: boolean
  /** Soft glow under the bar. */
  glow?: boolean
  /** Accessible name. */
  label?: string
  className?: string
  /** Class names for the coloured bar itself. */
  barClassName?: string
}

export function NetworkLoader({
  auto = false,
  delay = 150,
  minimum = 320,
  speed = 220,
  color,
  errorColor,
  height = 3,
  zIndex = 9999,
  position = 'top',
  showSpinner = false,
  glow = false,
  label = 'Loading',
  className,
  barClassName,
}: NetworkLoaderProps) {
  const reduce = useReducedMotion()
  const pendingCount = React.useSyncExternalStore(
    subscribeNetworkLoader,
    getPendingNetworkRequests,
    () => 0,
  )

  const [visible, setVisible] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [errored, setErrored] = React.useState(false)

  const visibleRef = React.useRef(false)
  const shownAt = React.useRef(0)
  const showTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const trickleTimer = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTrickle = React.useCallback(() => {
    if (trickleTimer.current) {
      clearInterval(trickleTimer.current)
      trickleTimer.current = null
    }
  }, [])

  const clearShow = React.useCallback(() => {
    if (showTimer.current) {
      clearTimeout(showTimer.current)
      showTimer.current = null
    }
  }, [])

  const clearHide = React.useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
  }, [])

  const show = React.useCallback(() => {
    clearHide()
    visibleRef.current = true
    shownAt.current = Date.now()
    setErrored(false)
    setProgress(8)
    setVisible(true)
    if (reduce) return
    clearTrickle()
    trickleTimer.current = setInterval(() => {
      setProgress((value) => {
        if (value >= 90) return value
        // Ease toward 90% without ever arriving.
        return Math.min(90, value + Math.max(0.6, (90 - value) * 0.12))
      })
    }, speed)
  }, [clearHide, clearTrickle, reduce, speed])

  const complete = React.useCallback(
    (hasError: boolean) => {
      clearShow()
      clearTrickle()
      setErrored(hasError)
      setProgress(100)
      const elapsed = Date.now() - shownAt.current
      const wait = Math.max(reduce ? 60 : 200, minimum - elapsed)
      clearHide()
      hideTimer.current = setTimeout(() => {
        hideTimer.current = null
        visibleRef.current = false
        setVisible(false)
        setProgress(0)
        setErrored(false)
      }, wait)
    },
    [clearHide, clearShow, clearTrickle, minimum, reduce],
  )

  // React to the in-flight count: start on the first request, finish on the last.
  React.useEffect(() => {
    if (pendingCount > 0) {
      if (visibleRef.current || showTimer.current) return
      showTimer.current = setTimeout(() => {
        showTimer.current = null
        if (getPendingNetworkRequests() > 0) show()
      }, delay)
      return
    }
    // Nothing left in flight.
    if (showTimer.current) {
      // Finished before the bar ever appeared — stay silent.
      clearShow()
      return
    }
    if (!visibleRef.current) return
    complete(consumeNetworkLoaderFailure())
  }, [pendingCount, delay, show, complete, clearShow])

  React.useEffect(() => {
    if (!auto) return
    patchFetch()
    return unpatchFetch
  }, [auto])

  React.useEffect(
    () => () => {
      clearShow()
      clearHide()
      clearTrickle()
    },
    [clearHide, clearShow, clearTrickle],
  )

  const barColor = errored
    ? (errorColor ?? 'hsl(var(--destructive))')
    : (color ?? 'hsl(var(--primary))')

  return (
    <Portal>
      <div
        className={cx(styles.root, position === 'top' ? styles.top : styles.bottom, className)}
        style={{ zIndex }}
      >
        <div
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={visible ? Math.round(progress) : undefined}
          aria-valuetext={visible ? `${Math.round(progress)}%` : undefined}
          aria-hidden={visible ? undefined : true}
          className={styles.track}
          style={{ height }}
        >
          <div
            className={cx(styles.bar, barClassName)}
            style={{
              width: `${progress}%`,
              background: barColor,
              opacity: visible ? 1 : 0,
              boxShadow: glow ? `0 0 10px ${barColor}` : undefined,
            }}
          />
          {showSpinner ? (
            <span
              aria-hidden
              className={cx(
                styles.spinner,
                position === 'top' ? styles.spinnerTop : styles.spinnerBottom,
                visible ? styles.spinnerVisible : styles.spinnerHidden,
              )}
            >
              <Spinner size="sm" label={label} className={styles.spinnerRing} />
            </span>
          ) : null}
        </div>
        <span className={styles.srOnly} role="status">
          {visible ? label : ''}
        </span>
      </div>
    </Portal>
  )
}
