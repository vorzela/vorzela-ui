import * as React from 'react'

import { cx } from '~/lib/cx'
import styles from './primitives.module.scss'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',')

/** Traps Tab focus and restores focus on unmount. */
export function FocusTrap({
  children,
  className,
  active = true,
  restoreFocus = true,
}: {
  children: React.ReactNode
  className?: string
  active?: boolean
  restoreFocus?: boolean
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const previous = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    if (!active) return
    const node = ref.current
    if (!node) return
    previous.current = document.activeElement as HTMLElement | null

    const items = node.querySelectorAll<HTMLElement>(FOCUSABLE)
    ;(items[0] ?? node).focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const focusable = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (focusable.length === 0) {
        event.preventDefault()
        return
      }
      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    node.addEventListener('keydown', onKeyDown)
    return () => {
      node.removeEventListener('keydown', onKeyDown)
      if (restoreFocus) previous.current?.focus()
    }
  }, [active, restoreFocus])

  return (
    <div ref={ref} className={cx(styles.trap, className)} tabIndex={-1}>
      {children}
    </div>
  )
}
