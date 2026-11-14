import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

import { cx } from '~/lib/cx'
import styles from './code-block.module.scss'

export interface CodeBlockProps {
  code: string
  language?: string
  title?: string
  copyable?: boolean
  className?: string
}

/** Read-only code block with an optional copy affordance. */
export function CodeBlock({
  code,
  language,
  title,
  copyable = true,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <figure className={cx(styles.root, className)}>
      {title || language || copyable ? (
        <figcaption className={styles.header}>
          <span className={styles.title}>{title ?? language ?? 'Code'}</span>
          {copyable ? (
            <button
              type="button"
              className={styles.copy}
              onClick={copy}
              aria-label={copied ? 'Copied' : 'Copy code'}
            >
              {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
            </button>
          ) : null}
        </figcaption>
      ) : null}
      <pre className={styles.pre}>
        <code className={styles.code}>{code}</code>
      </pre>
    </figure>
  )
}
