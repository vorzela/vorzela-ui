import { ChevronDown, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cx } from '~/lib/cx'
import { DismissableLayer } from '~/components/primitives/dismissable-layer'

import styles from './cascader.module.scss'

export type CascaderOption = {
  value: string
  label: string
  children?: CascaderOption[]
  disabled?: boolean
}

export interface CascaderProps {
  options: CascaderOption[]
  value?: string[]
  defaultValue?: string[]
  onChange?: (value: string[], selected: CascaderOption[]) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  separator?: string
}

function findOption(options: CascaderOption[], value: string): CascaderOption | undefined {
  return options.find((option) => option.value === value)
}

function resolve(options: CascaderOption[], path: string[]): CascaderOption[] {
  const result: CascaderOption[] = []
  let current = options
  for (const value of path) {
    const option = findOption(current, value)
    if (!option) break
    result.push(option)
    current = option.children ?? []
  }
  return result
}

/** Multi-level select for dependent options. */
export function Cascader({
  options,
  value,
  defaultValue = [],
  onChange,
  label,
  placeholder = 'Select an option',
  disabled = false,
  className,
  id,
  separator = ' / ',
}: CascaderProps) {
  const [open, setOpen] = useState(false)
  const [internal, setInternal] = useState<string[]>(defaultValue)
  const [path, setPath] = useState<string[]>(value ?? defaultValue)

  const selected = value ?? internal
  const selectedOptions = resolve(options, selected)

  useEffect(() => {
    if (!open) return
    setPath(value ?? internal)
  }, [open, value, internal])

  const choose = (option: CascaderOption) => {
    if (option.disabled) return
    const nextPath = [...path, option.value]
    setPath(nextPath)
    if (option.children?.length) return
    const nextValue = nextPath
    if (value === undefined) setInternal(nextValue)
    onChange?.(nextValue, resolve(options, nextValue))
    setOpen(false)
  }

  const columns: CascaderOption[][] = []
  let current = options
  for (const valuePart of path) {
    if (!current.length) break
    columns.push(current)
    const next = findOption(current, valuePart)
    current = next?.children ?? []
  }
  if (current.length) columns.push(current)

  return (
    <div className={cx(styles.root, className)}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cx(styles.trigger)}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={selectedOptions.length ? undefined : styles.placeholder}>
          {selectedOptions.length
            ? selectedOptions.map((option) => option.label).join(separator)
            : placeholder}
        </span>
        <ChevronDown className={cx(styles.chevron, open && styles.open)} aria-hidden />
      </button>

      {open ? (
        <DismissableLayer onDismiss={() => setOpen(false)}>
          <div className={styles.panel} role="listbox" aria-label={label ?? placeholder}>
            {columns.map((column, depth) => (
              <ul key={depth} className={styles.column} role="group">
                {column.map((option) => {
                  const active = path[depth] === option.value
                  const isSelected =
                    selected[depth] === option.value && depth === selected.length - 1
                  return (
                    <li key={option.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        disabled={option.disabled}
                        className={cx(
                          styles.option,
                          active && styles.optionActive,
                          isSelected && styles.optionSelected,
                        )}
                        onClick={() => choose(option)}
                      >
                        {option.label}
                        {option.children?.length ? (
                          <ChevronRight className={styles.optionArrow} aria-hidden size={13} />
                        ) : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            ))}
          </div>
        </DismissableLayer>
      ) : null}
    </div>
  )
}
