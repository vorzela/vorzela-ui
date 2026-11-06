/**
 * components/ui/tooltip.tsx
 *
 * Viewport-aware tooltip with collision-aware placement.
 */
import * as React from 'react'

import { Portal } from '~/components/primitives/portal'
import { cx } from '~/lib/cx'
import styles from './tooltip.module.scss'

const VIEWPORT_MARGIN = 8
const GAP = 10

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

interface ComputedPos {
  x: number
  y: number
  placement: TooltipPlacement
  arrowOffset: number
}

function computePos(
  trigger: HTMLElement,
  tooltip: HTMLElement,
  preferred: TooltipPlacement,
): ComputedPos {
  const tr = trigger.getBoundingClientRect()
  const tw = tooltip.offsetWidth
  const th = tooltip.offsetHeight
  const vw = window.innerWidth
  const vh = window.innerHeight
  const margin = VIEWPORT_MARGIN
  const gap = GAP

  const space = {
    top: tr.top - margin,
    bottom: vh - tr.bottom - margin,
    left: tr.left - margin,
    right: vw - tr.right - margin,
  }

  const fits: Record<TooltipPlacement, boolean> = {
    top: space.top >= th + gap,
    bottom: space.bottom >= th + gap,
    left: space.left >= tw + gap,
    right: space.right >= tw + gap,
  }

  const opposite: Record<TooltipPlacement, TooltipPlacement> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  }

  let placement: TooltipPlacement = preferred
  if (!fits[preferred]) {
    if (fits[opposite[preferred]]) {
      placement = opposite[preferred]
    } else {
      placement = (
        Object.entries(space).sort(([, a], [, b]) => b - a)[0] as [
          TooltipPlacement,
          number,
        ]
      )[0]
    }
  }

  let x: number
  let y: number
  let arrowOffset: number

  const ARROW_HALF = 6

  if (placement === 'top' || placement === 'bottom') {
    const ideal = tr.left + tr.width / 2 - tw / 2
    x = Math.max(margin, Math.min(ideal, vw - tw - margin))
    y = placement === 'top' ? tr.top - th - gap : tr.bottom + gap
    const arrowIdeal = tr.left + tr.width / 2 - x
    arrowOffset = Math.max(
      ARROW_HALF + 4,
      Math.min(arrowIdeal, tw - ARROW_HALF - 4),
    )
  } else {
    const ideal = tr.top + tr.height / 2 - th / 2
    y = Math.max(margin, Math.min(ideal, vh - th - margin))
    x = placement === 'left' ? tr.left - tw - gap : tr.right + gap
    const arrowIdeal = tr.top + tr.height / 2 - y
    arrowOffset = Math.max(
      ARROW_HALF + 4,
      Math.min(arrowIdeal, th - ARROW_HALF - 4),
    )
  }

  return { x, y, placement, arrowOffset }
}

export interface TooltipProps {
  content: React.ReactNode
  placement?: TooltipPlacement
  delayShow?: number
  delayHide?: number
  disabled?: boolean
  maxWidth?: number
  className?: string
  children: React.ReactNode
}

export function Tooltip({
  content,
  placement: placementPref = 'top',
  delayShow = 0,
  delayHide = 0,
  disabled,
  maxWidth = 240,
  className,
  children,
}: TooltipProps) {
  const triggerRef = React.useRef<HTMLSpanElement>(null)
  const tooltipRef = React.useRef<HTMLDivElement>(null)
  const showTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const hideTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  const tooltipId = React.useId()
  const [visible, setVisible] = React.useState(false)
  const [pos, setPos] = React.useState<ComputedPos | null>(null)

  const show = () => {
    if (disabled) return
    clearTimeout(hideTimer.current)
    showTimer.current = setTimeout(() => setVisible(true), delayShow)
  }

  const hide = () => {
    clearTimeout(showTimer.current)
    hideTimer.current = setTimeout(() => {
      setVisible(false)
      setPos(null)
    }, delayHide)
  }

  React.useLayoutEffect(() => {
    if (!visible) return
    if (triggerRef.current && tooltipRef.current) {
      setPos(computePos(triggerRef.current, tooltipRef.current, placementPref))
    }
  }, [visible, placementPref])

  React.useEffect(() => {
    if (!visible) return
    const update = () => {
      if (triggerRef.current && tooltipRef.current) {
        setPos(computePos(triggerRef.current, tooltipRef.current, placementPref))
      }
    }
    window.addEventListener('scroll', update, { passive: true, capture: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update, { capture: true })
      window.removeEventListener('resize', update)
    }
  }, [visible, placementPref])

  React.useEffect(() => {
    return () => {
      clearTimeout(showTimer.current)
      clearTimeout(hideTimer.current)
    }
  }, [])

  const arrowStyle = pos
    ? ({ '--vz-arrow-offset': `${pos.arrowOffset}px` } as React.CSSProperties)
    : undefined

  return (
    <>
      <span
        ref={triggerRef}
        className={cx(styles.trigger, className)}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        aria-describedby={visible ? tooltipId : undefined}
      >
        {children}
      </span>

      {visible ? (
        <Portal>
          <div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            style={{
              position: 'fixed',
              left: `${pos?.x ?? 0}px`,
              top: `${pos?.y ?? 0}px`,
              maxWidth: `${maxWidth}px`,
              visibility: pos ? 'visible' : 'hidden',
              opacity: pos ? 1 : 0,
            }}
            className={styles.content}
          >
            {content}
            {pos ? (
              <span
                aria-hidden="true"
                className={styles.arrow}
                data-placement={pos.placement}
                style={arrowStyle}
              />
            ) : null}
          </div>
        </Portal>
      ) : null}
    </>
  )
}
