import { sankey, sankeyLinkHorizontal, type SankeyGraph } from 'd3-sankey'
import { useMemo, useState, type ReactNode } from 'react'

import styles from './charts.module.scss'
import { ChartFrame } from './chart-frame'
import { ChartTooltip } from './chart-tooltip'
import { useAnimatedProgress } from './use-animated-progress'
import { chartColor, compactNumber } from './chart-utils'
import type { ChartSize } from './chart-types'

export type SankeyNode = { id: string; name: string }
export type SankeyLink = { source: string; target: string; value: number }

type LayoutNode = SankeyNode & {
  x0?: number
  x1?: number
  y0?: number
  y1?: number
}
type LayoutLink = SankeyLink & {
  width?: number
  source: LayoutNode
  target: LayoutNode
}

function SankeyCanvas({
  nodes,
  links,
  size,
  animate,
  valueFormat,
}: {
  nodes: SankeyNode[]
  links: SankeyLink[]
  size: ChartSize
  animate: boolean
  valueFormat: (value: number) => string
}) {
  const [active, setActive] = useState<LayoutLink | null>(null)
  const progress = useAnimatedProgress({
    enabled: animate,
    resetKey: `${nodes.length}:${links.length}`,
  })

  const graph = useMemo<SankeyGraph<LayoutNode, LayoutLink>>(() => {
    const clonedNodes = nodes.map((node) => ({ ...node })) as LayoutNode[]
    const byId = new Map(clonedNodes.map((node) => [node.id, node]))
    const clonedLinks = links.map((link) => ({
      ...link,
      source: byId.get(link.source) ?? (link.source as unknown as LayoutNode),
      target: byId.get(link.target) ?? (link.target as unknown as LayoutNode),
    })) as LayoutLink[]
    const generator = sankey<LayoutNode, LayoutLink>()
      .nodeId((node) => node.id)
      .nodeWidth(10)
      .nodePadding(10)
      .extent([
        [0, 4],
        [Math.max(1, size.width - 4), Math.max(1, size.height - 4)],
      ])
    return generator({ nodes: clonedNodes, links: clonedLinks })
  }, [links, nodes, size.height, size.width])

  const linkPath = sankeyLinkHorizontal<LayoutNode, LayoutLink>()

  return (
    <>
      <svg
        width={size.width}
        height={size.height}
        viewBox={`0 0 ${size.width} ${size.height}`}
        role="group"
        aria-label="Sankey diagram. Use the data table below for exact values."
        tabIndex={0}
        className={styles.canvas}
      >
        <title>{`Sankey diagram with ${nodes.length} nodes and ${links.length} links`}</title>
        <desc>Equivalent data is available in the data table below the chart.</desc>

        {graph.links.map((link, index) => (
          <path
            key={index}
            d={linkPath(link) ?? ''}
            fill="none"
            stroke={chartColor(index)}
            strokeOpacity={0.25 + 0.55 * progress}
            strokeWidth={Math.max(1, link.width ?? 1)}
            onPointerEnter={() => setActive(link)}
            onPointerLeave={() => setActive(null)}
            className={styles.hit}
          />
        ))}

        {graph.nodes.map((node, index) => (
          <g key={node.id}>
            <rect
              x={node.x0 ?? 0}
              y={node.y0 ?? 0}
              width={Math.max(1, (node.x1 ?? 0) - (node.x0 ?? 0))}
              height={Math.max(1, (node.y1 ?? 0) - (node.y0 ?? 0))}
              rx={2}
              fill={chartColor(index)}
              fillOpacity={0.3 + 0.7 * progress}
            />
            <text
              x={
                (node.x0 ?? 0) < size.width / 2
                  ? (node.x1 ?? 0) + 4
                  : (node.x0 ?? 0) - 4
              }
              y={((node.y0 ?? 0) + (node.y1 ?? 0)) / 2}
              textAnchor={(node.x0 ?? 0) < size.width / 2 ? 'start' : 'end'}
              dominantBaseline="middle"
              className={styles.tick}
            >
              {node.name}
            </text>
          </g>
        ))}
      </svg>

      {active ? (
        <ChartTooltip
          x={((active.source.x1 ?? 0) + (active.target.x0 ?? 0)) / 2}
          y={((active.source.y0 ?? 0) + (active.target.y0 ?? 0)) / 2}
          width={size.width}
        >
          <p className={styles.tooltipTitle}>
            {active.source.name} → {active.target.name}
          </p>
          <p className={styles.tooltipRow}>{valueFormat(active.value)}</p>
        </ChartTooltip>
      ) : null}
    </>
  )
}

export function SankeyChart({
  nodes,
  links,
  height = 300,
  title,
  description,
  className,
  animate = true,
  valueFormat = compactNumber,
  ariaLabel,
}: {
  nodes: SankeyNode[]
  links: SankeyLink[]
  height?: number
  title?: ReactNode
  description?: ReactNode
  className?: string
  animate?: boolean
  valueFormat?: (value: number) => string
  ariaLabel?: string
}) {
  const nodeNames = new Map(nodes.map((node) => [node.id, node.name]))

  return (
    <ChartFrame
      title={title}
      description={description}
      height={height}
      className={className}
      aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
      empty={nodes.length === 0 || links.length === 0}
      table={{
        caption: typeof title === 'string' ? title : 'Sankey data',
        columns: [
          { key: 'source', label: 'Source' },
          { key: 'target', label: 'Target' },
          {
            key: 'value',
            label: 'Value',
            format: (value: unknown) =>
              typeof value === 'number' ? valueFormat(value) : '',
          },
        ],
        rows: links.map((link) => ({
          source: nodeNames.get(link.source) ?? link.source,
          target: nodeNames.get(link.target) ?? link.target,
          value: link.value,
        })),
      }}
    >
      {(size) => (
        <SankeyCanvas
          nodes={nodes}
          links={links}
          size={size}
          animate={animate}
          valueFormat={valueFormat}
        />
      )}
    </ChartFrame>
  )
}
