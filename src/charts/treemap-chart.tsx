import { hierarchy, treemap, treemapSquarify, type HierarchyRectangularNode } from 'd3'
import { useState, type ReactNode } from 'react'

import styles from './charts.module.scss'
import { ChartFrame } from './chart-frame'
import { ChartTooltip } from './chart-tooltip'
import { useAnimatedProgress } from './use-animated-progress'
import { chartColor, compactNumber } from './chart-utils'
import type { ChartSize } from './chart-types'

export type TreemapNode = {
  name: string
  value?: number
  children?: TreemapNode[]
}

type Leaf = HierarchyRectangularNode<TreemapNode>

function leavesOf(root: HierarchyRectangularNode<TreemapNode>): Leaf[] {
  return root.leaves() as Leaf[]
}

function TreemapCanvas({
  data,
  size,
  animate,
  valueFormat,
}: {
  data: TreemapNode
  size: ChartSize
  animate: boolean
  valueFormat: (value: number) => string
}) {
  const [active, setActive] = useState<Leaf | null>(null)
  const progress = useAnimatedProgress({
    enabled: animate,
    resetKey: JSON.stringify(data).slice(0, 80),
  })

  const width = size.width
  const height = size.height
  const root = hierarchy(data)
    .sum((node) => node.value ?? 0)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
  treemap<TreemapNode>()
    .size([width, height])
    .paddingInner(3)
    .paddingOuter(1)
    .tile(treemapSquarify)(root)

  const leaves = leavesOf(root as unknown as HierarchyRectangularNode<TreemapNode>)

  return (
    <>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label="Treemap. Use the data table below for exact values."
        tabIndex={0}
        className={styles.canvas}
      >
        <title>{`Treemap with ${leaves.length} leaves`}</title>
        <desc>Equivalent data is available in the data table below the chart.</desc>
        {leaves.map((leaf, index) => {
          const nodeWidth = leaf.x1 - leaf.x0
          const nodeHeight = leaf.y1 - leaf.y0
          const showLabel = nodeWidth > 64 && nodeHeight > 30
          return (
            <g
              key={leaf.data.name + index}
              onPointerEnter={() => setActive(leaf)}
              onPointerLeave={() => setActive(null)}
              className={styles.hit}
            >
              <rect
                x={leaf.x0}
                y={leaf.y0}
                width={Math.max(0, nodeWidth)}
                height={Math.max(0, nodeHeight)}
                rx={4}
                fill={chartColor(index)}
                fillOpacity={0.2 + 0.75 * progress}
              />
              {showLabel ? (
                <>
                  <text x={leaf.x0 + 6} y={leaf.y0 + 15} className={styles.labelOnMark}>
                    {leaf.data.name.length > 14
                      ? `${leaf.data.name.slice(0, 14)}…`
                      : leaf.data.name}
                  </text>
                  <text
                    x={leaf.x0 + 6}
                    y={leaf.y0 + 28}
                    className={styles.labelOnMarkMuted}
                  >
                    {valueFormat(leaf.value ?? 0)}
                  </text>
                </>
              ) : null}
            </g>
          )
        })}
      </svg>

      {active ? (
        <ChartTooltip
          x={active.x0 + (active.x1 - active.x0) / 2}
          y={active.y0}
          width={width}
        >
          <p className={styles.tooltipTitle}>{active.data.name}</p>
          <p className={styles.tooltipRow}>{valueFormat(active.value ?? 0)}</p>
        </ChartTooltip>
      ) : null}
    </>
  )
}

export function TreemapChart({
  data,
  height = 280,
  title,
  description,
  className,
  animate = true,
  valueFormat = compactNumber,
  ariaLabel,
}: {
  data: TreemapNode
  height?: number
  title?: ReactNode
  description?: ReactNode
  className?: string
  animate?: boolean
  valueFormat?: (value: number) => string
  ariaLabel?: string
}) {
  const rows: Array<Record<string, string | number>> = []
  const walk = (node: TreemapNode) => {
    if (node.children?.length) node.children.forEach(walk)
    else rows.push({ name: node.name, value: node.value ?? 0 })
  }
  walk(data)

  return (
    <ChartFrame
      title={title}
      description={description}
      height={height}
      className={className}
      aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
      empty={rows.length === 0}
      table={{
        caption: typeof title === 'string' ? title : 'Treemap data',
        columns: [
          { key: 'name', label: 'Item' },
          {
            key: 'value',
            label: 'Value',
            format: (value: unknown) =>
              typeof value === 'number' ? valueFormat(value) : '',
          },
        ],
        rows,
      }}
    >
      {(size) => (
        <TreemapCanvas
          data={data}
          size={size}
          animate={animate}
          valueFormat={valueFormat}
        />
      )}
    </ChartFrame>
  )
}
