import * as React from 'react'
import { ChevronRight } from 'lucide-react'

import { cx } from '~/lib/cx'
import styles from './tree-view.module.scss'

export type TreeNode = {
  id: string
  label: React.ReactNode
  icon?: React.ReactNode
  children?: TreeNode[]
}

type FlatNode = {
  node: TreeNode
  depth: number
  parentId: string | null
  hasChildren: boolean
  expanded: boolean
}

function flatten(
  nodes: TreeNode[],
  expanded: Set<string>,
  depth = 0,
  parentId: string | null = null,
  out: FlatNode[] = [],
): FlatNode[] {
  for (const node of nodes) {
    const hasChildren = Boolean(node.children?.length)
    const isExpanded = expanded.has(node.id)
    out.push({ node, depth, parentId, hasChildren, expanded: isExpanded })
    if (hasChildren && isExpanded) {
      flatten(node.children!, expanded, depth + 1, node.id, out)
    }
  }
  return out
}

export interface TreeViewProps {
  nodes: TreeNode[]
  defaultExpanded?: string[]
  selectedId?: string
  onSelect?: (node: TreeNode) => void
  label?: string
  className?: string
}

export function TreeView({
  nodes,
  defaultExpanded = [],
  selectedId,
  onSelect,
  label = 'Tree',
  className,
}: TreeViewProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(
    () => new Set(defaultExpanded),
  )
  const refs = React.useRef<Map<string, HTMLDivElement>>(new Map())
  const rows = React.useMemo(() => flatten(nodes, expanded), [nodes, expanded])

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const focusRow = (id: string) => {
    refs.current.get(id)?.focus()
  }

  const onKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    row: FlatNode,
    index: number,
  ) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const next = rows[index + 1]
      if (next) focusRow(next.node.id)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      const prev = rows[index - 1]
      if (prev) focusRow(prev.node.id)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      if (row.hasChildren && !row.expanded) toggle(row.node.id)
      else if (row.hasChildren && row.expanded) {
        const next = rows[index + 1]
        if (next && next.depth > row.depth) focusRow(next.node.id)
      }
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      if (row.hasChildren && row.expanded) toggle(row.node.id)
      else if (row.parentId) focusRow(row.parentId)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (row.hasChildren) toggle(row.node.id)
      onSelect?.(row.node)
    }
  }

  return (
    <div role="tree" aria-label={label} className={cx(styles.root, className)}>
      {rows.map((row, index) => {
        const selected = row.node.id === selectedId

        return (
          <div
            key={row.node.id}
            ref={(node) => {
              if (node) refs.current.set(row.node.id, node)
              else refs.current.delete(row.node.id)
            }}
            role="treeitem"
            aria-level={row.depth + 1}
            aria-expanded={row.hasChildren ? row.expanded : undefined}
            aria-selected={selected}
            tabIndex={index === 0 ? 0 : -1}
            onClick={() => {
              onSelect?.(row.node)
              if (row.hasChildren) toggle(row.node.id)
            }}
            onKeyDown={(event) => onKeyDown(event, row, index)}
            className={cx(styles.row, selected && styles.selected)}
            style={{ paddingLeft: `${row.depth * 16 + 8}px` }}
          >
            {row.hasChildren ? (
              <ChevronRight
                className={cx(
                  styles.chevron,
                  row.expanded && styles.chevronOpen,
                )}
                aria-hidden
              />
            ) : (
              <span className={styles.chevronSpacer} aria-hidden />
            )}
            {row.node.icon ? (
              <span className={styles.icon} aria-hidden>
                {row.node.icon}
              </span>
            ) : null}
            <span className={styles.label}>{row.node.label}</span>
          </div>
        )
      })}
    </div>
  )
}
