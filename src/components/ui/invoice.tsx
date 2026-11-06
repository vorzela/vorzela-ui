import type { ReactNode } from 'react'

import { cx } from '~/lib/cx'
import styles from './invoice.module.scss'

export type InvoiceStatus = 'draft' | 'due' | 'paid' | 'overdue'

export interface InvoiceParty {
  name: string
  lines?: string[]
}

export interface InvoiceLine {
  description: string
  quantity: number
  unitPrice: number
}

export interface InvoiceProps {
  number: string
  status?: InvoiceStatus
  issuedAt: string
  dueAt: string
  from: InvoiceParty
  to: InvoiceParty
  items: InvoiceLine[]
  currency?: string
  locale?: string
  taxRate?: number
  notes?: ReactNode
  className?: string
}

const STATUS_CLASS: Record<InvoiceStatus, string> = {
  draft: '',
  due: styles.statusDue,
  paid: styles.statusPaid,
  overdue: styles.statusDue,
}

/** Printable invoice with parties, line items and totals. */
export function Invoice({
  number,
  status = 'due',
  issuedAt,
  dueAt,
  from,
  to,
  items,
  currency = 'USD',
  locale,
  taxRate = 0,
  notes,
  className,
}: InvoiceProps) {
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

  const subtotal = items.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0,
  )
  const tax = subtotal * (taxRate / 100)

  return (
    <article className={cx(styles.root, className)}>
      <header className={styles.head}>
        <div>
          <span className={styles.eyebrow}>Invoice</span>
          <h3 className={styles.title}>{number}</h3>
        </div>
        <span className={cx(styles.status, STATUS_CLASS[status])}>{status}</span>
      </header>

      <div className={styles.parties}>
        <div className={styles.party}>
          <span className={styles.partyLabel}>From</span>
          <p className={styles.partyName}>{from.name}</p>
          {from.lines?.map((line) => (
            <p key={line} className={styles.partyLine}>
              {line}
            </p>
          ))}
        </div>
        <div className={styles.party}>
          <span className={styles.partyLabel}>Bill to</span>
          <p className={styles.partyName}>{to.name}</p>
          {to.lines?.map((line) => (
            <p key={line} className={styles.partyLine}>
              {line}
            </p>
          ))}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Description</th>
              <th scope="col">Qty</th>
              <th scope="col">Unit</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`${item.description}-${index}`}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td className={styles.amount}>{format(item.unitPrice)}</td>
                <td className={styles.amount}>
                  {format(item.quantity * item.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.foot}>
        <div>
          <p className={styles.partyLine}>Issued {issuedAt}</p>
          <p className={styles.partyLine}>Due {dueAt}</p>
          {notes ? <p className={styles.notes}>{notes}</p> : null}
        </div>

        <dl className={styles.totals}>
          <div className={styles.totalRow}>
            <dt>Subtotal</dt>
            <dd className={styles.amount}>{format(subtotal)}</dd>
          </div>
          {taxRate > 0 ? (
            <div className={styles.totalRow}>
              <dt>Tax ({taxRate}%)</dt>
              <dd className={styles.amount}>{format(tax)}</dd>
            </div>
          ) : null}
          <div className={cx(styles.totalRow, styles.grandTotal)}>
            <dt>Total</dt>
            <dd className={styles.amount}>{format(subtotal + tax)}</dd>
          </div>
        </dl>
      </div>
    </article>
  )
}
