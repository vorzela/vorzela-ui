import { useEffect, useRef } from 'react'

/** Keep the latest value in a ref without touching it during render. */
export function useLatest<T>(value: T) {
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref
}
