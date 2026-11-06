import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Portal } from '~/components/primitives/portal'
import { cx } from '~/lib/cx'

import { Button } from './button'
import styles from './tour.module.scss'

export type TourPlacement = 'top' | 'bottom' | 'left' | 'right'

export type TourStep = {
  id: string
  /** CSS selector or a function that returns the element to highlight. */
  target: string | (() => HTMLElement | null)
  title: ReactNode
  description?: ReactNode
  placement?: TourPlacement
  image?: string
  action?: { label: string; onClick: () => void }
}

export interface TourProps {
  steps: TourStep[]
  open: boolean
  onOpenChange?: (open: boolean) => void
  onFinish?: () => void
  current?: number
  defaultCurrent?: number
  onStepChange?: (index: number) => void
  maskClosable?: boolean
  showSkip?: boolean
  scrollIntoView?: boolean
  className?: string
}

type Rect = {
  top: number
  left: number
  width: number
  height: number
  bottom: number
  right: number
}

const GAP = 12
const EDGE = 16

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Guided product tour with a highlighted target and keyboard controls. */
export function Tour({
  steps,
  open,
  onOpenChange,
  onFinish,
  current,
  defaultCurrent = 0,
  onStepChange,
  maskClosable = false,
  showSkip = true,
  scrollIntoView = true,
  className,
}: TourProps) {
  const [internal, setInternal] = useState(defaultCurrent)
  const [rect, setRect] = useState<Rect | null>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const index = clamp(current ?? internal, 0, Math.max(0, steps.length - 1))
  const step = steps[index]

  const setOpen = (next: boolean) => onOpenChange?.(next)

  const go = (next: number) => {
    const bounded = clamp(next, 0, steps.length - 1)
    if (current === undefined) setInternal(bounded)
    onStepChange?.(bounded)
  }

  const finish = () => {
    setOpen(false)
    onFinish?.()
  }

  useEffect(() => {
    if (!open || !step) {
      setRect(null)
      return
    }

    const element =
      typeof step.target === 'function'
        ? step.target()
        : document.querySelector<HTMLElement>(step.target)

    if (!element) {
      setRect(null)
      return
    }

    if (scrollIntoView) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    }

    let frame = 0
    const update = () => {
      frame = 0
      const box = element.getBoundingClientRect()
      setRect({
        top: box.top,
        left: box.left,
        width: box.width,
        height: box.height,
        bottom: box.bottom,
        right: box.right,
      })
    }
    const schedule = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, true)
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule, true)
      window.removeEventListener('resize', schedule)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [open, step, scrollIntoView])

  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        if (index >= steps.length - 1) finish()
        else go(index + 1)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        go(index - 1)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  useEffect(() => {
    if (open) nextRef.current?.focus()
  }, [open, index])

  const position = useMemo(() => {
    if (typeof window === 'undefined') return null
    if (!rect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }

    const width = Math.min(320, window.innerWidth - EDGE * 2)
    const placement = step?.placement ?? (rect.top > 240 ? 'top' : 'bottom')
    const centerX = clamp(
      rect.left + rect.width / 2 - width / 2,
      EDGE,
      window.innerWidth - width - EDGE,
    )
    const centerY = clamp(
      rect.top + rect.height / 2 - 120,
      EDGE,
      window.innerHeight - 260,
    )

    switch (placement) {
      case 'top':
        return {
          left: centerX,
          bottom: window.innerHeight - rect.top + GAP,
        }
      case 'left':
        return {
          top: centerY,
          right: window.innerWidth - rect.left + GAP,
        }
      case 'right':
        return {
          top: centerY,
          left: rect.right + GAP,
        }
      default:
        return {
          left: centerX,
          top: rect.bottom + GAP,
        }
    }
  }, [rect, step])

  if (!open || !step || !position) return null

  return (
    <Portal>
      <div
        className={styles.mask}
        onClick={() => {
          if (maskClosable) setOpen(false)
        }}
      />
      {rect ? (
        <div
          className={styles.highlight}
          style={{
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
          }}
        />
      ) : null}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof step.title === 'string' ? step.title : 'Product tour'}
        className={cx(styles.tooltip, className)}
        style={position}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>{step.title}</h3>
          <span className={styles.progress}>{index + 1} / {steps.length}</span>
        </div>
        {step.description ? <p className={styles.description}>{step.description}</p> : null}
        {step.image ? (
          <img src={step.image} alt="" className={styles.media} loading="lazy" />
        ) : null}
        <div className={styles.footer}>
          <div>
            {showSkip ? (
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                Skip
              </Button>
            ) : null}
          </div>
          <div className={styles.actions}>
            {step.action ? (
              <Button size="sm" variant="ghost" onClick={step.action.onClick}>
                {step.action.label}
              </Button>
            ) : null}
            {index > 0 ? (
              <Button size="sm" variant="outline" onClick={() => go(index - 1)}>
                Back
              </Button>
            ) : null}
            <Button
              ref={nextRef}
              size="sm"
              onClick={() => {
                if (index >= steps.length - 1) finish()
                else go(index + 1)
              }}
            >
              {index >= steps.length - 1 ? 'Done' : 'Next'}
            </Button>
          </div>
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Close tour"
          className={styles.close}
          onClick={() => setOpen(false)}
        >
          <X aria-hidden size={14} />
        </Button>
      </div>
    </Portal>
  )
}
