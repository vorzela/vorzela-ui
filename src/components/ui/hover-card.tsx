/**
 * components/ui/hover-card.tsx
 *
 * Hover/focus triggered card. Delayed with leak-free timers.
 */
import * as React from 'react'

import { Portal } from '~/components/primitives/portal'
import { cx } from '~/lib/cx'
import { mergeRefs } from '~/lib/refs'
import styles from './hover-card.module.scss'

export type HoverCardAlign = 'start' | 'center' | 'end'
export type HoverCardSide = 'top' | 'bottom' | 'left' | 'right'

interface HoverCardContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement | null>
  contentId: string
}

const HoverCardContext = React.createContext<HoverCardContextValue | null>(null)

function useHoverCard() {
  const context = React.useContext(HoverCardContext)
  if (!context) {
    throw new Error('HoverCard components must be used within <HoverCard>')
  }
  return context
}

export interface HoverCardProps {
  openDelay?: number
  closeDelay?: number
  children?: React.ReactNode
}

export function HoverCard({
  openDelay = 200,
  closeDelay = 150,
  children,
}: HoverCardProps) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const contentId = React.useId()
  const openTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  const openWithDelay = React.useCallback(() => {
    clearTimeout(closeTimer.current)
    openTimer.current = setTimeout(() => setOpen(true), openDelay)
  }, [openDelay])

  const closeWithDelay = React.useCallback(() => {
    clearTimeout(openTimer.current)
    closeTimer.current = setTimeout(() => setOpen(false), closeDelay)
  }, [closeDelay])

  React.useEffect(() => {
    return () => {
      clearTimeout(openTimer.current)
      clearTimeout(closeTimer.current)
    }
  }, [])

  const context = React.useMemo<HoverCardContextValue>(
    () => ({
      open,
      setOpen: (value: boolean) => (value ? openWithDelay() : closeWithDelay()),
      triggerRef,
      contentId,
    }),
    [open, openWithDelay, closeWithDelay, contentId],
  )

  return (
    <HoverCardContext.Provider value={context}>
      <div
        className={styles.wrapper}
        onMouseEnter={openWithDelay}
        onMouseLeave={closeWithDelay}
        onFocus={openWithDelay}
        onBlur={closeWithDelay}
      >
        {children}
      </div>
    </HoverCardContext.Provider>
  )
}

type TriggerChildProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>
}

export interface HoverCardTriggerProps {
  asChild?: boolean
  children: React.ReactElement
}

export function HoverCardTrigger({
  asChild = true,
  children,
}: HoverCardTriggerProps) {
  const { triggerRef, open, contentId } = useHoverCard()
  const child = children as React.ReactElement<TriggerChildProps>

  const setTriggerRef = React.useCallback(
    (node: HTMLElement | null) => {
      mergeRefs<HTMLElement>(triggerRef, child.props.ref)(node)
    },
    [child, triggerRef],
  )

  if (asChild) {
    return React.cloneElement(child, {
      ref: setTriggerRef,
      'aria-describedby': open ? contentId : undefined,
    })
  }

  return (
    <span
      ref={setTriggerRef}
      aria-describedby={open ? contentId : undefined}
    >
      {children}
    </span>
  )
}

export interface HoverCardContentProps {
  align?: HoverCardAlign
  side?: HoverCardSide
  sideOffset?: number
  className?: string
  children?: React.ReactNode
}

export function HoverCardContent({
  align = 'center',
  side = 'bottom',
  sideOffset = 8,
  className,
  children,
}: HoverCardContentProps) {
  const { open, triggerRef, contentId } = useHoverCard()
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [pos, setPos] = React.useState({ top: 0, left: 0 })
  const [positioned, setPositioned] = React.useState(false)

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

    let top = 0
    let left = 0

    if (side === 'bottom') {
      top = tr.bottom + sideOffset
      left =
        align === 'start'
          ? tr.left
          : align === 'end'
            ? tr.right - cw
            : tr.left + tr.width / 2 - cw / 2
    } else if (side === 'top') {
      top = tr.top - ch - sideOffset
      left =
        align === 'start'
          ? tr.left
          : align === 'end'
            ? tr.right - cw
            : tr.left + tr.width / 2 - cw / 2
    } else if (side === 'right') {
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

    if (left < margin) left = margin
    if (left + cw > vw - margin) left = vw - cw - margin
    if (top < margin) top = margin
    if (top + ch > vh - margin) top = vh - ch - margin

    setPos({ top, left })
    setPositioned(true)
  }, [align, side, sideOffset, triggerRef])

  React.useEffect(() => {
    if (!open) {
      setPositioned(false)
      return
    }
    recompute()
    const handler = () => recompute()
    window.addEventListener('scroll', handler, { passive: true, capture: true })
    window.addEventListener('resize', handler, { passive: true })
    return () => {
      window.removeEventListener('scroll', handler, { capture: true })
      window.removeEventListener('resize', handler)
    }
  }, [open, recompute])

  if (!open) return null

  return (
    <Portal>
      <div
        ref={contentRef}
        id={contentId}
        role="tooltip"
        style={{
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          visibility: positioned ? 'visible' : 'hidden',
        }}
        className={cx(styles.content, className)}
      >
        {children}
      </div>
    </Portal>
  )
}
