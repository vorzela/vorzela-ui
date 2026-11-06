import { X } from 'lucide-react'
import * as React from 'react'

import { useControllableState } from '~/hooks/use-controllable-state'
import { cx } from '~/lib/cx'
import styles from './tag-input.module.scss'

export interface TagInputProps {
  value?: string[]
  defaultValue?: string[]
  onChange?: (tags: string[]) => void
  label?: string
  placeholder?: string
  maxTags?: number
  disabled?: boolean
  className?: string
  id?: string
}

export function TagInput({
  value,
  defaultValue = [],
  onChange,
  label = 'Tags',
  placeholder = 'Add a tag…',
  maxTags = 12,
  disabled = false,
  className,
  id,
}: TagInputProps) {
  const [tags, setTags] = useControllableState<string[]>({
    value,
    defaultValue,
    onChange,
  })
  const [draft, setDraft] = React.useState('')
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const atLimit = tags.length >= maxTags

  const add = (raw: string) => {
    const next = raw.trim().replace(/,$/, '')
    if (!next) return
    if (tags.length >= maxTags) return
    if (tags.some((tag) => tag.toLowerCase() === next.toLowerCase())) {
      setDraft('')
      return
    }
    setTags([...tags, next])
    setDraft('')
  }

  const remove = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  return (
    <div className={cx(styles.root, className)}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>

      <div className={cx(styles.shell, disabled && styles.disabled)}>
        {tags.map((tag, index) => (
          <span key={`${tag}-${index}`} className={styles.chip}>
            {tag}
            <button
              type="button"
              onClick={() => remove(index)}
              disabled={disabled}
              aria-label={`Remove ${tag}`}
              className={styles.remove}
            >
              <X aria-hidden />
            </button>
          </span>
        ))}

        <input
          id={inputId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault()
              add(draft)
            } else if (event.key === 'Backspace' && !draft && tags.length) {
              remove(tags.length - 1)
            }
          }}
          onBlur={() => add(draft)}
          disabled={disabled || atLimit}
          placeholder={atLimit ? 'Tag limit reached' : placeholder}
          aria-describedby={`${inputId}-count`}
          className={styles.control}
        />
      </div>

      <p id={`${inputId}-count`} className={styles.count}>
        {tags.length} of {maxTags} tags
      </p>
    </div>
  )
}
