/**
 * components/ui/context-menu.tsx
 *
 * Context menu triggered by right-click (or the Menu key / Shift+F10).
 */
import * as React from 'react'

import { Portal } from '~/components/primitives/portal'
import { cx } from '~/lib/cx'
import styles from './context-menu.module.scss'

export interface ContextMenuItem {
  key: string
  label: string
  icon?: React.ReactNode
  danger?: boolean
  disabled?: boolean
  divider?: boolean
  onSelect?: () => void
}

export interface ContextMenuProps {
  items?: ContextMenuItem[]
  children?: React.ReactNode
  className?: string
}

export function ContextMenu({ items, children, className }: ContextMenuProps) {
  const [open, setOpen] = React.useState(false)
  const [pos, setPos] = React.useState({ x: 0, y: 0 })
  const contentId = React.useId()
  const panelRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const handler = (event: PointerEvent) => {
      const target = event.target as Node
      if (panelRef.current?.contains(target)) return
      setOpen(false)
    }
    const id = setTimeout(
      () => document.addEventListener('pointerdown', handler),
      0,
    )
    return () => {
      clearTimeout(id)
      document.removeEventListener('pointerdown', handler)
    }
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const handler = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      setOpen(false)
    }
    document.addEventListener('keydown', handler, { capture: true })
    return () =>
      document.removeEventListener('keydown', handler, { capture: true })
  }, [open])

  // Clamp the portal panel to the viewport once its real size is known.
  React.useLayoutEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return
    const rect = panel.getBoundingClientRect()
    const maxX = window.innerWidth - rect.width - 8
    const maxY = window.innerHeight - rect.height - 8
    setPos((current) => {
      const x = Math.max(8, Math.min(current.x, maxX))
      const y = Math.max(8, Math.min(current.y, maxY))
      return x === current.x && y === current.y ? current : { x, y }
    })
  }, [open])

  // Keyboard users open the menu with Shift+F10 / the Menu key; move focus into it.
  React.useLayoutEffect(() => {
    if (!open) return
    panelRef.current
      ?.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')
      ?.focus()
  }, [open])

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const width = 200
    const height = 240
    setPos({
      x: Math.min(event.clientX, vw - width - 8),
      y: Math.min(event.clientY, vh - height - 8),
    })
    setOpen(true)
  }

  return (
    <>
      <div
        className={cx(styles.root, className)}
        onContextMenu={handleContextMenu}
        onKeyDown={(event) => {
          if (
            event.key !== 'ContextMenu' &&
            !(event.shiftKey && event.key === 'F10')
          ) {
            return
          }
          event.preventDefault()
          const rect = event.currentTarget.getBoundingClientRect()
          setPos({ x: rect.left + 8, y: rect.top + 8 })
          setOpen(true)
        }}
      >
        {children}
      </div>

      {open ? (
        <Portal>
          <div
            ref={panelRef}
            id={contentId}
            role="menu"
            aria-label="Context menu"
            style={{ top: pos.y, left: pos.x }}
            className={styles.panel}
          >
            {items?.map((item) => (
              <React.Fragment key={item.key}>
                {item.divider ? (
                  <div className={styles.divider} role="separator" />
                ) : null}

                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  className={cx(styles.item, item.danger && styles.itemDanger)}
                  onClick={() => {
                    if (item.disabled) return
                    item.onSelect?.()
                    setOpen(false)
                  }}
                >
                  {item.icon ? (
                    <span className={styles.itemIcon}>{item.icon}</span>
                  ) : (
                    <span className={cx(styles.itemIcon, styles.itemIconEmpty)} />
                  )}
                  {item.label}
                </button>
              </React.Fragment>
            ))}
          </div>
        </Portal>
      ) : null}
    </>
  )
}

export interface ContextMenuTriggerProps {
  children: React.ReactElement
}

export function ContextMenuTrigger({ children }: ContextMenuTriggerProps) {
  return React.cloneElement(children)
}
