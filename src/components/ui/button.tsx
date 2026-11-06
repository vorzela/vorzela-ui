import * as React from 'react'

import { cx } from '~/lib/cx'
import styles from './button.module.scss'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'link'

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const VARIANT: Record<ButtonVariant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  outline: styles.outline,
  ghost: styles.ghost,
  destructive: styles.destructive,
  link: styles.link,
}

const SIZE: Record<ButtonSize, string> = {
  sm: styles.sm,
  md: '',
  lg: styles.lg,
  icon: styles.icon,
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cx(styles.root, VARIANT[variant], SIZE[size], className)}
      {...props}
    />
  ),
)

Button.displayName = 'Button'
