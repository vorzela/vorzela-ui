import type { ReactNode } from 'react'

import { cx } from '~/lib/cx'
import styles from './markdown.module.scss'

export interface MarkdownProps {
  source: string
  className?: string
}

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g)
  return parts.filter(Boolean).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index} className={styles.code}>{part.slice(1, -1)}</code>
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

/** Small, safe Markdown subset: headings, lists, quotes, code fences and inline marks. */
export function Markdown({ source, className }: MarkdownProps) {
  const blocks: ReactNode[] = []
  const lines = source.split(/\r?\n/)
  let index = 0

  while (index < lines.length) {
    const line = lines[index] ?? ''
    if (!line.trim()) {
      index += 1
      continue
    }

    if (line.startsWith('```')) {
      const language = line.slice(3).trim()
      const body: string[] = []
      index += 1
      while (index < lines.length && !(lines[index] ?? '').startsWith('```')) {
        body.push(lines[index] ?? '')
        index += 1
      }
      index += 1
      blocks.push(
        <pre key={blocks.length} className={styles.pre}>
          <code data-language={language || undefined}>{body.join('\n')}</code>
        </pre>,
      )
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      const level = heading[1]!.length
      const Tag = `h${level}` as 'h1'
      blocks.push(<Tag key={blocks.length}>{inline(heading[2] ?? '')}</Tag>)
      index += 1
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^[-*]\s+/.test(lines[index] ?? '')) {
        items.push((lines[index] ?? '').replace(/^[-*]\s+/, ''))
        index += 1
      }
      blocks.push(
        <ul key={blocks.length}>
          {items.map((item, itemIndex) => <li key={itemIndex}>{inline(item)}</li>)}
        </ul>,
      )
      continue
    }

    if (line.startsWith('> ')) {
      blocks.push(<blockquote key={blocks.length}>{inline(line.slice(2))}</blockquote>)
      index += 1
      continue
    }

    const paragraph: string[] = [line]
    index += 1
    while (index < lines.length && (lines[index] ?? '').trim() && !/^(#{1,6}\s|[-*]\s|>\s|```)/.test(lines[index] ?? '')) {
      paragraph.push(lines[index] ?? '')
      index += 1
    }
    blocks.push(<p key={blocks.length}>{inline(paragraph.join(' '))}</p>)
  }

  return <div className={cx(styles.root, className)}>{blocks}</div>
}
