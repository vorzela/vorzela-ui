/**
 * components/ui/action-menu.tsx
 *
 * Compact, viewport-aware action menu for table rows and tight layouts.
 */
import * as React from 'react'

import { Portal } from '~/components/primitives/portal'
import { cx } from '~/lib/cx'
import styles from './action-menu.module.scss'

const MARGIN = 8
const GAP = 4

export interface ActionMenuItem {
  /** Unique key */
  key: string
  /** Display label */
  label: string
  /** Leading icon — any JSX (e.g. <Pencil size={14} />) */
  icon?: React.ReactNode
  /** Trailing content — badge, shortcut hint, etc. */
  trailing?: React.ReactNode
  /** Renders in red / danger colours */
  danger?: boolean
  /** Greys out and blocks interaction */
  disabled?: boolean
  /** Renders a thin divider above this item */
  divider?: boolean
  /** Section label rendered above this item (replaces divider when set) */
  sectionLabel?: string
  /** Called when the item is clicked */
  onSelect?: () => void
}

export interface ActionMenuProps {
  /** Menu items */
  items: ActionMenuItem[]
  /** Replace the default ⋯ trigger with your own element */
  trigger?: React.ReactNode
  /** Preferred horizontal alignment of the panel relative to the trigger */
  align?: 'left' | 'right'
  /** Close the menu when an item is selected (default: true) */
  closeOnSelect?: boolean
  /** Controlled open state */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Extra class on the trigger wrapper */
  className?: string
  /** Extra class on the panel */
  panelClass?: string
  /** Accessible label for the default trigger button */
  triggerLabel?: string
}

interface PanelPos {
  x: number
  y: number
  direction: 'bottom' | 'top'
}

function computePanelPos(
  trigger: HTMLElement,
  panel: HTMLElement,
  align: 'left' | 'right',
): PanelPos {
  const triggerRect = trigger.getBoundingClientRect()
  const panelWidth = panel.offsetWidth
  const panelHeight = panel.offsetHeight
  const vw = window.innerWidth
  const vh = window.innerHeight

  const spaceBelow = vh - triggerRect.bottom - MARGIN
  const spaceAbove = triggerRect.top - MARGIN
  const direction: 'bottom' | 'top' =
    spaceBelow >= panelHeight + GAP || spaceBelow >= spaceAbove
      ? 'bottom'
      : 'top'

  const y =
    direction === 'bottom'
      ? triggerRect.bottom + GAP
      : triggerRect.top - panelHeight - GAP

  let x: number
  if (align === 'right') {
    x = triggerRect.right - panelWidth
    if (x < MARGIN) x = MARGIN
  } else {
    x = triggerRect.left
    if (x + panelWidth > vw - MARGIN) x = vw - panelWidth - MARGIN
  }

  return { x, y, direction }
}

function DotsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden="true">
      <circle cx="3" cy="7.5" r="1.25" />
      <circle cx="7.5" cy="7.5" r="1.25" />
      <circle cx="12" cy="7.5" r="1.25" />
    </svg>
  )
}

export function ActionMenu({
  items,
  trigger,
  align = 'right',
  closeOnSelect = true,
  open: controlledOpen,
  onOpenChange,
  className,
  panelClass,
  triggerLabel = 'Open actions menu',
}: ActionMenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = React.useCallback(
    (value: boolean) => {
      setInternalOpen(value)
      onOpenChange?.(value)
    },
    [onOpenChange],
  )

  const triggerRef = React.useRef<HTMLDivElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const panelId = React.useId()

  const [pos, setPos] = React.useState<PanelPos>({
    x: 0,
    y: 0,
    direction: 'bottom',
  })
  const [posReady, setPosReady] = React.useState(false)

  const recompute = React.useCallback(() => {
    const wrapper = triggerRef.current
    if (!wrapper || !panelRef.current) return
    const trigger =
      wrapper.querySelector<HTMLElement>('button, a, [role="button"]') ?? wrapper
    setPos(computePanelPos(trigger, panelRef.current, align))
    setPosReady(true)
  }, [align])

  React.useLayoutEffect(() => {
    if (!isOpen) {
      setPosReady(false)
      return
    }
    recompute()
  }, [isOpen, recompute])

  React.useEffect(() => {
    if (!isOpen) return
    const handler = () => recompute()
    window.addEventListener('scroll', handler, { passive: true, capture: true })
    window.addEventListener('resize', handler, { passive: true })
    return () => {
      window.removeEventListener('scroll', handler, { capture: true })
      window.removeEventListener('resize', handler)
    }
  }, [isOpen, recompute])

  React.useEffect(() => {
    if (!isOpen) return
    const handler = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 0)
    return () => {
      clearTimeout(id)
      document.removeEventListener('mousedown', handler)
    }
  }, [isOpen, setOpen])

  React.useEffect(() => {
    if (!isOpen) return

    const focusableItems = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          '[role="menuitem"]:not([disabled])',
        ) ?? [],
      )

    const onKeyDown = (event: KeyboardEvent) => {
      const items = focusableItems()
      const index = items.indexOf(document.activeElement as HTMLElement)

      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        triggerRef.current
          ?.querySelector<HTMLElement>('button, a, [tabindex]')
          ?.focus()
        return
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        items[(index + 1) % items.length]?.focus()
        return
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        items[(index - 1 + items.length) % items.length]?.focus()
        return
      }
      if (event.key === 'Tab') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const frame = requestAnimationFrame(() => focusableItems()[0]?.focus())
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, setOpen])

  const handleSelect = (item: ActionMenuItem) => {
    if (item.disabled) return
    item.onSelect?.()
    if (closeOnSelect) setOpen(false)
  }

  return (
    <>
      <div
        ref={triggerRef}
        className={cx(styles.wrap, className)}
        onClick={(event) => {
          if (!trigger) return
          event.stopPropagation()
          setOpen(!isOpen)
        }}
      >
        {trigger ?? (
          <button
            type="button"
            aria-label={triggerLabel}
            aria-haspopup="menu"
            aria-expanded={isOpen}
            aria-controls={isOpen ? panelId : undefined}
            onClick={(event) => {
              event.stopPropagation()
              setOpen(!isOpen)
            }}
            className={cx(styles.trigger, isOpen && styles.triggerOpen)}
          >
            <DotsIcon />
          </button>
        )}
      </div>

      {isOpen ? (
        <Portal>
          <div
            ref={panelRef}
            id={panelId}
            role="menu"
            aria-label={triggerLabel}
            aria-orientation="vertical"
            data-dir={pos.direction}
            className={cx(styles.panel, panelClass)}
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              visibility: posReady ? 'visible' : 'hidden',
            }}
          >
            {items.map((item) => (
              <React.Fragment key={item.key}>
                {item.sectionLabel ? (
                  <p className={styles.sectionLabel}>{item.sectionLabel}</p>
                ) : null}

                {item.divider && !item.sectionLabel ? (
                  <div className={styles.divider} role="separator" />
                ) : null}

                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  className={cx(styles.item, item.danger && styles.itemDanger)}
                  onClick={() => handleSelect(item)}
                >
                  {item.icon ? (
                    <span className={styles.itemIcon}>{item.icon}</span>
                  ) : (
                    <span className={cx(styles.itemIcon, styles.itemIconEmpty)} />
                  )}

                  <span className={styles.itemLabel}>{item.label}</span>

                  {item.trailing ? (
                    <span className={styles.itemTrailing}>{item.trailing}</span>
                  ) : null}
                </button>
              </React.Fragment>
            ))}
          </div>
        </Portal>
      ) : null}
    </>
  )
}
