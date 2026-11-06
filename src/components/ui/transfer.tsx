import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'

import { cx } from '~/lib/cx'

import { Button } from './button'
import styles from './transfer.module.scss'

export type TransferItem = {
  key: string
  label: string
  description?: string
  disabled?: boolean
}

export type TransferDirection = 'left' | 'right'

export interface TransferProps {
  dataSource: TransferItem[]
  targetKeys?: string[]
  defaultTargetKeys?: string[]
  onChange?: (keys: string[], direction: TransferDirection, moved: string[]) => void
  titles?: [string, string]
  searchable?: boolean
  showCount?: boolean
  disabled?: boolean
  height?: number | string
  className?: string
  'aria-label'?: string
}

/** Two-pane selection list for moving items between source and target. */
export function Transfer({
  dataSource,
  targetKeys,
  defaultTargetKeys = [],
  onChange,
  titles = ['Source', 'Selected'],
  searchable = true,
  showCount = true,
  disabled = false,
  height = 240,
  className,
  'aria-label': ariaLabel = 'Transfer list',
}: TransferProps) {
  const [internalKeys, setInternalKeys] = useState<string[]>(defaultTargetKeys)
  const [leftQuery, setLeftQuery] = useState('')
  const [rightQuery, setRightQuery] = useState('')
  const [leftChecked, setLeftChecked] = useState<string[]>([])
  const [rightChecked, setRightChecked] = useState<string[]>([])

  const keys = targetKeys ?? internalKeys
  const keySet = new Set(keys)
  const source = dataSource.filter((item) => !keySet.has(item.key))
  const target = dataSource.filter((item) => keySet.has(item.key))

  const filter = (items: TransferItem[], query: string) => {
    const value = query.trim().toLowerCase()
    if (!value) return items
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(value) ||
        item.description?.toLowerCase().includes(value),
    )
  }

  const leftItems = useMemo(() => filter(source, leftQuery), [source, leftQuery])
  const rightItems = useMemo(() => filter(target, rightQuery), [target, rightQuery])

  const update = (next: string[], direction: TransferDirection, moved: string[]) => {
    if (targetKeys === undefined) setInternalKeys(next)
    onChange?.(next, direction, moved)
  }

  const move = (direction: TransferDirection) => {
    const moving = direction === 'right' ? leftChecked : rightChecked
    if (moving.length === 0) return
    const next =
      direction === 'right'
        ? [...keys, ...moving.filter((key) => !keySet.has(key))]
        : keys.filter((key) => !moving.includes(key))
    update(next, direction, moving)
    if (direction === 'right') setLeftChecked([])
    else setRightChecked([])
  }

  const toggle = (list: string[], key: string, checked: boolean) =>
    checked ? [...list, key] : list.filter((item) => item !== key)

  const renderPane = (
    items: TransferItem[],
    checked: string[],
    setChecked: (keys: string[]) => void,
    query: string,
    setQuery: (query: string) => void,
    title: string,
  ) => (
    <div className={styles.pane}>
      <div className={styles.paneHead}>
        <p className={styles.title}>{title}</p>
        {showCount ? <span className={styles.count}>{items.length}</span> : null}
      </div>
      {searchable ? (
        <input
          type="search"
          value={query}
          placeholder={`Search ${title.toLowerCase()}…`}
          aria-label={`Search ${title}`}
          className={styles.search}
          onChange={(event) => setQuery(event.target.value)}
        />
      ) : null}
      <ul className={styles.list} style={{ height }}>
        {items.length === 0 ? (
          <li className={styles.empty}>No items</li>
        ) : (
          items.map((item) => {
            const isChecked = checked.includes(item.key)
            return (
              <li key={item.key}>
                <label
                  className={cx(styles.row, item.disabled && styles.rowDisabled)}
                >
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={isChecked}
                    disabled={disabled || item.disabled}
                    onChange={(event) =>
                      setChecked(toggle(checked, item.key, event.target.checked))
                    }
                  />
                  <span className={styles.text}>
                    <span className={styles.label}>{item.label}</span>
                    {item.description ? (
                      <span className={styles.description}>{item.description}</span>
                    ) : null}
                  </span>
                </label>
              </li>
            )
          })
        )}
      </ul>
    </div>
  )

  return (
    <div className={cx(styles.root, className)} role="group" aria-label={ariaLabel}>
      {renderPane(leftItems, leftChecked, setLeftChecked, leftQuery, setLeftQuery, titles[0])}
      <div className={styles.actions}>
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label="Move selected to the right"
          disabled={disabled || leftChecked.length === 0}
          onClick={() => move('right')}
        >
          <ChevronRight aria-hidden size={16} />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label="Move selected to the left"
          disabled={disabled || rightChecked.length === 0}
          onClick={() => move('left')}
        >
          <ChevronLeft aria-hidden size={16} />
        </Button>
      </div>
      {renderPane(rightItems, rightChecked, setRightChecked, rightQuery, setRightQuery, titles[1])}
    </div>
  )
}
