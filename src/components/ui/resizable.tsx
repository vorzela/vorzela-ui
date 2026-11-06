import { GripVertical } from 'lucide-react'
import * as React from 'react'

import { cx } from '~/lib/cx'
import styles from './resizable.module.scss'

export type ResizableDirection = 'horizontal' | 'vertical'

interface ResizablePanelGroupContextValue {
  direction: ResizableDirection
}

const ResizablePanelGroupContext =
  React.createContext<ResizablePanelGroupContextValue | null>(null)

function useResizablePanelGroup(): ResizablePanelGroupContextValue {
  const context = React.useContext(ResizablePanelGroupContext)
  if (!context) {
    throw new Error(
      'Resizable components must be used within <ResizablePanelGroup>.',
    )
  }
  return context
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function panelsFor(
  handle: HTMLElement,
): { previous: HTMLElement; next: HTMLElement } | null {
  const previous = handle.previousElementSibling
  const next = handle.nextElementSibling

  if (!(previous instanceof HTMLElement) || !(next instanceof HTMLElement)) {
    return null
  }

  if (
    !previous.hasAttribute('data-resizable-panel') ||
    !next.hasAttribute('data-resizable-panel')
  ) {
    return null
  }

  return { previous, next }
}

function boundsFor(
  previous: HTMLElement,
  next: HTMLElement,
  groupSize: number,
  pairTotal: number,
): { min: number; max: number } {
  const previousMin = Number(previous.dataset.min ?? '0')
  const previousMax = Number(previous.dataset.max ?? '100')
  const nextMin = Number(next.dataset.min ?? '0')

  const min = (previousMin / 100) * groupSize
  const max = Math.min(
    (previousMax / 100) * groupSize,
    pairTotal - (nextMin / 100) * groupSize,
  )

  return { min, max: Math.max(min, max) }
}

function growValue(element: HTMLElement): number {
  const value = Number.parseFloat(element.style.flexGrow)
  return Number.isFinite(value) && value > 0 ? value : 1
}

function applySizes(
  previous: HTMLElement,
  next: HTMLElement,
  previousPx: number,
  pairTotal: number,
  pairGrow: number,
): void {
  if (pairTotal <= 0) return

  const nextPx = Math.max(pairTotal - previousPx, 0)
  const scale = pairGrow / pairTotal
  previous.style.flexGrow = String(Math.max(previousPx * scale, 0))
  next.style.flexGrow = String(Math.max(nextPx * scale, 0))
}

export interface ResizablePanelGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  direction?: ResizableDirection
}

export const ResizablePanelGroup = React.forwardRef<
  HTMLDivElement,
  ResizablePanelGroupProps
>(function ResizablePanelGroup(
  { className, direction = 'horizontal', children, ...props },
  ref,
) {
  const context = React.useMemo<ResizablePanelGroupContextValue>(
    () => ({ direction }),
    [direction],
  )

  return (
    <ResizablePanelGroupContext.Provider value={context}>
      <div
        {...props}
        ref={ref}
        className={cx(styles.group, className)}
        data-resizable-group
        data-panel-group-direction={direction}
      >
        {children}
      </div>
    </ResizablePanelGroupContext.Provider>
  )
})

ResizablePanelGroup.displayName = 'ResizablePanelGroup'

export interface ResizablePanelProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Initial share of the available space. */
  defaultSize?: number
  /** Minimum share of the available space, as a percentage. */
  minSize?: number
  /** Maximum share of the available space, as a percentage. */
  maxSize?: number
}

export const ResizablePanel = React.forwardRef<
  HTMLDivElement,
  ResizablePanelProps
>(function ResizablePanel(
  {
    className,
    defaultSize = 1,
    minSize,
    maxSize,
    style,
    children,
    ...props
  },
  ref,
) {
  const { direction } = useResizablePanelGroup()

  const sizeStyle: React.CSSProperties =
    direction === 'horizontal'
      ? {
          minWidth: minSize === undefined ? undefined : `${minSize}%`,
          maxWidth: maxSize === undefined ? undefined : `${maxSize}%`,
        }
      : {
          minHeight: minSize === undefined ? undefined : `${minSize}%`,
          maxHeight: maxSize === undefined ? undefined : `${maxSize}%`,
        }

  return (
    <div
      {...props}
      ref={ref}
      className={cx(styles.panel, className)}
      data-resizable-panel
      data-min={minSize}
      data-max={maxSize}
      style={{ flexGrow: defaultSize, flexBasis: 0, ...sizeStyle, ...style }}
    >
      {children}
    </div>
  )
})

ResizablePanel.displayName = 'ResizablePanel'

