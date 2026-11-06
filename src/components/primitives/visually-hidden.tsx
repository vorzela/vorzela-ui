import * as React from 'react'

import { cx } from '~/lib/cx'
import styles from './primitives.module.scss'

/** Screen-reader-only content. */
export function VisuallyHidden({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return <span className={cx(styles.sr, className)} {...props} />
}
