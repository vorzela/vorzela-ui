import * as React from 'react'

import { cx } from '~/lib/cx'
import styles from './toggle.module.scss'

export type ToggleVariant = 'default' | 'outline'
export type ToggleSize = 'default' | 'sm' | 'lg'

const VARIANT: Record<ToggleVariant, string> = {
  default: '',
  outline: styles.outline,
}

const SIZE: Record<ToggleSize, string> = {
  default: '',
  sm: styles.sm,
  lg: styles.lg,
}

export interface ToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  variant?: ToggleVariant
  size?: ToggleSize
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  function Toggle(
    {
      className,
      variant = 'default',
      size = 'default',
      pressed: pressedProp,
      defaultPressed = false,
      onPressedChange,
      onClick,
      ...props
    },
    ref,
  ) {
    const [uncontrolled, setUncontrolled] = React.useState(defaultPressed)
    const pressed = pressedProp !== undefined ? pressedProp : uncontrolled

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      if (event.defaultPrevented) return
      if (pressedProp === undefined) setUncontrolled((value) => !value)
      onPressedChange?.(!pressed)
    }

    return (
      <button
        ref={ref}
        type="button"
        data-state={pressed ? 'on' : 'off'}
        aria-pressed={pressed}
        className={cx(styles.root, VARIANT[variant], SIZE[size], className)}
        onClick={handleClick}
        {...props}
      />
    )
  },
)

Toggle.displayName = 'Toggle'
