/**
 * components/ui/popover.tsx
 *
 * Viewport-aware popover. Focus-trapped, portal-rendered, and scroll/resize safe.
 */
import * as React from 'react'

import { Portal } from '~/components/primitives/portal'
import { cx } from '~/lib/cx'
import { trapFocus } from '~/lib/overlay'
import { mergeRefs } from '~/lib/refs'
import styles from './popover.module.scss'

export type PopoverAlign = 'start' | 'center' | 'end'
export type PopoverSide = 'top' | 'bottom' | 'left' | 'right'

interface PopoverContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement | null>
  contentId: string
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null)

function usePopover() {
  const context = React.useContext(PopoverContext)
  if (!context) {
    throw new Error('Popover components must be used within <Popover>')
  }
  return context
}

export interface PopoverProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Present for API parity; popovers are never modal. */
  modal?: boolean
  children?: React.ReactNode
}

export function Popover({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const contentId = React.useId()

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [controlledOpen, onOpenChange],
  )

  const context = React.useMemo<PopoverContextValue>(
    () => ({ open: isOpen, setOpen, triggerRef, contentId }),
    [isOpen, setOpen, contentId],
  )

  return (
    <PopoverContext.Provider value={context}>
      <div className={styles.wrapper}>{children}</div>
    </PopoverContext.Provider>
  )
}

type TriggerChildProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>
}

export interface PopoverTriggerProps {
  asChild?: boolean
  children: React.ReactElement
}

export function PopoverTrigger({
  asChild = true,
  children,
}: PopoverTriggerProps) {
  const { open, setOpen, triggerRef, contentId } = usePopover()
  const child = children as React.ReactElement<TriggerChildProps>

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    child.props.onClick?.(event)
    if (!event.defaultPrevented) {
      setOpen(!open)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    child.props.onKeyDown?.(event)
    if (event.defaultPrevented) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpen(!open)
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) setOpen(true)
    }
  }

  const setTriggerRef = React.useCallback(
    (node: HTMLElement | null) => {
      mergeRefs<HTMLElement>(triggerRef, child.props.ref)(node)
    },
    [child, triggerRef],
  )

  if (asChild) {
    return React.cloneElement(child, {
      ref: setTriggerRef,
      'aria-haspopup': 'dialog',
      'aria-expanded': open,
      'aria-controls': open ? contentId : undefined,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
    })
  }

  return (
    <button
      ref={setTriggerRef}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={open ? contentId : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </button>
  )
}

export interface PopoverContentProps {
  align?: PopoverAlign
  side?: PopoverSide
  sideOffset?: number
  className?: string
  children?: React.ReactNode
  avoidCollisions?: boolean
  /** Accessible name for the dialog panel. */
  ariaLabel?: string
}

interface Position {
  top: number
  left: number
}

