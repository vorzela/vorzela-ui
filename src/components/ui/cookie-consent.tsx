import * as React from 'react'
import { Cookie } from 'lucide-react'

import { Portal } from '~/components/primitives/portal'
import { cx } from '~/lib/cx'
import { safeHref } from '~/lib/security'
import { Button } from './button'
import styles from './cookie-consent.module.scss'

export function CookieConsent({
  storageKey = 'vz.cookie-consent',
  title = 'We use cookies',
  description = 'Essential cookies keep the app working. Analytics cookies are optional.',
  policyHref = '/privacy',
  policyLabel = 'Privacy policy',
  onAccept,
  onReject,
  className,
}: {
  storageKey?: string
  title?: string
  description?: string
  policyHref?: string
  policyLabel?: string
  onAccept?: () => void
  onReject?: () => void
  className?: string
}) {
  const [visible, setVisible] = React.useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return !window.localStorage.getItem(storageKey)
    } catch {
      return true
    }
  })

  const decide = (value: 'accepted' | 'rejected') => {
    try {
      window.localStorage.setItem(storageKey, value)
    } catch {
      // Storage may be blocked; still dismiss for this session.
    }
    setVisible(false)
    if (value === 'accepted') onAccept?.()
    else onReject?.()
  }

  if (!visible) return null
  const href = safeHref(policyHref)

  return (
    <Portal>
      <div role="region" aria-label="Cookie consent" className={cx(styles.root, className)}>
        <div className={styles.layout}>
          <Cookie className={styles.icon} aria-hidden />
          <div className={styles.body}>
            <p className={styles.title}>{title}</p>
            <p className={styles.description}>
              {description}{' '}
              {href ? (
                <a href={href} className={styles.link}>
                  {policyLabel}
                </a>
              ) : null}
            </p>
            <div className={styles.actions}>
              <Button size="sm" onClick={() => decide('accepted')}>
                Accept all
              </Button>
              <Button size="sm" variant="outline" onClick={() => decide('rejected')}>
                Essential only
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  )
}
