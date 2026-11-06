import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('online', onChange)
  window.addEventListener('offline', onChange)
  return () => {
    window.removeEventListener('online', onChange)
    window.removeEventListener('offline', onChange)
  }
}

function getSnapshot() {
  if (typeof navigator === 'undefined') return true
  return navigator.onLine
}

/** True when the browser reports a network connection. */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => true)
}
