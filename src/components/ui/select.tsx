import { Check, ChevronDown, Search } from 'lucide-react'
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from 'react'
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
import styles from './select.module.scss'

export interface SelectOption {
  value: string
  label: string
  description?: string
}

export interface SelectProps {
  options: SelectOption[]
  /** Controlled value. Omit (with optional `defaultValue`) for uncontrolled. */
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  searchable?: boolean
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  wrapClassName?: string
  className?: string
  id?: string
  leadingNode?: ReactNode
  /** Visual treatment of the trigger. */
  appearance?: 'default' | 'outlined' | 'filled'
}

export function Select({
  options,
  value: valueProp,
  defaultValue = '',
  onChange,
  onBlur,
  placeholder = 'Select…',
  searchable,
  label,
  hint,
  error,
  required,
  disabled,
  wrapClassName,
  className,
  id: idProp,
  leadingNode,
  appearance = 'default',
}: SelectProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const isControlled = valueProp !== undefined
  const [uncontrolled, setUncontrolled] = useState(defaultValue)
  const value = isControlled ? valueProp : uncontrolled

  const mounted = useMounted()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [dropUp, setDropUp] = useState(false)
  const [pos, setPos] = useState({ left: 0, top: 0, bottom: 0, width: 0 })
  const [activeIdx, setActiveIdx] = useState(-1)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selectedOption = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  )
  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q || !searchable) return options
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q) ||
        (o.description?.toLowerCase().includes(q) ?? false),
    )
  }, [options, search, searchable])

  const measureAndOpen = useCallback(() => {
    if (!triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - r.bottom
    const spaceAbove = r.top
    setDropUp(spaceBelow < 280 && spaceAbove > spaceBelow)
    setPos({ left: r.left, top: r.bottom, bottom: r.top, width: r.width })
  }, [])

  function openDropdown() {
    if (disabled) return
    measureAndOpen()
    setActiveIdx(-1)
    setOpen(true)
  }

  const close = useCallback(
    (returnFocus = true) => {
      const wasOpen = open
      setOpen(false)
      setSearch('')
      setActiveIdx(-1)
      if (returnFocus) triggerRef.current?.focus({ preventScroll: true })
      // Forms listen for blur after a value is committed / panel dismissed.
      if (wasOpen) queueMicrotask(() => onBlur?.())
    },
    [onBlur, open],
  )

  function selectValue(nextValue: string) {
    if (!isControlled) setUncontrolled(nextValue)
    if (value !== nextValue) onChange?.(nextValue)
    close()
  }

  function toggle() {
    if (open) close()
    else openDropdown()
  }

  useEffect(() => {
    if (!open) return
    if (searchable) {
      queueMicrotask(() => searchRef.current?.focus({ preventScroll: true }))
    } else {
      queueMicrotask(() => listRef.current?.focus({ preventScroll: true }))
    }
  }, [open, searchable])

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
      close(false)
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [close, open])

  useEffect(() => {
    if (!open) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        close()
      }
    }
    document.addEventListener('keydown', handler, { capture: true })
    return () => document.removeEventListener('keydown', handler, { capture: true })
  }, [close, open])

  useEffect(() => {
    if (!open) return
    const update = () => measureAndOpen()
    window.addEventListener('scroll', update, { passive: true, capture: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update, { capture: true })
      window.removeEventListener('resize', update)
    }
  }, [open, measureAndOpen])

  useEffect(() => {
    if (activeIdx < 0 || !listRef.current) return
    const el = listRef.current.children[activeIdx] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  function handleListKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, filteredOptions.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const opt = filteredOptions[activeIdx]
      if (opt) selectValue(opt.value)
    }
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) openDropdown()
    }
  }

  const panelStyle: CSSProperties = {
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
        disabled={disabled}
        onClick={toggle}
        onKeyDown={handleTriggerKeyDown}
        onBlur={() => {
          if (!open) onBlur?.()
        }}
        data-state={open ? 'open' : 'closed'}
        data-invalid={error ? 'true' : undefined}
        className={cx(
          styles.trigger,
          appearance === 'outlined' && styles.outlined,
          appearance === 'filled' && styles.filled,
          error && styles.invalid,
          open && !error && styles.open,
          leadingNode && styles.hasLeading,
          className,
        )}
      >
        {leadingNode ? (
          <span className={styles.leading}>{leadingNode}</span>
        ) : null}
        <span
          className={cx(
            styles.value,
            !selectedOption ? styles.placeholder : undefined,
          )}
        >
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          size={14}
          aria-hidden
          className={cx(styles.chevron, open && styles.chevronOpen)}
        />
      </button>

      {open && mounted
        ? createPortal(
            <div
              ref={panelRef}
              id={`${id}-listbox`}
              className={styles.panel}
              style={panelStyle}
            >
              {searchable ? (
                <div className={styles.searchWrap}>
                  <div className={styles.searchShell}>
                    <Search size={12} aria-hidden className={styles.searchIcon} />
                    <input
                      ref={searchRef}
                      type="text"
                      aria-label="Search options"
                      aria-controls={`${id}-listbox`}
                      aria-activedescendant={
                        activeIdx >= 0 ? `${id}-option-${activeIdx}` : undefined
                      }
                      autoComplete="off"
                      className={styles.searchInput}
                      placeholder="Search…"
                      value={search}
                      onChange={(event) => {
                        setSearch(event.currentTarget.value)
                        setActiveIdx(-1)
                      }}
                      onKeyDown={handleListKeyDown}
                    />
                  </div>
                </div>
              ) : null}

              <div
                ref={listRef}
                role="listbox"
                aria-label={label ?? 'Options'}
                aria-activedescendant={
                  activeIdx >= 0 ? `${id}-option-${activeIdx}` : undefined
                }
                tabIndex={searchable ? -1 : 0}
                className={styles.list}
                onKeyDown={handleListKeyDown}
              >
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option, i) => (
                    <button
                      key={option.value}
                      id={`${id}-option-${i}`}
                      type="button"
                      role="option"
                      aria-selected={value === option.value}
                      className={cx(
                        styles.option,
                        activeIdx === i && styles.optionActive,
                        value === option.value && styles.optionSelected,
                      )}
                      onClick={() => selectValue(option.value)}
                      onPointerEnter={() => setActiveIdx(i)}
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
                        <Check size={13} aria-hidden className={styles.check} />
                      ) : null}
                    </button>
                  ))
                ) : (
                  <p className={styles.empty}>No options found.</p>
                )}
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
