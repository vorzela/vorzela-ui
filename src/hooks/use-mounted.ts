import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/**
 * `false` during SSR/hydration, `true` on the client.
 * Replaces the `useEffect(() => setMounted(true), [])` pattern.
 */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
