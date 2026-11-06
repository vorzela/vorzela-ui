import type { ChangeEvent, KeyboardEvent } from 'react'
import { useId, useMemo, useRef, useState } from 'react'

import { cx } from '~/lib/cx'

import styles from './mentions.module.scss'

export type MentionSuggestion = {
  id: string
  label: string
  description?: string
  avatar?: string
}

export interface MentionsProps {
  suggestions: MentionSuggestion[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onSelect?: (suggestion: MentionSuggestion) => void
  label?: string
  placeholder?: string
  hint?: string
  rows?: number
  maxLength?: number
  disabled?: boolean
  trigger?: string
  className?: string
  id?: string
  name?: string
  'aria-label'?: string
}

type MentionQuery = {
  start: number
  end: number
  query: string
}

/** Textarea with inline @mention suggestions. */
export function Mentions({
  suggestions,
  value,
  defaultValue = '',
  onChange,
  onSelect,
  label,
  placeholder = 'Write a comment…',
  hint,
  rows = 4,
  maxLength,
  disabled = false,
  trigger = '@',
  className,
  id,
  name,
  'aria-label': ariaLabel,
}: MentionsProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const listId = `${inputId}-suggestions`
  const ref = useRef<HTMLTextAreaElement>(null)
  const [internal, setInternal] = useState(defaultValue)
  const [query, setQuery] = useState<MentionQuery | null>(null)
  const [active, setActive] = useState(0)
  const text = value ?? internal

  const matches = useMemo(() => {
    if (!query) return []
    const value = query.query.toLowerCase()
    return suggestions
      .filter((item) => item.label.toLowerCase().includes(value))
      .slice(0, 6)
  }, [query, suggestions])

  const setText = (next: string) => {
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }

  const detect = (next: string, caret: number): MentionQuery | null => {
    const before = next.slice(0, caret)
    const start = before.lastIndexOf(trigger)
    if (start === -1) return null
    const fragment = before.slice(start + trigger.length)
    if (/[\s\n]/.test(fragment)) return null
    return { start, end: caret, query: fragment }
  }

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const next = event.target.value
    setText(next)
    setQuery(detect(next, event.target.selectionStart ?? next.length))
    setActive(0)
  }

  const select = (suggestion: MentionSuggestion) => {
    if (!query) return
    const before = text.slice(0, query.start)
    const after = text.slice(query.end)
    const next = `${before}${trigger}${suggestion.label} ${after}`
    setText(next)
    setQuery(null)
    onSelect?.(suggestion)
    requestAnimationFrame(() => {
      const caret = before.length + trigger.length + suggestion.label.length + 1
      ref.current?.focus()
      ref.current?.setSelectionRange(caret, caret)
    })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!query || matches.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((current) => (current + 1) % matches.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((current) => (current - 1 + matches.length) % matches.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const suggestion = matches[active]
      if (suggestion) select(suggestion)
    } else if (event.key === 'Escape') {
      setQuery(null)
    }
  }

  return (
    <div className={cx(styles.root, className)}>
      {label ? (
        <label htmlFor={inputId} className={styles.label}>{label}</label>
      ) : null}
      <div className={styles.wrap}>
        <textarea
          ref={ref}
          id={inputId}
          name={name}
          rows={rows}
          value={text}
          disabled={disabled}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-label={ariaLabel ?? label}
          aria-autocomplete="list"
          aria-controls={query && matches.length ? listId : undefined}
          aria-expanded={Boolean(query && matches.length)}
          aria-activedescendant={
            query && matches[active] ? `${listId}-${matches[active].id}` : undefined
          }
          className={styles.textarea}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => window.setTimeout(() => setQuery(null), 120)}
        />
        {query ? (
          <ul id={listId} role="listbox" className={styles.panel}>
            {matches.length === 0 ? (
              <li className={styles.empty}>No matches</li>
            ) : (
              matches.map((suggestion, index) => (
                <li
                  key={suggestion.id}
                  id={`${listId}-${suggestion.id}`}
                  role="option"
                  aria-selected={index === active}
                  className={cx(styles.option, index === active && styles.active)}
                  onMouseDown={(event) => {
                    event.preventDefault()
                    select(suggestion)
                  }}
                  onMouseEnter={() => setActive(index)}
                >
                  <span className={styles.avatar} aria-hidden>
                    {suggestion.avatar ? (
                      <img src={suggestion.avatar} alt="" />
                    ) : (
                      suggestion.label.slice(0, 1)
                    )}
                  </span>
                  <span className={styles.body}>
                    <span className={styles.name}>{suggestion.label}</span>
                    {suggestion.description ? (
                      <span className={styles.description}>{suggestion.description}</span>
                    ) : null}
                  </span>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
      <div className={styles.hint}>
        {hint ? <span>{hint}</span> : <span />}
        {maxLength ? <span className={styles.counter}>{text.length}/{maxLength}</span> : null}
      </div>
    </div>
  )
}
