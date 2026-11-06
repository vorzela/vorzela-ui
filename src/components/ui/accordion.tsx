import { ChevronDown } from 'lucide-react'
import * as React from 'react'

import { cx } from '~/lib/cx'
import styles from './accordion.module.scss'

export type AccordionItem = {
  id: string
  title: string
  content: React.ReactNode
}

export interface AccordionProps {
  items: AccordionItem[]
  type?: 'single' | 'multiple'
  defaultValue?: string | string[]
  onValueChange?: (value: string[]) => void
  className?: string
}

/** A list of disclosure sections. Single mode keeps one panel open at a time. */
export function Accordion({
  items,
  type = 'single',
  defaultValue,
  onValueChange,
  className,
}: AccordionProps) {
  const baseId = React.useId()
  const [open, setOpen] = React.useState<string[]>(() => {
    if (!defaultValue) return []
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue]
  })

  const toggle = React.useCallback(
    (id: string) => {
      const isOpen = open.includes(id)
      const next =
        type === 'single'
          ? isOpen
            ? []
            : [id]
          : isOpen
            ? open.filter((value) => value !== id)
            : [...open, id]
      setOpen(next)
      onValueChange?.(next)
    },
    [onValueChange, open, type],
  )

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End']
    if (!keys.includes(event.key)) return

    const triggers = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[data-accordion-trigger]',
      ),
    )
    if (triggers.length === 0) return

    const current = triggers.indexOf(event.target as HTMLButtonElement)
    if (current === -1) return

    event.preventDefault()

    let next = current
    if (event.key === 'ArrowDown') next = (current + 1) % triggers.length
    if (event.key === 'ArrowUp')
      next = (current - 1 + triggers.length) % triggers.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = triggers.length - 1

    triggers[next]?.focus()
  }

  return (
    <div
      className={cx(styles.root, className)}
      onKeyDown={handleKeyDown}
      data-type={type}
    >
      {items.map((item) => {
        const isOpen = open.includes(item.id)
        const triggerId = `${baseId}-${item.id}-trigger`
        const panelId = `${baseId}-${item.id}-panel`

        return (
          <div
            key={item.id}
            className={styles.item}
            data-state={isOpen ? 'open' : 'closed'}
          >
            <h3 className={styles.heading}>
              <button
                type="button"
                id={triggerId}
                className={styles.trigger}
                aria-expanded={isOpen}
                aria-controls={panelId}
                data-accordion-trigger
                onClick={() => toggle(item.id)}
              >
                <span className={styles.title}>{item.title}</span>
                <ChevronDown className={styles.chevron} aria-hidden />
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              inert={!isOpen || undefined}
              className={styles.panel}
            >
              <div className={styles.panelInner}>
                <div className={styles.content}>{item.content}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
