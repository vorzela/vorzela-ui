import { cx } from '~/lib/cx'
import styles from './outline.module.scss'

export interface OutlineItem {
  id: string
  label: string
  level?: number
}

export interface OutlineProps {
  items: OutlineItem[]
  activeId?: string
  className?: string
  label?: string
}

/** Table-of-contents navigation for long documents. */
export function Outline({ items, activeId, className, label = 'On this page' }: OutlineProps) {
  return (
    <nav className={cx(styles.root, className)} aria-label={label}>
      <p className={styles.label}>{label}</p>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: `${Math.max(0, (item.level ?? 2) - 2) * 12}px` }}>
            <a
              className={cx(styles.link, item.id === activeId && styles.active)}
              href={`#${item.id}`}
              aria-current={item.id === activeId ? 'location' : undefined}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
