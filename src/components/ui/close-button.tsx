import { X } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'

import { cx } from '~/lib/cx'
import styles from './close-button.module.scss'

export type CloseButtonSize = 'sm' | 'md' | 'lg'

const SIZE: Record<CloseButtonSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
}

export interface CloseButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  size?: CloseButtonSize
  label?: string
}

/** Compact close control for dialogs, sheets, toasts and banners. */
export function CloseButton({
  size = 'md',
  label = 'Close',
  className,
  onClick,
  ...props
}: CloseButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cx(styles.root, SIZE[size], className)}
      onClick={onClick}
      {...props}
    >
      <X aria-hidden />
    </button>
  )
}
