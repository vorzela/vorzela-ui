import * as React from 'react'

import { useControllableState } from '~/hooks/use-controllable-state'
import { cx } from '~/lib/cx'
import styles from './segmented-control.module.scss'

export type SegmentedSize = 'sm' | 'default'

export type SegmentedOption<T extends string> = {
  value: T
  label: React.ReactNode
  icon?: React.ReactNode
  disabled?: boolean
}

export interface SegmentedControlProps<T extends string> {
  options: Array<SegmentedOption<T>>
  value?: T
  defaultValue?: T
  onChange?: (value: T) => void
  size?: SegmentedSize
  label?: string
  className?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  defaultValue,
  onChange,
  size = 'default',
  label = 'View',
  className,
}: SegmentedControlProps<T>) {
  const [current, setCurrent] = useControllableState<T>({
    value,
    defaultValue: defaultValue ?? options[0]?.value,
    onChange,
  })
  const refs = React.useRef<Array<HTMLButtonElement | null>>([])

  const move = (direction: 1 | -1) => {
    const enabled = options
      .map((option, index) => ({ option, index }))
      .filter(({ option }) => !option.disabled)
    if (!enabled.length) return

    const at = enabled.findIndex(({ option }) => option.value === current)
    const next = enabled[(at + direction + enabled.length) % enabled.length]
    setCurrent(next.option.value)
    refs.current[next.index]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx(styles.root, size === 'sm' && styles.sm, className)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault()
          move(1)
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault()
          move(-1)
        }
      }}
    >
      {options.map((option, index) => {
        const selected = option.value === current

        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[index] = node
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={option.disabled}
            tabIndex={selected ? 0 : -1}
            onClick={() => setCurrent(option.value)}
            className={styles.option}
          >
            {option.icon ? (
              <span className={styles.icon} aria-hidden>
                {option.icon}
              </span>
            ) : null}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
