/**
 * components/ui/toolbar.tsx
 *
 * Horizontal toolbar with roving arrow-key navigation.
 */
import * as React from 'react'

import { cx } from '~/lib/cx'
import { Separator } from './separator'
import styles from './toolbar.module.scss'

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  label?: string
}

export function Toolbar({
  children,
  label = 'Toolbar',
  className,
  onKeyDown,
  ...props
}: ToolbarProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  return (
    <div
      {...props}
      ref={ref}
      role="toolbar"
      aria-label={label}
      className={cx(styles.root, className)}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
          return
        }

        const node = ref.current
        if (!node) return

        const items = Array.from(
          node.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], [tabindex="0"]',
          ),
        )
        if (!items.length) return

        event.preventDefault()

        const current = items.indexOf(document.activeElement as HTMLElement)
        let next = current

        if (event.key === 'ArrowRight') next = (current + 1) % items.length
        if (event.key === 'ArrowLeft') {
          next = (current - 1 + items.length) % items.length
        }
        if (event.key === 'Home') next = 0
        if (event.key === 'End') next = items.length - 1

        items[next]?.focus()
      }}
    >
      {children}
    </div>
  )
}

export interface ToolbarGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function ToolbarGroup({
  children,
  className,
  ...props
}: ToolbarGroupProps) {
  return (
    <div {...props} className={cx(styles.group, className)}>
      {children}
    </div>
  )
}

export function ToolbarSeparator() {
  return (
    <Separator
      orientation="vertical"
      className={styles.separator}
    />
  )
}
