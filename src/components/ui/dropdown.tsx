/**
 * components/ui/dropdown.tsx
 *
 * Viewport-aware dropdown menu.
 */
import * as React from 'react'

import { Portal } from '~/components/primitives/portal'
import { cx } from '~/lib/cx'
import styles from './dropdown.module.scss'

const VIEWPORT_MARGIN = 8

export interface DropdownItem {
  key: string
  label: string
  icon?: React.ReactNode
  danger?: boolean
  disabled?: boolean
  divider?: boolean
  onSelect?: () => void
}

interface PanelPos {
  top: number
  left: number
  minW: number
}

function computePosition(
  triggerEl: HTMLElement,
  panelWidth: number,
  panelHeight: number,
  alignPref: 'left' | 'right',
): PanelPos {
  const rect = triggerEl.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight
  const margin = VIEWPORT_MARGIN
  const gap = 4

  const spaceBelow = vh - rect.bottom - margin
  const spaceAbove = rect.top - margin
  const openUpward =
    spaceBelow < panelHeight + gap && spaceAbove > spaceBelow

  const idealLeft =
    alignPref === 'right' ? rect.right - panelWidth : rect.left
  const left = Math.max(
    margin,
    Math.min(idealLeft, vw - panelWidth - margin),
  )
  const idealTop = openUpward
    ? rect.top - panelHeight - gap
    : rect.bottom + gap
  const top = Math.max(
    margin,
    Math.min(idealTop, vh - panelHeight - margin),
  )

  return { top, left, minW: Math.max(rect.width, 160) }
}

export interface DropdownProps {
  trigger: React.ReactNode
  items?: DropdownItem[]
  children?: React.ReactNode
  width?: string | number
  closeOnSelect?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  align?: 'left' | 'right'
}

export function Dropdown({
  trigger,
  items,
  children,
  width,
  closeOnSelect = true,
  open: controlledOpen,
  onOpenChange,
  className,
  align = 'left',
}: DropdownProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const [pos, setPos] = React.useState<PanelPos>({
    top: 0,
    left: 0,
    minW: 160,
  })
  const [posReady, setPosReady] = React.useState(false)

  const triggerRef = React.useRef<HTMLDivElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)

  const setOpen = React.useCallback(
    (value: boolean) => {
      setInternalOpen(value)
      onOpenChange?.(value)
    },
    [onOpenChange],
  )

  const recompute = React.useCallback(() => {
    if (!triggerRef.current) return
    const panelWidth =
      panelRef.current?.offsetWidth ??
      (typeof width === 'number' ? width : 200)
    const panelHeight = panelRef.current?.offsetHeight ?? 280
    setPos(computePosition(triggerRef.current, panelWidth, panelHeight, align))
    setPosReady(true)
  }, [width, align])

  React.useEffect(() => {
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
    const handler = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      setOpen(false)
      const el = triggerRef.current?.querySelector<HTMLElement>(
        'button, a, [tabindex]',
      )
      el?.focus()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, setOpen])

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return
    item.onSelect?.()
    if (closeOnSelect) setOpen(false)
  }

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${pos.top}px`,
    left: `${pos.left}px`,
    minWidth: `${pos.minW}px`,
    visibility: posReady ? 'visible' : 'hidden',
    ...(width !== undefined && {
      width: typeof width === 'number' ? `${width}px` : width,
    }),
  }

  return (
    <>
      <div
        ref={triggerRef}
        className={styles.trigger}
        onClick={() => setOpen(!isOpen)}
      >
        {trigger}
      </div>

      {isOpen ? (
        <Portal>
          <div
            ref={panelRef}
            role="menu"
            aria-orientation="vertical"
            style={panelStyle}
            className={cx(styles.panel, className)}
          >
            {items
              ? items.map((item) => (
                  <React.Fragment key={item.key}>
                    {item.divider ? (
                      <div
                        className={styles.divider}
                        role="separator"
                      />
                    ) : null}
                    <DropdownRow
                      item={item}
                      onClick={() => handleItemClick(item)}
                    />
                  </React.Fragment>
                ))
              : children}
          </div>
        </Portal>
      ) : null}
    </>
  )
}

function DropdownRow({
  item,
  onClick,
}: {
  item: DropdownItem
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={item.disabled}
      className={cx(styles.item, item.danger && styles.itemDanger)}
      onClick={onClick}
    >
      {item.icon ? <span className={styles.itemIcon}>{item.icon}</span> : null}
      {item.label}
    </button>
  )
}

export interface DropdownMenuItemProps {
  icon?: React.ReactNode
  danger?: boolean
  disabled?: boolean
  divider?: boolean
  onClick?: () => void
  children?: React.ReactNode
  className?: string
}

export function DropdownMenuItem({
  icon,
  danger,
  disabled,
  divider,
  onClick,
  children,
  className,
}: DropdownMenuItemProps) {
  return (
    <>
      {divider ? (
        <div className={styles.divider} role="separator" />
      ) : null}

      <button
        type="button"
        role="menuitem"
        disabled={disabled}
        className={cx(styles.item, danger && styles.itemDanger, className)}
        onClick={onClick}
      >
        {icon ? (
          <span className={styles.itemIcon}>{icon}</span>
        ) : (
          <span className={cx(styles.itemIcon, styles.itemIconEmpty)} />
        )}
        {children}
      </button>
    </>
  )
}

export function DropdownLabel({ children }: { children: React.ReactNode }) {
  return <p className={styles.label}>{children}</p>
}
