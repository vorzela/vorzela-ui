import { X } from 'lucide-react'
import { useEffect } from 'react'

import { cx } from '~/lib/cx'
import { Portal } from '~/components/primitives/portal'
import styles from './lightbox.module.scss'

export interface LightboxProps {
  open: boolean
  src: string
  alt?: string
  onClose: () => void
  caption?: string
  className?: string
}

/** Full-screen image viewer. */
export function Lightbox({ open, src, alt = '', onClose, caption, className }: LightboxProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <Portal>
      <div
        className={cx(styles.root, className)}
        role="dialog"
        aria-modal="true"
        aria-label={alt || 'Image preview'}
        onClick={onClose}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          <X aria-hidden />
        </button>
        <figure className={styles.figure} onClick={(event) => event.stopPropagation()}>
          <img className={styles.image} src={src} alt={alt} />
          {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
        </figure>
      </div>
    </Portal>
  )
}
