import type { MutableRefObject, Ref } from 'react'

/**
 * Compose several refs into one callback ref.
 *
 * Avoids mutating another component's ref object during render, which keeps
 * the React compiler/ESLint ref rules happy while preserving forwarded refs.
 */
export function mergeRefs<T>(...refs: Array<Ref<T> | null | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === 'function') ref(node)
      else (ref as MutableRefObject<T | null>).current = node
    }
  }
}
