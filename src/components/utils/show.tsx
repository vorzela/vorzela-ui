import type React from 'react'

/**
 * <Show when={condition} fallback={<Fallback />}>
 *   {children}
 * </Show>
 *
 * Renders children when `when` is truthy; renders `fallback` (or null) otherwise.
 * When children is a function it receives the truthy value as its first argument —
 * handy for narrowing nullable values without an extra variable.
 */
interface ShowProps<T> {
  when: T | null | undefined | false
  fallback?: React.ReactNode
  children: React.ReactNode | ((value: NonNullable<T>) => React.ReactNode)
}

export function Show<T>({ when, fallback = null, children }: ShowProps<T>) {
  if (!when) return <>{fallback}</>
  return <>{typeof children === 'function' ? children(when as NonNullable<T>) : children}</>
}
