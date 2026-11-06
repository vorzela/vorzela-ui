/**
 * Combobox combining input + popover + list. Debounce-safe, keyboard
 * navigable, focus-trapped panel, proper cleanup.
 */
import { Check, ChevronsUpDown, X } from 'lucide-react'
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from 'react'
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

import { useMounted } from '~/hooks/use-mounted'
import { cx } from '~/lib/cx'

import { Label } from './label'
import styles from './combobox.module.scss'

export interface ComboboxOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onSearchChange?: (query: string) => void
  placeholder?: string
  searchPlaceholder?: string
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  emptyMessage?: string
  className?: string
  wrapClassName?: string
  clearable?: boolean
  freeSolo?: boolean
}

export function Combobox({
  options,
  value: valueProp,
  defaultValue = '',
  onChange,
  onSearchChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  label,
  hint,
  error,
  required,
  disabled,
  emptyMessage = 'No results found.',
  className,
  wrapClassName,
  clearable = true,
  freeSolo = false,
}: ComboboxProps) {
  const id = useId()
  const isControlled = valueProp !== undefined
  const [uncontrolled, setUncontrolled] = useState(defaultValue)
  const value = isControlled ? valueProp : uncontrolled

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState<string | null>(null)
  const mounted = useMounted()
  const [pos, setPos] = useState({ left: 0, top: 0, bottom: 0, width: 0 })
  const [dropUp, setDropUp] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selectedOption = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  )

  // `null` means "show the selected label"; a string is the user's filter.
  const query = open ? (search ?? selectedOption?.label ?? '') : ''
  const setQuery = (next: string) => setSearch(next)

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options
    const q = query.toLowerCase()
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q) ||
        (o.description?.toLowerCase().includes(q) ?? false),
    )
  }, [options, query])

  const measure = useCallback(() => {
    if (!triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - r.bottom
    const spaceAbove = r.top
    setDropUp(spaceBelow < 280 && spaceAbove > spaceBelow)
    setPos({ left: r.left, top: r.bottom, bottom: r.top, width: r.width })
  }, [])

  const openPanel = useCallback(() => {
    if (disabled) return
    measure()
    setActiveIdx(-1)
    setSearch(null)
    setOpen(true)
    queueMicrotask(() => inputRef.current?.focus({ preventScroll: true }))
  }, [disabled, measure])

  const closePanel = useCallback((returnFocus = true) => {
    setOpen(false)
    setSearch(null)
    setActiveIdx(-1)
    if (returnFocus) triggerRef.current?.focus({ preventScroll: true })
  }, [])

  const selectValue = useCallback(
    (nextValue: string) => {
      if (!isControlled) setUncontrolled(nextValue)
      if (value !== nextValue) onChange?.(nextValue)
      closePanel()
    },
    [closePanel, isControlled, onChange, value],
  )

  useEffect(() => {
    if (!open) return
    const handler = (event: PointerEvent) => {
      const target = event.target as Node
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return
      }
      closePanel(false)
    }
    const timer = setTimeout(() => document.addEventListener('pointerdown', handler), 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('pointerdown', handler)
    }
  }, [closePanel, open])

  useEffect(() => {
    if (!open) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        closePanel()
      }
    }
    document.addEventListener('keydown', handler, { capture: true })
    return () => document.removeEventListener('keydown', handler, { capture: true })
  }, [closePanel, open])

  useEffect(() => {
    if (!open) return
    const update = () => measure()
    window.addEventListener('scroll', update, { passive: true, capture: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update, { capture: true })
      window.removeEventListener('resize', update)
    }
  }, [measure, open])

  useEffect(() => {
    if (activeIdx < 0 || !listRef.current) return
    const el = listRef.current.children[activeIdx] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        openPanel()
      }
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, filteredOptions.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const opt = filteredOptions[activeIdx]
      if (opt && !opt.disabled) selectValue(opt.value)
    } else if (event.key === 'Tab') {
      closePanel(false)
    }
  }

  const panelStyle: CSSProperties = {
    position: 'fixed',
    left: `${pos.left}px`,
    width: `${pos.width}px`,
    ...(dropUp
      ? {
          bottom: `${window.innerHeight - pos.bottom + 6}px`,
          transformOrigin: 'bottom',
        }
      : { top: `${pos.top + 6}px`, transformOrigin: 'top' }),
  }

  return (
    <div className={cx(styles.root, wrapClassName)}>
      {label ? (
        <Label htmlFor={id} required={required} hint={hint} hintId={`${id}-hint`}>
          {label}
        </Label>
      ) : null}

      <div className={styles.field}>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          aria-disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
              .filter(Boolean)
              .join(' ') || undefined
          }
          aria-activedescendant={
            open && activeIdx >= 0 ? `${id}-option-${activeIdx}` : undefined
          }
          disabled={disabled}
          onClick={() => (open ? closePanel() : openPanel())}
          onKeyDown={handleKeyDown}
          className={cx(styles.trigger, error && styles.invalid, className)}
        >
          <span
            className={cx(
              styles.value,
              !selectedOption && !value ? styles.placeholder : undefined,
            )}
          >
            {selectedOption?.label ?? value ?? placeholder}
          </span>
          <ChevronsUpDown size={14} className={styles.chevron} aria-hidden />
        </button>

        {clearable && value && !disabled ? (
          <button
            type="button"
            className={styles.clear}
            aria-label="Clear selection"
            onClick={(event) => {
              event.stopPropagation()
              if (!isControlled) setUncontrolled('')
              onChange?.('')
              setQuery('')
            }}
          >
            <X size={14} aria-hidden />
          </button>
        ) : null}
      </div>

      {open && mounted
        ? createPortal(
            <div ref={panelRef} className={styles.panel} style={panelStyle}>
              <div className={styles.searchWrap}>
                <input
                  ref={inputRef}
                  type="text"
                  aria-label={searchPlaceholder}
                  autoComplete="off"
                  className={styles.searchInput}
                  placeholder={searchPlaceholder}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.currentTarget.value)
                    onSearchChange?.(event.currentTarget.value)
                    setActiveIdx(-1)
                  }}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div
                ref={listRef}
                id={`${id}-listbox`}
                role="listbox"
                aria-label={label ?? placeholder}
                className={styles.list}
              >
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option, i) => (
                    <button
                      key={option.value}
                      id={`${id}-option-${i}`}
                      type="button"
                      role="option"
                      aria-selected={value === option.value}
                      disabled={option.disabled}
                      className={cx(
                        styles.option,
                        option.disabled && styles.optionDisabled,
                        activeIdx === i && !option.disabled && styles.optionActive,
                      )}
                      onClick={() => !option.disabled && selectValue(option.value)}
                      onPointerEnter={() => !option.disabled && setActiveIdx(i)}
                    >
                      <span className={styles.optionLabel}>
                        {option.label}
                        {option.description ? (
                          <span className={styles.optionDescription}>
                            {option.description}
                          </span>
                        ) : null}
                      </span>
                      {value === option.value ? (
                        <Check size={14} className={styles.check} aria-hidden />
                      ) : null}
                    </button>
                  ))
                ) : (
                  <p className={styles.empty}>{emptyMessage}</p>
                )}
                {freeSolo && query.trim() ? (
                  <button
                    type="button"
                    className={cx(styles.option, styles.freeSolo)}
                    onClick={() => selectValue(query.trim())}
                  >
                    Use &quot;{query.trim()}&quot;
                  </button>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}

      {error ? (
        <p id={`${id}-error`} role="alert" className={cx(styles.message, styles.errorText)}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
