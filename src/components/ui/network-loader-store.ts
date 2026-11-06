/**
 * components/ui/network-loader-store.ts
 *
 * Shared in-flight counter and imperative controls for `NetworkLoader`.
 * Kept out of the component file so React Fast Refresh keeps working.
 */
import * as React from 'react'

let pending = 0
let failures = 0
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

/** Subscribe to in-flight changes (used by `NetworkLoader`). */
export function subscribeNetworkLoader(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Snapshot for `useSyncExternalStore`. */
export function getPendingNetworkRequests() {
  return pending
}

/** Register the start of a request. Pair every call with done/error. */
export function startNetworkLoader() {
  pending += 1
  emit()
}

/** Register a successful request. */
export function finishNetworkLoader() {
  pending = Math.max(0, pending - 1)
  emit()
}

/** Register a failed request — the bar completes in the destructive colour. */
export function failNetworkLoader() {
  pending = Math.max(0, pending - 1)
  failures += 1
  emit()
}

/** Forget everything in flight (e.g. on logout or route reset). */
export function resetNetworkLoader() {
  pending = 0
  failures = 0
  emit()
}

/** How many requests are currently in flight. */
export function pendingNetworkRequests() {
  return pending
}

/** Read-and-reset the failure flag when the bar completes. */
export function consumeNetworkLoaderFailure() {
  const failed = failures > 0
  failures = 0
  return failed
}

/** Imperative controls for any async work. */
export function useNetworkLoader() {
  return React.useMemo(
    () => ({
      start: startNetworkLoader,
      done: finishNetworkLoader,
      error: failNetworkLoader,
      reset: resetNetworkLoader,
      get pending() {
        return pendingNetworkRequests()
      },
    }),
    [],
  )
}
