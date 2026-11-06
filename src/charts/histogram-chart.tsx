import { bin, scaleLinear } from 'd3'
import { useState, type ReactNode } from 'react'

import { cx } from '~/lib/cx'
import styles from './charts.module.scss'
import { ChartFrame } from './chart-frame'
import { ChartTooltip } from './chart-tooltip'
import { useAnimatedProgress } from './use-animated-progress'
import { compactNumber } from './chart-utils'
import type { ChartSize } from './chart-types'

function HistogramCanvas({
  values,
  bins,
  size,
  animate,
  valueFormat,
}: {
  values: number[]
  bins: number
  size: ChartSize
  animate: boolean
  valueFormat: (value: number) => string
}) {
  const [active, setActive] = useState<number | null>(null)
  const progress = useAnimatedProgress({
    enabled: animate,
    resetKey: `${values.length}:${bins}:${values[0]}:${values[values.length - 1]}`,
  })

  const width = size.width
  const height = size.height
  const compact = width < 420
  const margin = { top: 12, right: 12, bottom: compact ? 28 : 34, left: compact ? 36 : 44 }
  const innerW = Math.max(1, width - margin.left - margin.right)
  const innerH = Math.max(1, height - margin.top - margin.bottom)

  const extent: [number, number] = values.length
    ? [Math.min(...values), Math.max(...values)]
    : [0, 1]
  const bucket = bin().domain(extent).thresholds(bins)
  const result = bucket(values)
  const x = scaleLinear()
    .domain([extent[0], extent[1] === extent[0] ? extent[0] + 1 : extent[1]])
    .range([0, innerW])
  const maxCount = Math.max(1, ...result.map((item) => item.length))
  const y = scaleLinear().domain([0, maxCount]).nice().range([innerH, 0])
  const ticks = y.ticks(compact ? 3 : 4)
  const activeBin = active != null ? result[active] : null

  return (
    <>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label="Histogram. Use the data table below for exact values."
        tabIndex={0}
        className={styles.canvas}
      >
        <title>{`Histogram with ${result.length} bins`}</title>
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
          {result.map((item, index) => {
            const x0 = x(item.x0 ?? extent[0])
            const x1 = x(item.x1 ?? extent[1])
            const barHeight = (innerH - y(item.length)) * progress
            return (
              <rect
                key={index}
                x={x0 + 1}
                y={innerH - barHeight}
                width={Math.max(1, x1 - x0 - 2)}
                height={Math.max(1, barHeight)}
                rx={2}
                fill="hsl(var(--chart-1))"
                opacity={active != null && active !== index ? 0.5 : 0.9}
                onPointerEnter={() => setActive(index)}
                onPointerLeave={() => setActive(null)}
                className={cx(styles.hit, styles.fade)}
              />
            )
          })}
        </g>
      </svg>

      {activeBin ? (
        <ChartTooltip
          x={margin.left + x(activeBin.x0 ?? extent[0])}
          y={margin.top + y(activeBin.length)}
          width={width}
        >
          <p className={styles.tooltipTitle}>
            {compactNumber(activeBin.x0 ?? 0)} – {compactNumber(activeBin.x1 ?? 0)}
          </p>
          <p className={styles.tooltipRow}>{activeBin.length} values</p>
        </ChartTooltip>
      ) : null}
    </>
  )
}

export function HistogramChart({
  values,
  bins = 12,
  height = 240,
  title,
  description,
  className,
  animate = true,
  valueFormat = compactNumber,
  ariaLabel,
}: {
  values: number[]
  bins?: number
  height?: number
  title?: ReactNode
  description?: ReactNode
  className?: string
  animate?: boolean
  valueFormat?: (value: number) => string
  ariaLabel?: string
}) {
  const extent: [number, number] = values.length
    ? [Math.min(...values), Math.max(...values)]
    : [0, 1]
  const result = bin().domain(extent).thresholds(bins)(values)

  return (
    <ChartFrame
      title={title}
      description={description}
      height={height}
      className={className}
      aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
      empty={values.length === 0}
      table={{
        caption: typeof title === 'string' ? title : 'Histogram data',
        columns: [
          {
            key: 'range',
            label: 'Range',
          },
          { key: 'count', label: 'Count' },
        ],
        rows: result.map((item) => ({
          range: `${valueFormat(item.x0 ?? 0)} – ${valueFormat(item.x1 ?? 0)}`,
          count: item.length,
        })),
      }}
    >
      {(size) => (
        <HistogramCanvas
          values={values}
          bins={bins}
          size={size}
          animate={animate}
          valueFormat={valueFormat}
        />
      )}
    </ChartFrame>
  )
}
