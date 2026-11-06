import { WifiOff } from 'lucide-react'

import { useOnlineStatus } from '~/hooks/use-online-status'
import { cx } from '~/lib/cx'
import styles from './offline-banner.module.scss'

export function OfflineBanner({
  message = 'You are offline. Changes will sync when the connection returns.',
  className,
  force = false,
  onRetry,
}: {
  message?: string
  className?: string
  /** Show the banner even when the browser reports a connection (demos). */
  force?: boolean
  onRetry?: () => void
}) {
  const online = useOnlineStatus()
  if (online && !force) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cx(styles.root, className)}
    >
      <WifiOff className={styles.icon} aria-hidden />
      <span className={styles.message}>{message}</span>
      {onRetry ? (
        <button type="button" className={styles.retry} onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  )
}