export function PopoverContent({
  align = 'center',
  side = 'bottom',
  sideOffset = 8,
  className,
  children,
  avoidCollisions = true,
  ariaLabel = 'Popover',
}: PopoverContentProps) {
  const { open, setOpen, triggerRef, contentId } = usePopover()
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const [content, setContent] = React.useState<HTMLDivElement | null>(null)
  const [pos, setPos] = React.useState<Position>({ top: 0, left: 0 })
  const [positioned, setPositioned] = React.useState(false)

  const setContentRef = React.useCallback((node: HTMLDivElement | null) => {
    contentRef.current = node
    setContent(node)
  }, [])

  const recompute = React.useCallback(() => {
    const trigger = triggerRef.current
    const panel = contentRef.current
    if (!trigger || !panel) return
    const tr = trigger.getBoundingClientRect()
    const cw = panel.offsetWidth
    const ch = panel.offsetHeight
    const vw = window.innerWidth
    const vh = window.innerHeight
    const margin = 8

    let nextSide = side
    if (avoidCollisions) {
      const space: Record<PopoverSide, number> = {
        top: tr.top,
        bottom: vh - tr.bottom,
        left: tr.left,
        right: vw - tr.right,
      }
      const required =
        nextSide === 'top' || nextSide === 'bottom'
          ? ch + sideOffset
          : cw + sideOffset

      if (space[nextSide] < required) {
        const opposite: Record<PopoverSide, PopoverSide> = {
          top: 'bottom',
          bottom: 'top',
          left: 'right',
          right: 'left',
        }
        if (space[opposite[nextSide]] >= space[nextSide]) {
          nextSide = opposite[nextSide]
        }
      }
    }

    let top = 0
    let left = 0

    if (nextSide === 'bottom') {
      top = tr.bottom + sideOffset
      left =
        align === 'start'
          ? tr.left
          : align === 'end'
            ? tr.right - cw
            : tr.left + tr.width / 2 - cw / 2
    } else if (nextSide === 'top') {
      top = tr.top - ch - sideOffset
      left =
        align === 'start'
          ? tr.left
          : align === 'end'
            ? tr.right - cw
            : tr.left + tr.width / 2 - cw / 2
    } else if (nextSide === 'right') {
      top =
        align === 'start'
          ? tr.top
          : align === 'end'
            ? tr.bottom - ch
            : tr.top + tr.height / 2 - ch / 2
      left = tr.right + sideOffset
    } else {
      top =
        align === 'start'
          ? tr.top
          : align === 'end'
            ? tr.bottom - ch
            : tr.top + tr.height / 2 - ch / 2
      left = tr.left - cw - sideOffset
    }

    if (avoidCollisions) {
      if (left < margin) left = margin
      if (left + cw > vw - margin) left = vw - cw - margin
      if (top < margin) top = margin
      if (top + ch > vh - margin) top = vh - ch - margin
    }

    setPos({ top, left })
    setPositioned(true)
  }, [align, avoidCollisions, side, sideOffset, triggerRef])

  React.useEffect(() => {
    if (!open) {
      setPositioned(false)
      return
    }
    if (!content) return
    recompute()
    const handler = () => recompute()
    window.addEventListener('scroll', handler, { passive: true, capture: true })
    window.addEventListener('resize', handler, { passive: true })
    return () => {
      window.removeEventListener('scroll', handler, { capture: true })
      window.removeEventListener('resize', handler)
    }
  }, [open, content, recompute])

  React.useEffect(() => {
    if (!open || !content) return
    const release = trapFocus(content, () => setOpen(false))
    return () => release()
  }, [open, content, setOpen])

  React.useEffect(() => {
    if (!open) return
    const handler = (event: PointerEvent) => {
      const target = event.target as Node
      if (
        triggerRef.current?.contains(target) ||
        contentRef.current?.contains(target)
      ) {
        return
      }
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
  }, [open, setOpen, triggerRef])

  React.useEffect(() => {
    if (!open) return
    const handler = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      setOpen(false)
      triggerRef.current?.focus({ preventScroll: true })
    }
    document.addEventListener('keydown', handler, { capture: true })
    return () =>
      document.removeEventListener('keydown', handler, { capture: true })
  }, [open, setOpen, triggerRef])

  if (!open) return null

  return (
    <Portal>
      <div
        ref={setContentRef}
        id={contentId}
        role="dialog"
        aria-modal={false}
        aria-label={ariaLabel}
        tabIndex={-1}
        data-state="open"
        style={{
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          visibility: positioned ? 'visible' : 'hidden',
        }}
        className={cx(styles.content, className)}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </Portal>
  )
}

export function PopoverClose({ children }: { children: React.ReactElement }) {
  const { setOpen } = usePopover()
  const child = children as React.ReactElement<{
    onClick?: (event: React.MouseEvent<HTMLElement>) => void
  }>

  return React.cloneElement(child, {
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      child.props.onClick?.(event)
      if (!event.defaultPrevented) setOpen(false)
    },
  })
}

export function PopoverArrow({ className }: { className?: string }) {
  return (
    <svg
      width="10"
      height="5"
      viewBox="0 0 10 5"
      className={cx(styles.arrow, className)}
      aria-hidden="true"
    >
      <path d="M0 5L5 0L10 5H0Z" />
    </svg>
  )
}
