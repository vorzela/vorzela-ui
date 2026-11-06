import type { LabelHTMLAttributes, ReactNode } from 'react'
import { useId } from 'react'

import { cx } from '~/lib/cx'
import styles from './label.module.scss'

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
  hint?: string
  /** Optional id for the hint paragraph (for `aria-describedby`). */
  hintId?: string
  children?: ReactNode
}

/** Form label with a required marker and optional hint. */
export function Label({
  required,
  hint,
  hintId: hintIdProp,
  className,
  children,
  ...rest
}: LabelProps) {
  const generatedHintId = useId()
  const hintId = hintIdProp ?? (hint ? generatedHintId : undefined)

  return (
    <div className={styles.wrapper}>
      <label {...rest} className={cx(styles.label, className)}>
        {children}
        {required ? (
          <span className={styles.required} aria-hidden>
            *
          </span>
        ) : null}
        {required ? <span className={styles.srOnly}> (required)</span> : null}
      </label>
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
