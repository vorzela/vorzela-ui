import * as React from 'react'

import { cx } from '~/lib/cx'
import styles from './tabs.module.scss'

type Orientation = 'horizontal' | 'vertical'

interface TabsContextValue {
  value: string
  setValue: (next: string) => void
  baseId: string
  orientation: Orientation
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabs(component: string): TabsContextValue {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error(`<${component}> must be rendered inside <Tabs>.`)
  }
  return context
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: Orientation
}

export function Tabs({
  value: valueProp,
  defaultValue = '',
  onValueChange,
  orientation = 'horizontal',
  className,
  children,
  ...props
}: TabsProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const value = valueProp ?? uncontrolled
  const baseId = React.useId()

  const setValue = React.useCallback(
    (next: string) => {
      if (valueProp === undefined) setUncontrolled(next)
      onValueChange?.(next)
    },
    [valueProp, onValueChange],
  )

  const context = React.useMemo<TabsContextValue>(
    () => ({ value, setValue, baseId, orientation }),
    [value, setValue, baseId, orientation],
  )

  return (
    <TabsContext.Provider value={context}>
      <div
        className={cx(styles.root, className)}
        data-orientation={orientation}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  className,
  onKeyDown,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { orientation } = useTabs('TabsList')

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return

    const forward =
      orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown'
    const backward =
      orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp'
    const navigation = [forward, backward, 'Home', 'End']

    if (!navigation.includes(event.key)) return

    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]:not([disabled])',
      ),
    )
    if (tabs.length === 0) return

    event.preventDefault()

    const current = tabs.indexOf(event.target as HTMLButtonElement)
    let next = current

    if (event.key === forward) next = (current + 1) % tabs.length
    if (event.key === backward) next = (current - 1 + tabs.length) % tabs.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = tabs.length - 1

    tabs[next]?.focus()
    tabs[next]?.click()
  }

  return (
    <div
      role="tablist"
      aria-orientation={orientation}
      className={cx(styles.list, orientation === 'vertical' && styles.vertical, className)}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </div>
  )
}

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: TabsTriggerProps) {
  const tabs = useTabs('TabsTrigger')
  const selected = tabs.value === value

  return (
    <button
      {...props}
      type="button"
      role="tab"
      id={`${tabs.baseId}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${tabs.baseId}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      className={cx(styles.trigger, className)}
      onClick={(event) => {
        props.onClick?.(event)
        if (!event.defaultPrevented) tabs.setValue(value)
      }}
    >
      {children}
    </button>
  )
}

export interface TabsContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: TabsContentProps) {
  const tabs = useTabs('TabsContent')
  const selected = tabs.value === value

  return (
    <div
      role="tabpanel"
      id={`${tabs.baseId}-panel-${value}`}
      aria-labelledby={`${tabs.baseId}-tab-${value}`}
      tabIndex={0}
      hidden={!selected}
      className={cx(styles.content, className)}
      {...props}
    >
      {children}
    </div>
  )
}
