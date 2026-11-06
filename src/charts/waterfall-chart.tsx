import { scaleBand, scaleLinear } from 'd3'
import { useState, type ReactNode } from 'react'

import styles from './charts.module.scss'
import { ChartFrame } from './chart-frame'
import { ChartTooltip } from './chart-tooltip'
import { useAnimatedProgress } from './use-animated-progress'
import { compactNumber } from './chart-utils'
import type { ChartSize } from './chart-types'

export type WaterfallDatum = {
  label: string
  value: number
  total?: boolean
}

function WaterfallCanvas({
  data,
  size,
  animate,
  valueFormat,
}: {
  data: WaterfallDatum[]
  size: ChartSize
  animate: boolean
  valueFormat: (value: number) => string
}) {
  const [active, setActive] = useState<number | null>(null)
  const progress = useAnimatedProgress({
    enabled: animate,
    resetKey: `${data.length}:${data.map((item) => item.value).join(',')}`,
  })

  const width = size.width
  const height = size.height
  const compact = width < 420
  const margin = { top: 12, right: 12, bottom: compact ? 30 : 36, left: compact ? 36 : 48 }
  const innerW = Math.max(1, width - margin.left - margin.right)
  const innerH = Math.max(1, height - margin.top - margin.bottom)

  const resolved = data.reduce<
    Array<WaterfallDatum & { start: number; end: number }>
  >((rows, item) => {
    const previous = rows.at(-1)
    if (item.total) {
      rows.push({ ...item, start: 0, end: item.value })
      return rows
    }
    const start = previous?.end ?? 0
    rows.push({ ...item, start, end: start + item.value })
    return rows
  }, [])

  const values = resolved.flatMap((item) => [item.start, item.end, 0])
  const min = Math.min(...values)
  const max = Math.max(...values)
  const y = scaleLinear()
    .domain([min, max === min ? min + 1 : max])
    .nice()
    .range([innerH, 0])
  const x = scaleBand<string>()
    .domain(data.map((item) => item.label))
    .range([0, innerW])
    .padding(0.28)
  const ticks = y.ticks(compact ? 3 : 4)
  const activeItem = active != null ? resolved[active] : null

  return (
    <>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label="Waterfall chart. Use the data table below for exact values."
        tabIndex={0}
        className={styles.canvas}
      >
        <title>{`Waterfall chart with ${data.length} steps`}</title>
        <desc>Equivalent data is available in the data table below the chart.</desc>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={0}
                x2={innerW}
                y1={y(tick)}
                y2={y(tick)}
                strokeDasharray="3 3"
                className={styles.gridLine}
              />
              <text
                x={-8}
                y={y(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                className={styles.tickNumeric}
              >
                {valueFormat(tick)}
              </text>
            </g>
          ))}

          {resolved.map((item, index) => {
            const animatedEnd = item.start + (item.end - item.start) * progress
            const top = Math.min(y(item.start), y(animatedEnd))
            const bottom = Math.max(y(item.start), y(animatedEnd))
            const color = item.total
              ? 'hsl(var(--chart-1))'
              : item.value >= 0
                ? 'hsl(var(--success))'
                : 'hsl(var(--destructive))'
            return (
              <g
                key={`${item.label}-${index}`}
                onPointerEnter={() => setActive(index)}
                onPointerLeave={() => setActive(null)}
                className={styles.hit}
              >
                <rect
                  x={x(item.label) ?? 0}
                  y={top}
                  width={x.bandwidth()}
                  height={Math.max(1, bottom - top)}
                  rx={3}
                  fill={color}
                  opacity={0.9}
                />
                <text
                  x={(x(item.label) ?? 0) + x.bandwidth() / 2}
                  y={innerH + 16}
                  textAnchor="middle"
                  className={styles.tick}
                >
                  {item.label.length > 8 ? `${item.label.slice(0, 8)}…` : item.label}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      {activeItem ? (
        <ChartTooltip
          x={margin.left + (x(activeItem.label) ?? 0) + x.bandwidth() / 2}
          y={margin.top + Math.min(y(activeItem.start), y(activeItem.end))}
          width={width}
        >
          <p className={styles.tooltipTitle}>{activeItem.label}</p>
          <p className={styles.tooltipRow}>
            {valueFormat(activeItem.value)} → {valueFormat(activeItem.end)}
          </p>
        </ChartTooltip>
      ) : null}
    </>
  )
}

export function WaterfallChart({
  data,
  height = 280,
  title,
  description,
  className,
  animate = true,
  valueFormat = compactNumber,
  ariaLabel,
}: {
  data: WaterfallDatum[]
  height?: number
  title?: ReactNode
  description?: ReactNode
  className?: string
  animate?: boolean
  valueFormat?: (value: number) => string
  ariaLabel?: string
}) {
  const rows = data.reduce<Array<{ label: string; value: number; running: number }>>(
    (acc, item) => {
      const running = item.total ? item.value : (acc.at(-1)?.running ?? 0) + item.value
      acc.push({ label: item.label, value: item.value, running })
      return acc
    },
    [],
  )

  return (
    <ChartFrame
      title={title}
      description={description}
      height={height}
      className={className}
      aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
      empty={data.length === 0}
      table={{
        caption: typeof title === 'string' ? title : 'Waterfall data',
        columns: [
          { key: 'label', label: 'Step' },
          {
            key: 'value',
            label: 'Change',
            format: (value) => (typeof value === 'number' ? valueFormat(value) : ''),
          },
          {
            key: 'running',
            label: 'Running total',
            format: (value) => (typeof value === 'number' ? valueFormat(value) : ''),
          },
        ],
        rows,
      }}
    >
      {(size) => (
        <WaterfallCanvas
          data={data}
          size={size}
          animate={animate}
          valueFormat={valueFormat}
        />
      )}
    </ChartFrame>
  )
}
