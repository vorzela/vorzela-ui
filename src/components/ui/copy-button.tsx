import { Check, Copy } from 'lucide-react'

import { VisuallyHidden } from '~/components/primitives/visually-hidden'
import { useCopyToClipboard } from '~/hooks/use-copy-to-clipboard'
import { cx } from '~/lib/cx'
import { Button, type ButtonSize, type ButtonVariant } from './button'
import styles from './copy-button.module.scss'

export interface CopyButtonProps {
  value: string
  label?: string
  copiedLabel?: string
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

/** Copies a value on a user gesture and announces the result. */
export function CopyButton({
  value,
  label = 'Copy',
  copiedLabel = 'Copied',
  variant = 'outline',
  size = 'sm',
  className,
}: CopyButtonProps) {
  const { state, copy } = useCopyToClipboard()
  const copied = state === 'copied'

  return (
    <span className={cx(styles.root, className)}>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => void copy(value)}
      >
        {copied ? (
          <Check className={styles.successIcon} aria-hidden />
        ) : (
          <Copy aria-hidden />
        )}
        {copied ? copiedLabel : label}
      </Button>
      <VisuallyHidden role="status" aria-live="polite">
        {copied
          ? 'Copied to clipboard'
          : state === 'error'
            ? 'Copy failed'
            : ''}
      </VisuallyHidden>
    </span>
  )
}
