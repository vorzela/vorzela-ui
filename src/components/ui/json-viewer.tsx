import { ChevronRight } from 'lucide-react'

import { cx } from '~/lib/cx'
import styles from './json-viewer.module.scss'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function Primitive({ value }: { value: unknown }) {
  if (value === null) return <span className={styles.null}>null</span>
  if (typeof value === 'string')
    return <span className={styles.string}>&quot;{value}&quot;</span>
  if (typeof value === 'number')
    return <span className={styles.number}>{String(value)}</span>
  if (typeof value === 'boolean')
    return <span className={styles.boolean}>{String(value)}</span>
  return <span className={styles.other}>{String(value)}</span>
}

function JsonNode({
  name,
  value,
  depth,
  defaultExpandDepth,
}: {
  name?: string
  value: unknown
  depth: number
  defaultExpandDepth: number
}) {
  if (!isRecord(value) && !Array.isArray(value)) {
    return (
      <div
        className={styles.row}
        style={{ paddingLeft: depth * 14 + 16 }}
      >
        {name ? <span className={styles.key}>{name}:</span> : null}
        <Primitive value={value} />
      </div>
    )
  }

  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as const)
    : Object.entries(value)
  const open = depth < defaultExpandDepth

  return (
    <details open={open} className={styles.details}>
      <summary
        className={styles.summary}
        style={{ paddingLeft: depth * 14 + 4 }}
      >
        <ChevronRight className={styles.chevron} aria-hidden />
        {name ? <span className={styles.key}>{name}:</span> : null}
        <span className={styles.count}>
          {Array.isArray(value) ? `[${entries.length}]` : `{${entries.length}}`}
        </span>
      </summary>
      <div>
        {entries.map(([key, child]) => (
          <JsonNode
            key={key}
            name={key}
            value={child}
            depth={depth + 1}
            defaultExpandDepth={defaultExpandDepth}
          />
        ))}
      </div>
    </details>
  )
}

export interface JsonViewerProps {
  data: unknown
  label?: string
  defaultExpandDepth?: number
  className?: string
}

export function JsonViewer({
  data,
  label = 'JSON data',
  defaultExpandDepth = 2,
  className,
}: JsonViewerProps) {
  let safe: unknown = data
  try {
    JSON.stringify(data)
  } catch {
    safe = '[Circular or non-serializable value]'
  }

  return (
    <div
      role="group"
      aria-label={label}
      className={cx(styles.root, className)}
    >
      <JsonNode value={safe} depth={0} defaultExpandDepth={defaultExpandDepth} />
    </div>
  )
}
