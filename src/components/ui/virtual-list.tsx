import * as React from 'react'

import { cx } from '~/lib/cx'
import styles from './virtual-list.module.scss'

export interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  height?: number
  overscan?: number
  renderItem: (item: T, index: number) => React.ReactNode
  getKey: (item: T, index: number) => React.Key
  label?: string
  className?: string
}

/** Windowed list for large record sets with fixed row heights. */
export function VirtualList<T>({
  items,
  itemHeight,
  height = 320,
  overscan = 4,
  renderItem,
  getKey,
  label = 'List',
  className,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0)

  const total = items.length * itemHeight
  const visible = Math.ceil(height / itemHeight)
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const end = Math.min(items.length, start + visible + overscan * 2)

  return (
    <div
      role="list"
      aria-label={label}
      tabIndex={0}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      style={{ height }}
      className={cx(styles.root, className)}
    >
      <div className={styles.inner} style={{ height: total }}>
        {items.slice(start, end).map((item, offset) => {
          const index = start + offset

          return (
            <div
              key={getKey(item, index)}
              role="listitem"
              className={styles.item}
              style={{ top: index * itemHeight, height: itemHeight }}
            >
              {renderItem(item, index)}
            </div>
          )
        })}
      </div>
    </div>
  )
}
