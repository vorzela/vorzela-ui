import { ChevronRight } from 'lucide-react'
import { Fragment, type ReactNode } from 'react'

import { cx } from '~/lib/cx'
import styles from './breadcrumb.module.scss'

export type BreadcrumbItem = {
  label: string
  href?: string
  current?: boolean
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  separator?: ReactNode
}

/** Compact path navigation. The final item is marked as the current page. */
export function Breadcrumb({ items, className, separator }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cx(styles.root, className)}
    >
      <ol className={styles.list}>
        {items.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 ? (
              <li aria-hidden className={styles.separator}>
                {separator ?? <ChevronRight aria-hidden />}
              </li>
            ) : null}
            <li className={styles.item}>
              {item.href && !item.current ? (
                <a href={item.href} className={styles.link}>
                  {item.label}
                </a>
              ) : (
                <span
                  aria-current={item.current ? 'page' : undefined}
                  className={cx(styles.label, item.current && styles.current)}
                >
                  {item.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}
