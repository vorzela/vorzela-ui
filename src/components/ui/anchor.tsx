import type { MouseEvent } from 'react'
import { useEffect, useId, useState } from 'react'

import { cx } from '~/lib/cx'

import styles from './anchor.module.scss'

export type AnchorItem = {
  id: string
  label: string
  /** Heading level; 2 is the default. */
  level?: 2 | 3 | 4
}

export interface AnchorProps {
  items: AnchorItem[]
  label?: string
  /** Scroll offset in pixels, usually the sticky header height. */
  offset?: number
  /** Use smooth scrolling. Defaults to true. */
  smooth?: boolean
  /** Controlled active id. */
  activeId?: string
  onChange?: (id: string) => void
  className?: string
  id?: string
}

/** Table of contents with a scroll-spy indicator. */
export function Anchor({
  items,
  label = 'On this page',
  offset = 96,
  smooth = true,
  activeId,
  onChange,
  className,
  id,
}: AnchorProps) {
  const generatedId = useId()
  const labelId = `${id ?? generatedId}-label`
  const [internal, setInternal] = useState(items[0]?.id ?? '')
  const active = activeId ?? internal

  useEffect(() => {
    if (activeId !== undefined || items.length === 0) return
    let frame = 0

    const update = () => {
      frame = 0
      let current = items[0]?.id ?? ''
      for (const item of items) {
        const element = document.getElementById(item.id)
        if (!element) continue
        if (element.getBoundingClientRect().top <= offset + 1) current = item.id
        else break
      }
      setInternal((previous) => (previous === current ? previous : current))
    }

    const schedule = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [items, offset, activeId])

  const go = (event: MouseEvent<HTMLAnchorElement>, item: AnchorItem) => {
    const element = document.getElementById(item.id)
    if (!element) return
    event.preventDefault()
    const top = element.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' })
    if (activeId === undefined) setInternal(item.id)
    onChange?.(item.id)
  }

  return (
    <nav id={id} aria-labelledby={labelId} className={cx(styles.root, className)}>
      <p id={labelId} className={styles.label}>{label}</p>
      <ol className={styles.list}>
        {items.map((item) => {
          const isActive = item.id === active
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? 'location' : undefined}
                className={cx(
                  styles.link,
                  item.level === 3 && styles.level3,
                  item.level === 4 && styles.level4,
                  isActive && styles.active,
                )}
                onClick={(event) => go(event, item)}
              >
                {item.label}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
