import type { HTMLAttributes, ReactNode } from 'react'

import { cx } from '~/lib/cx'
import styles from './footer.module.scss'

export interface FooterLink {
  label: string
  href: string
}

export interface FooterProps extends HTMLAttributes<HTMLElement> {
  brand?: ReactNode
  description?: ReactNode
  links?: FooterLink[]
  note?: ReactNode
  /** Centre the content in the shared page width. */
  contained?: boolean
}

/** Page or application footer with brand, links and a meta note. */
export function Footer({
  brand = 'Vorzela UI',
  description,
  links,
  note,
  contained = true,
  className,
  children,
  ...props
}: FooterProps) {
  return (
    <footer className={cx(styles.root, className)} {...props}>
      <div className={cx(styles.inner, contained && styles.contained)}>
        <div className={styles.brand}>
          <span className={styles.brandName}>{brand}</span>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>

        {links?.length ? (
          <nav className={styles.links} aria-label="Footer">
            <ul>
              {links.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {children ? <div className={styles.extra}>{children}</div> : null}
        {note ? <p className={styles.note}>{note}</p> : null}
      </div>
    </footer>
  )
}
