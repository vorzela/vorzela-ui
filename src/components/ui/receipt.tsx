import type { ReactNode } from 'react'

import { cx } from '~/lib/cx'
import styles from './receipt.module.scss'

export interface ReceiptLine {
  label: string
  qty?: number
  amount: number
  meta?: string
}

export interface ReceiptProps {
  title?: string
  subtitle?: string
  items: ReceiptLine[]
  subtotal?: number
  tax?: number
  tip?: number
  total: number
  currency?: string
  locale?: string
  footer?: ReactNode
  className?: string
}

/** Narrow, print-friendly receipt with a dashed rule and tabular figures. */
export function Receipt({
  title = 'Receipt',
  subtitle,
  items,
  subtotal,
  tax,
  tip,
  total,
  currency = 'USD',
  locale,
  footer,
  className,
}: ReceiptProps) {
  const format = (value: number) => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
      }).format(value)
    } catch {
      return `${currency} ${value.toFixed(2)}`
    }
  }

  return (
    <article className={cx(styles.root, className)}>
      <header className={styles.head}>
        <div>
          <h3 className={styles.title}>{title}</h3>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        <span className={styles.meta}>{items.length} items</span>
      </header>

      <hr className={styles.rule} />

      <dl className={styles.items}>
        {items.map((item, index) => (
          <div key={`${item.label}-${index}`} className={styles.item}>
            <dt className={styles.itemLabel}>
              {item.label}
              {item.qty || item.meta ? (
                <span className={styles.itemMeta}>
                  {' '}
                  {item.qty ? `${item.qty} ×` : ''} {item.meta ?? ''}
                </span>
              ) : null}
            </dt>
            <dd className={styles.amount}>{format(item.amount)}</dd>
          </div>
        ))}
      </dl>

      <hr className={styles.rule} />

      <dl className={styles.totals}>
        {subtotal !== undefined ? (
          <div className={styles.totalRow}>
            <dt>Subtotal</dt>
            <dd className={styles.amount}>{format(subtotal)}</dd>
          </div>
        ) : null}
        {tax !== undefined ? (
          <div className={styles.totalRow}>
            <dt>Tax</dt>
            <dd className={styles.amount}>{format(tax)}</dd>
          </div>
        ) : null}
        {tip !== undefined ? (
          <div className={styles.totalRow}>
            <dt>Tip</dt>
            <dd className={styles.amount}>{format(tip)}</dd>
          </div>
        ) : null}
        <div className={cx(styles.totalRow, styles.grandTotal)}>
          <dt>Total</dt>
          <dd className={styles.amount}>{format(total)}</dd>
        </div>
      </dl>

      {footer ? <p className={styles.footer}>{footer}</p> : null}
    </article>
  )
}
