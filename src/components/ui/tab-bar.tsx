import * as React from 'react'

import { useControllableState } from '~/hooks/use-controllable-state'
import { cx } from '~/lib/cx'
import styles from './tab-bar.module.scss'

export interface TabBarItem {
  value: string
  label: string
  icon?: React.ReactNode
  /** Small count or dot rendered above the icon. */
  badge?: React.ReactNode
  disabled?: boolean
}

export interface TabBarProps {
  items: TabBarItem[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** Accessible name for the navigation landmark. */
  label?: string
  /** `fixed` pins the bar to the bottom with a safe-area inset. */
  position?: 'static' | 'fixed'
  className?: string
}

/**
 * Compact bottom navigation. Grid-based, one tab stop, roving focus with
 * Arrow/Home/End keys. Active state is expressed with `aria-current`.
 */
export function TabBar({
  items,
  value: valueProp,
  defaultValue,
  onChange,
  label = 'Primary navigation',
  position = 'static',
  className,
}: TabBarProps) {
  const [value, setValue] = useControllableState<string>({
    value: valueProp,
    defaultValue: defaultValue ?? items[0]?.value ?? '',
    onChange,
  })
  const refs = React.useRef<Array<HTMLButtonElement | null>>([])
  const enabled = items.filter((item) => !item.disabled)
  const activeIndex = items.findIndex((item) => item.value === value)
  const tabStop = activeIndex >= 0 ? activeIndex : 0

  const move = (direction: 1 | -1) => {
    if (enabled.length === 0) return
    const currentValue = items[tabStop]?.value
    const currentEnabled = Math.max(
      0,
      enabled.findIndex((item) => item.value === currentValue),
    )
    const next = enabled[(currentEnabled + direction + enabled.length) % enabled.length]
    if (next) {
      setValue(next.value)
      refs.current[items.indexOf(next)]?.focus()
    }
  }

  return (
    <nav
      aria-label={label}
      className={cx(styles.root, position === 'fixed' && styles.fixed, className)}
      style={{ ['--tab-count' as string]: items.length } as React.CSSProperties}
    >
      {items.map((item, index) => {
        const active = item.value === value

        return (
          <button
            key={item.value}
            ref={(node) => {
              refs.current[index] = node
            }}
            type="button"
            disabled={item.disabled}
            aria-current={active ? 'page' : undefined}
            tabIndex={active ? 0 : -1}
            className={cx(styles.item, active && styles.active)}
            onClick={() => setValue(item.value)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') {
                event.preventDefault()
                move(1)
              } else if (event.key === 'ArrowLeft') {
                event.preventDefault()
                move(-1)
              } else if (event.key === 'Home') {
                event.preventDefault()
                const first = enabled[0]
                if (first) {
                  setValue(first.value)
                  refs.current[items.indexOf(first)]?.focus()
                }
              } else if (event.key === 'End') {
                event.preventDefault()
                const last = enabled[enabled.length - 1]
                if (last) {
                  setValue(last.value)
                  refs.current[items.indexOf(last)]?.focus()
                }
              }
            }}
          >
            {item.icon ? <span className={styles.icon}>{item.icon}</span> : null}
            <span className={styles.label}>{item.label}</span>
            {item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
          </button>
        )
      })}
    </nav>
  )
}
