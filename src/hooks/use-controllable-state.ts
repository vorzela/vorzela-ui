import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Supports both controlled and uncontrolled usage.
 * Controlled: pass `value` + `onValueChange`.
 * Uncontrolled: pass `defaultValue`.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T
  defaultValue: T
  onChange?: (value: T) => void
}) {
  const [internal, setInternal] = useState<T>(defaultValue)
  const isControlled = value !== undefined
  const current = isControlled ? value : internal
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === 'function'
          ? (next as (prev: T) => T)(current)
          : next
      if (!isControlled) setInternal(resolved)
      onChangeRef.current?.(resolved)
    },
    [current, isControlled],
  )

  return [current, setValue] as const
}
