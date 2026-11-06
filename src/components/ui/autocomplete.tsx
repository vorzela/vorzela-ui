/**
 * Async-aware autocomplete input.
 *
 * Keyboard accessible, portal-rendered, auto-flipping, debounced, and fully
 * controlled: the parent owns the async data source. Selected items are
 * rendered by the caller as chips if desired.
 */
import { Search, X } from 'lucide-react'
import type { ChangeEvent, CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { useMounted } from '~/hooks/use-mounted'
import { cx } from '~/lib/cx'

import { Label } from './label'
import styles from './autocomplete.module.scss'

export interface AutocompleteProps<T> {
  /** Current search text (controlled) */
  query: string
  /** Called on every keystroke with the raw input */
  onQueryChange: (q: string) => void
  /** Result items to display in the dropdown */
  items: T[]
  /** Called when the user picks an item */
  onSelect: (item: T) => void
  /** Extract the display label for an item */
  itemLabel: (item: T) => string
  /** Extract a unique string key for an item */
  itemValue: (item: T) => string
  /** Optional custom rendering for each dropdown row */
  renderItem?: (item: T) => ReactNode
  /** Show a loading spinner / message */
  loading?: boolean
  /** Minimum query length before showing the dropdown (default: 2) */
  minQuery?: number
  /** Debounce interval in ms — delay before onQueryChange fires */
  debounce?: number
  /** Placeholder inside the input */
  placeholder?: string
  /** Field label */
  label?: string
  /** Hint text below the label */
  hint?: string
  /** Required asterisk */
  required?: boolean
  /** Error text below the control */
  error?: string
  /** Disabled state */
  disabled?: boolean
  /** Empty-state message (default: "No results found") */
  emptyMessage?: string
  /** Additional class on the root wrapper */
  className?: string
}

const MAX_DROP_H = 280

export function Autocomplete<T>({
  query,
  onQueryChange,
  items,
  onSelect,
  itemLabel,
  itemValue,
  renderItem,
  loading,
  minQuery = 2,
  debounce: debounceMs = 0,
  placeholder,
  label,
  hint,
  required,
  error,
  disabled,
  emptyMessage,
  className,
}: AutocompleteProps<T>) {
  const id = useId()

  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const queryGenRef = useRef(0)

  const mounted = useMounted()
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [pos, setPos] = useState({ left: 0, top: 0, bottom: 0, width: 0 })
  const [dropUp, setDropUp] = useState(false)
  /** Local draft so debounced `onQueryChange` does not block typing. */
  const [draftState, setDraftState] = useState({ query, value: query })
  const draft = draftState.query === query ? draftState.value : query
  const setDraft = (value: string) => setDraftState({ query, value })

  useEffect(() => {
    return () => {
      clearTimeout(debounceTimerRef.current)
    }
  }, [])

  function measure() {
    if (!inputRef.current) return
    const r = inputRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - r.bottom
    const spaceAbove = r.top
    setDropUp(spaceBelow < MAX_DROP_H && spaceAbove > spaceBelow)
    setPos({ left: r.left, top: r.bottom, bottom: r.top, width: r.width })
  }

  useEffect(() => {
    if (!open) return
    const handler = () => measure()
    window.addEventListener('scroll', handler, { passive: true, capture: true })
    window.addEventListener('resize', handler, { passive: true })
    return () => {
      window.removeEventListener('scroll', handler, { capture: true })
      window.removeEventListener('resize', handler)
    }
  }, [open])

  function openPanel() {
    if (disabled) return
    measure()
    setActiveIdx(-1)
    setOpen(true)
  }

  function close(returnFocus = true) {
    setOpen(false)
    setActiveIdx(-1)
    if (returnFocus) inputRef.current?.focus({ preventScroll: true })
  }

  useEffect(() => {
    if (!open) return
    const handler = (event: PointerEvent) => {
      const target = event.target as Node
      if (
        inputRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return
      }
      close(false)
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [open])

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
  }, [open])

  function handleKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (!open) {
      if (event.key === 'ArrowDown' && draft.trim().length >= minQuery) {
        event.preventDefault()
        openPanel()
      }
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, items.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const item = items[activeIdx]
      if (item) {
        onSelect(item)
        close()
      }
    }
  }

  useEffect(() => {
    if (activeIdx < 0 || !panelRef.current) return
    const listEl = panelRef.current.querySelector('[role="listbox"]')
    const el = listEl?.children[activeIdx] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    const v = event.currentTarget.value
    setDraft(v)
    clearTimeout(debounceTimerRef.current)
    const gen = ++queryGenRef.current
    if (debounceMs > 0) {
      debounceTimerRef.current = setTimeout(() => {
        if (gen !== queryGenRef.current) return
        onQueryChange(v)
      }, debounceMs)
    } else {
      onQueryChange(v)
    }

    if (v.trim().length >= minQuery) {
      if (!open) openPanel()
      else measure()
    } else {
      setOpen(false)
    }
    setActiveIdx(-1)
  }

  const showPanel = open && draft.trim().length >= minQuery

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
    <div className={cx(styles.root, className)}>
      {label ? (
        <Label htmlFor={id} required={required} hint={hint} hintId={`${id}-hint`}>
          {label}
        </Label>
      ) : null}

      <div className={styles.field}>
        <Search size={14} aria-hidden className={styles.searchIcon} />
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showPanel}
          aria-haspopup="listbox"
          aria-controls={`${id}-listbox`}
          aria-activedescendant={
            showPanel && activeIdx >= 0 ? `${id}-option-${activeIdx}` : undefined
          }
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
              .filter(Boolean)
              .join(' ') || undefined
          }
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          value={draft}
          onChange={handleInput}
          onFocus={() => {
            if (draft.trim().length >= minQuery) openPanel()
          }}
          onKeyDown={handleKeyDown}
          className={cx(styles.input, error && styles.invalid)}
        />
        {draft.length > 0 && !disabled ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              queryGenRef.current += 1
              clearTimeout(debounceTimerRef.current)
              setDraft('')
              onQueryChange('')
              setOpen(false)
              inputRef.current?.focus()
            }}
            className={styles.clear}
          >
            <X size={14} aria-hidden />
          </button>
        ) : null}
      </div>

      {error ? (
        <p id={`${id}-error`} role="alert" className={cx(styles.message, styles.errorText)}>
          {error}
        </p>
      ) : null}

      {mounted
        ? createPortal(
            <div
              ref={panelRef}
              inert={!showPanel}
              className={cx(styles.panel, showPanel ? styles.panelOpen : styles.panelClosed)}
              style={panelStyle}
            >
              {loading ? (
                <p className={styles.loading}>Searching…</p>
              ) : null}

              {!loading && items.length === 0 ? (
                <p className={styles.empty}>{emptyMessage ?? 'No results found'}</p>
              ) : null}

              <div
                role="listbox"
                id={`${id}-listbox`}
                aria-label={label ?? 'Suggestions'}
                className={styles.list}
              >
                {items.map((item, i) => (
                  <button
                    key={itemValue(item)}
                    id={`${id}-option-${i}`}
                    type="button"
                    role="option"
                    aria-selected={activeIdx === i}
                    className={cx(styles.option, activeIdx === i && styles.optionActive)}
                    onClick={() => {
                      onSelect(item)
                      close()
                    }}
                    onPointerEnter={() => setActiveIdx(i)}
                  >
                    {renderItem ? (
                      renderItem(item)
                    ) : (
                      <span className={styles.optionLabel}>{itemLabel(item)}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
