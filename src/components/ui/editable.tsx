import { Pencil } from 'lucide-react'
import * as React from 'react'

import { cx } from '~/lib/cx'
import styles from './editable.module.scss'

export interface EditableProps {
  value?: string
  defaultValue?: string
  onSave?: (value: string) => void
  label?: string
  placeholder?: string
  className?: string
  id?: string
}

/** Click-to-edit text. Enter saves, Escape cancels, blur saves. */
export function Editable({
  value: valueProp,
  defaultValue = '',
  onSave,
  label = 'Value',
  placeholder = 'Click to edit',
  className,
  id,
}: EditableProps) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(valueProp ?? uncontrolled)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const value = valueProp ?? uncontrolled

  React.useEffect(() => {
    if (!editing) setDraft(value)
  }, [editing, value])

  React.useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const commit = () => {
    setEditing(false)
    if (draft !== value) {
      if (valueProp === undefined) setUncontrolled(draft)
      onSave?.(draft)
    }
  }

  return (
    <div className={cx(styles.root, className)}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      {editing ? (
        <input
          ref={inputRef}
          id={inputId}
          className={styles.input}
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commit()
            }
            if (event.key === 'Escape') {
              event.preventDefault()
              setDraft(value)
              setEditing(false)
            }
          }}
        />
      ) : (
        <button
          type="button"
          id={inputId}
          className={styles.trigger}
          onClick={() => setEditing(true)}
        >
          <span className={cx(styles.value, !value && styles.placeholder)}>
            {value || placeholder}
          </span>
          <span className={styles.pencil}>
            <Pencil aria-hidden />
          </span>
        </button>
      )}
    </div>
  )
}
