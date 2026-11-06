import * as React from 'react'

import { cx } from '~/lib/cx'
import { Toggle, type ToggleSize, type ToggleVariant } from './toggle'
import styles from './toggle-group.module.scss'

interface ToggleGroupContextValue {
  variant?: ToggleVariant
  size?: ToggleSize
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  variant: 'default',
  size: 'default',
})

export interface ToggleGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple'
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  variant?: ToggleVariant
  size?: ToggleSize
}

export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  function ToggleGroup(
    {
      className,
      variant,
      size,
      children,
      type = 'single',
      value: valueProp,
      defaultValue,
      onValueChange,
      ...props
    },
    ref,
  ) {
    const [uncontrolled, setUncontrolled] = React.useState<string | string[]>(
      defaultValue ?? (type === 'single' ? '' : []),
    )
    const value = valueProp !== undefined ? valueProp : uncontrolled

    const handleChange = (itemValue: string) => {
      if (type === 'single') {
        const next = (value as string) === itemValue ? '' : itemValue
        if (valueProp === undefined) setUncontrolled(next)
        onValueChange?.(next)
        return
      }

      const current = Array.isArray(value) ? value : []
      const next = current.includes(itemValue)
        ? current.filter((entry) => entry !== itemValue)
        : [...current, itemValue]
      if (valueProp === undefined) setUncontrolled(next)
      onValueChange?.(next)
    }

    return (
      <ToggleGroupContext.Provider value={{ variant, size }}>
        <div
          ref={ref}
          className={cx(styles.root, className)}
          role="group"
          {...props}
        >
          {React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) return child

            const item = child as React.ReactElement<ToggleGroupItemProps>
            const itemValue = item.props.value

            return React.cloneElement(item, {
              onPressedChange: (pressed: boolean) => {
                if (pressed) handleChange(itemValue)
                else if (type === 'multiple') handleChange(itemValue)
              },
              pressed:
                type === 'single'
                  ? (value as string) === itemValue
                  : Array.isArray(value)
                    ? value.includes(itemValue)
                    : false,
            })
          })}
        </div>
      </ToggleGroupContext.Provider>
    )
  },
)

ToggleGroup.displayName = 'ToggleGroup'

export interface ToggleGroupItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  variant?: ToggleVariant
  size?: ToggleSize
}

export const ToggleGroupItem = React.forwardRef<
  HTMLButtonElement,
  ToggleGroupItemProps
>(function ToggleGroupItem(
  { className, children, variant, size, ...props },
  ref,
) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <Toggle
      ref={ref}
      className={cx(styles.item, className)}
      variant={context.variant ?? variant}
      size={context.size ?? size}
      {...props}
    >
      {children}
    </Toggle>
  )
})

ToggleGroupItem.displayName = 'ToggleGroupItem'
