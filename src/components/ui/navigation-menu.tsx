import { ChevronDown } from 'lucide-react'
import * as React from 'react'

import { cx } from '~/lib/cx'
import styles from './navigation-menu.module.scss'

interface NavigationMenuContextValue {
  value: string
  setValue: (value: string) => void
  baseId: string
}

const NavigationMenuContext =
  React.createContext<NavigationMenuContextValue | null>(null)

function useNavigationMenu(component: string): NavigationMenuContextValue {
  const context = React.useContext(NavigationMenuContext)
  if (!context) {
    throw new Error(
      `<${component}> must be rendered inside <NavigationMenu>.`,
    )
  }
  return context
}

export interface NavigationMenuProps
  extends React.HTMLAttributes<HTMLElement> {}

export function NavigationMenu({
  className,
  children,
  ...props
}: NavigationMenuProps) {
  const [value, setValue] = React.useState('')
  const baseId = React.useId()
  const rootRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    if (!value) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setValue('')
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      const trigger = rootRef.current?.querySelector<HTMLElement>(
        '[data-nav-item][data-state="open"] [data-nav-trigger]',
      )
      setValue('')
      trigger?.focus()
    }

    document.addEventListener('pointerdown', handlePointerDown, true)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [value])

  const context = React.useMemo<NavigationMenuContextValue>(
    () => ({ value, setValue, baseId }),
    [value, baseId],
  )

  return (
    <NavigationMenuContext.Provider value={context}>
      <nav
        {...props}
        ref={rootRef}
        data-navigation-menu
        className={cx(styles.root, className)}
      >
        {children}
      </nav>
    </NavigationMenuContext.Provider>
  )
}

export interface NavigationMenuListProps
  extends React.HTMLAttributes<HTMLUListElement> {}

export function NavigationMenuList({
  className,
  children,
  ...props
}: NavigationMenuListProps) {
  return (
    <ul className={cx(styles.list, className)} {...props}>
      {children}
    </ul>
  )
}

export interface NavigationMenuItemProps
  extends React.LiHTMLAttributes<HTMLLIElement> {
  value?: string
}

export function NavigationMenuItem({
  value,
  className,
  children,
  onMouseEnter,
  onMouseLeave,
  ...props
}: NavigationMenuItemProps) {
  const context = useNavigationMenu('NavigationMenuItem')
  const generatedValue = React.useId()
  const itemValue = value ?? generatedValue
  const isOpen = context.value === itemValue

  return (
    <li
      {...props}
      className={cx(styles.item, className)}
      data-nav-item
      data-value={itemValue}
      data-state={isOpen ? 'open' : 'closed'}
      onMouseEnter={(event) => {
        onMouseEnter?.(event)
        if (!event.defaultPrevented) context.setValue(itemValue)
      }}
      onMouseLeave={(event) => {
        onMouseLeave?.(event)
        if (!event.defaultPrevented) context.setValue('')
      }}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ __navValue?: string }>,
              { __navValue: itemValue },
            )
          : child,
      )}
    </li>
  )
}

export interface NavigationMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  __navValue?: string
}

export function NavigationMenuTrigger({
  className,
  children,
  __navValue,
  onClick,
  onKeyDown,
  ...props
}: NavigationMenuTriggerProps) {
  const context = useNavigationMenu('NavigationMenuTrigger')
  const isOpen = Boolean(__navValue) && context.value === __navValue

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return

    if (event.key === 'Escape') {
      if (!isOpen) return
      event.preventDefault()
      context.setValue('')
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!isOpen) context.setValue(__navValue ?? '')

      const item = event.currentTarget.closest('[data-nav-item]')
      requestAnimationFrame(() => {
        item
          ?.querySelector<HTMLElement>('[data-nav-content]')
          ?.querySelector<HTMLElement>('a[href], button:not([disabled])')
          ?.focus()
      })
      return
    }

    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End']
    if (!keys.includes(event.key)) return

    const triggers = Array.from(
      event.currentTarget
        .closest('[data-navigation-menu]')
        ?.querySelectorAll<HTMLButtonElement>('[data-nav-trigger]') ?? [],
    )
    if (triggers.length === 0) return

    event.preventDefault()
    const current = triggers.indexOf(event.currentTarget)
    let next = current

    if (event.key === 'ArrowRight') next = (current + 1) % triggers.length
    if (event.key === 'ArrowLeft')
      next = (current - 1 + triggers.length) % triggers.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = triggers.length - 1

    const target = triggers[next]
    target?.focus()

    if (context.value) {
      const targetValue = target
        ?.closest('[data-nav-item]')
        ?.getAttribute('data-value')
      context.setValue(targetValue ?? '')
    }
  }

  return (
    <button
      type="button"
      {...props}
      className={cx(styles.trigger, className)}
      data-nav-trigger
      aria-expanded={isOpen}
      aria-controls={
        __navValue ? `${context.baseId}-${__navValue}-content` : undefined
      }
      data-state={isOpen ? 'open' : 'closed'}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        context.setValue(isOpen ? '' : (__navValue ?? ''))
      }}
      onKeyDown={handleKeyDown}
    >
      {children}
      <ChevronDown className={styles.chevron} aria-hidden />
    </button>
  )
}

export interface NavigationMenuContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  __navValue?: string
}

export function NavigationMenuContent({
  className,
  children,
  __navValue,
  onKeyDown,
  ...props
}: NavigationMenuContentProps) {
  const context = useNavigationMenu('NavigationMenuContent')
  const isOpen = Boolean(__navValue) && context.value === __navValue

  if (!isOpen) return null

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return

    if (event.key === 'Escape') {
      event.preventDefault()
      context.setValue('')
      event.currentTarget
        .closest('[data-nav-item]')
        ?.querySelector<HTMLElement>('[data-nav-trigger]')
        ?.focus()
      return
    }

    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End']
    if (!keys.includes(event.key)) return

    const links = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      ),
    )
    if (links.length === 0) return

    event.preventDefault()
    const current = links.indexOf(event.target as HTMLElement)
    let next = current

    if (event.key === 'ArrowDown') next = (current + 1) % links.length
    if (event.key === 'ArrowUp')
      next = (current - 1 + links.length) % links.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = links.length - 1

    links[next]?.focus()
  }

  return (
    <div
      {...props}
      id={__navValue ? `${context.baseId}-${__navValue}-content` : undefined}
      data-nav-content
      className={cx(styles.content, className)}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.contentPanel}>{children}</div>
    </div>
  )
}

export interface NavigationMenuLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

export function NavigationMenuLink({
  className,
  children,
  ...props
}: NavigationMenuLinkProps) {
  return (
    <a {...props} className={cx(styles.link, className)}>
      {children}
    </a>
  )
}

export interface NavigationMenuViewportProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function NavigationMenuViewport({
  className,
  ...props
}: NavigationMenuViewportProps) {
  const { value } = useNavigationMenu('NavigationMenuViewport')

  return (
    <div
      {...props}
      className={cx(styles.viewport, className)}
      data-state={value ? 'open' : 'closed'}
    >
      <div className={styles.viewportInner} />
    </div>
  )
}

export interface NavigationMenuIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function NavigationMenuIndicator({
  className,
  ...props
}: NavigationMenuIndicatorProps) {
  const { value } = useNavigationMenu('NavigationMenuIndicator')

  return (
    <div
      {...props}
      className={cx(styles.indicator, className)}
      data-state={value ? 'visible' : 'hidden'}
    >
      <div className={styles.indicatorArrow} />
    </div>
  )
}