interface DragState {
  pointerId: number
  horizontal: boolean
  start: number
  previous: HTMLElement
  next: HTMLElement
  previousSize: number
  pairTotal: number
  pairGrow: number
  bounds: { min: number; max: number }
}

export interface ResizableHandleProps
  extends React.HTMLAttributes<HTMLDivElement> {
  withHandle?: boolean
}

export const ResizableHandle = React.forwardRef<
  HTMLDivElement,
  ResizableHandleProps
>(function ResizableHandle(
  { className, withHandle = false, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onKeyDown, ...props },
  ref,
) {
  const { direction } = useResizablePanelGroup()
  const drag = React.useRef<DragState | null>(null)
  const [resizing, setResizing] = React.useState(false)
  const [value, setValue] = React.useState(50)

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event)
    if (event.defaultPrevented || event.button !== 0) return

    const panels = panelsFor(event.currentTarget)
    const group = event.currentTarget.closest<HTMLElement>(
      '[data-resizable-group]',
    )
    if (!panels || !group) return

    const horizontal = direction === 'horizontal'
    const rect = group.getBoundingClientRect()
    const groupSize = horizontal ? rect.width : rect.height
    if (groupSize <= 0) return

    const previousRect = panels.previous.getBoundingClientRect()
    const nextRect = panels.next.getBoundingClientRect()
    const previousSize = horizontal
      ? previousRect.width
      : previousRect.height
    const nextSize = horizontal ? nextRect.width : nextRect.height
    const pairTotal = previousSize + nextSize
    const pairGrow =
      growValue(panels.previous) + growValue(panels.next)

    drag.current = {
      pointerId: event.pointerId,
      horizontal,
      start: horizontal ? event.clientX : event.clientY,
      previous: panels.previous,
      next: panels.next,
      previousSize,
      pairTotal,
      pairGrow,
      bounds: boundsFor(panels.previous, panels.next, groupSize, pairTotal),
    }

    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setResizing(true)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event)
    const state = drag.current
    if (!state || state.pointerId !== event.pointerId) return

    const delta =
      (state.horizontal ? event.clientX : event.clientY) - state.start
    const nextSize = clamp(
      state.previousSize + delta,
      state.bounds.min,
      state.bounds.max,
    )

    applySizes(
      state.previous,
      state.next,
      nextSize,
      state.pairTotal,
      state.pairGrow,
    )
    setValue(Math.round((nextSize / Math.max(1, state.pairTotal)) * 100))
  }

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current
    if (!state || state.pointerId !== event.pointerId) return

    drag.current = null
    setResizing(false)

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return

    const horizontal = direction === 'horizontal'
    const forward = horizontal ? 'ArrowRight' : 'ArrowDown'
    const backward = horizontal ? 'ArrowLeft' : 'ArrowUp'
    if (![forward, backward].includes(event.key)) return

    const panels = panelsFor(event.currentTarget)
    const group = event.currentTarget.closest<HTMLElement>(
      '[data-resizable-group]',
    )
    if (!panels || !group) return

    const rect = group.getBoundingClientRect()
    const groupSize = horizontal ? rect.width : rect.height
    if (groupSize <= 0) return

    const previousRect = panels.previous.getBoundingClientRect()
    const nextRect = panels.next.getBoundingClientRect()
    const previousSize = horizontal
      ? previousRect.width
      : previousRect.height
    const nextSize = horizontal ? nextRect.width : nextRect.height
    const pairTotal = previousSize + nextSize
    const step = groupSize * (event.shiftKey ? 0.1 : 0.02)
    const delta = event.key === forward ? step : -step
    const bounds = boundsFor(
      panels.previous,
      panels.next,
      groupSize,
      pairTotal,
    )
    const nextPreviousSize = clamp(
      previousSize + delta,
      bounds.min,
      bounds.max,
    )

    event.preventDefault()
    applySizes(
      panels.previous,
      panels.next,
      nextPreviousSize,
      pairTotal,
      growValue(panels.previous) + growValue(panels.next),
    )
    setValue(
      Math.round((nextPreviousSize / Math.max(1, pairTotal)) * 100),
    )
  }

  return (
    <div
      {...props}
      ref={ref}
      role="separator"
      tabIndex={0}
      aria-orientation={direction === 'horizontal' ? 'vertical' : 'horizontal'}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-label="Resize panels"
      className={cx(styles.handle, className)}
      data-resizing={resizing || undefined}
      data-panel-group-direction={direction}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => {
        onPointerUp?.(event)
        endDrag(event)
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event)
        endDrag(event)
      }}
      onKeyDown={handleKeyDown}
    >
      {withHandle ? (
        <div className={styles.handleInner}>
          <GripVertical className={styles.handleIcon} aria-hidden />
        </div>
      ) : null}
    </div>
  )
})

ResizableHandle.displayName = 'ResizableHandle'
