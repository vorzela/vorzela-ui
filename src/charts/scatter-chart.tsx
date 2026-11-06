import { scaleLinear } from 'd3'
import { useState, type ReactNode } from 'react'

import { cx } from '~/lib/cx'
import styles from './charts.module.scss'
import { ChartFrame } from './chart-frame'
import { ChartTooltip } from './chart-tooltip'
import { useAnimatedProgress } from './use-animated-progress'
import {
  buildTableRows,
  compactNumber,
  extentOf,
  labelOf,
  numeric,
  seriesColor,
} from './chart-utils'
import type { ChartDatum, ChartSeries, ChartSize } from './chart-types'

export type ScatterChartProps = {
  data: ChartDatum[]
  xKey: string
  yKey: string
  sizeKey?: string
  series?: ChartSeries[]
  height?: number
  title?: ReactNode
  description?: ReactNode
  className?: string
  showGrid?: boolean
  animate?: boolean
  xFormat?: (value: number) => string
  yFormat?: (value: number) => string
  ariaLabel?: string
}

function ScatterCanvas({
  data,
  xKey,
  yKey,
  sizeKey,
  series,
  size,
  showGrid,
  animate,
  xFormat,
  yFormat,
}: {
  data: ChartDatum[]
  xKey: string
  yKey: string
  sizeKey?: string
  series: ChartSeries[]
  size: ChartSize
  showGrid: boolean
  animate: boolean
  xFormat: (value: number) => string
  yFormat: (value: number) => string
}) {
  const [active, setActive] = useState<number | null>(null)
  const resetKey = `${data.length}:${data[0]?.[xKey]}:${data[data.length - 1]?.[xKey]}`
  const progress = useAnimatedProgress({ enabled: animate, resetKey })

  const width = size.width
  const height = size.height
  const compact = width < 420
  const margin = { top: 12, right: 12, bottom: compact ? 26 : 32, left: compact ? 36 : 46 }
  const innerW = Math.max(1, width - margin.left - margin.right)
  const innerH = Math.max(1, height - margin.top - margin.bottom)

  const xValues = data.map((datum) => numeric(datum[xKey]) ?? 0)
  const yValues = data.map((datum) => numeric(datum[yKey]) ?? 0)
  const xDomain = extentOf(xValues)
  const yDomain = extentOf(yValues)
  const x = scaleLinear().domain(xDomain).nice().range([0, innerW])
  const y = scaleLinear().domain(yDomain).nice().range([innerH, 0])
  const xTicks = x.ticks(compact ? 3 : 4)
  const yTicks = y.ticks(compact ? 3 : 4)
  const maxSize = sizeKey
    ? Math.max(...data.map((datum) => numeric(datum[sizeKey]) ?? 1), 1)
    : 1
  const radius = (datum: ChartDatum) => {
    if (!sizeKey) return 4
    const value = numeric(datum[sizeKey]) ?? 1
    return 3 + Math.sqrt(value / maxSize) * 10
  }

  const activeDatum = active != null ? data[active] : null
  const activeX = activeDatum ? x(numeric(activeDatum[xKey]) ?? 0) : 0
  const activeY = activeDatum ? y(numeric(activeDatum[yKey]) ?? 0) : 0

  return (
    <>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label="Scatter chart. Use the data table below for exact values."
        tabIndex={0}
        className={styles.canvas}
      >
        <title>{`Scatter chart with ${data.length} points`}</title>
        <desc>Equivalent data is available in the data table below the chart.</desc>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {showGrid
            ? yTicks.map((tick) => (
                <line
                  key={tick}
                  x1={0}
                  x2={innerW}
                  y1={y(tick)}
                  y2={y(tick)}
                  strokeDasharray="3 3"
                  className={styles.gridLine}
                />
              ))
            : null}

          {yTicks.map((tick) => (
            <text
              key={tick}
              x={-8}
              y={y(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className={styles.tickNumeric}
            >
              {yFormat(tick)}
            </text>
          ))}
          {xTicks.map((tick) => (
            <text
              key={tick}
              x={x(tick)}
              y={innerH + 16}
              textAnchor="middle"
              className={styles.tickNumeric}
            >
              {xFormat(tick)}
            </text>
          ))}

          {data.map((datum, index) => {
            const color = seriesColor(series, index % Math.max(1, series.length))
            const r = radius(datum) * progress
            return (
              <circle
                key={index}
                cx={x(numeric(datum[xKey]) ?? 0)}
                cy={y(numeric(datum[yKey]) ?? 0)}
                r={Math.max(0.5, r)}
                fill={color}
                fillOpacity={active != null && active !== index ? 0.45 : 0.8}
                stroke={color}
                strokeWidth={1}
                onPointerEnter={() => setActive(index)}
                onPointerLeave={() => setActive(null)}
                className={cx(styles.hit, styles.fadeFill)}
              />
            )
          })}
        </g>
      </svg>

      {activeDatum ? (
        <ChartTooltip x={margin.left + activeX} y={margin.top + activeY} width={width}>
          <p className={styles.tooltipTitle}>
            {xFormat(numeric(activeDatum[xKey]) ?? 0)} ·{' '}
            {yFormat(numeric(activeDatum[yKey]) ?? 0)}
          </p>
          {sizeKey ? (
            <p className={styles.tooltipRow}>
              Size: {compactNumber(numeric(activeDatum[sizeKey]) ?? 0)}
            </p>
          ) : null}
        </ChartTooltip>
      ) : null}
    </>
  )
}

export function ScatterChart({
  data,
  xKey,
  yKey,
  sizeKey,
  series = [{ key: yKey, label: yKey }],
  height = 240,
  title,
  description,
  className,
  showGrid = true,
  animate = true,
  xFormat = compactNumber,
  yFormat = compactNumber,
  ariaLabel,
}: ScatterChartProps) {
  return (
    <ChartFrame
      title={title}
      description={description}
      height={height}
      className={className}
      aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
      empty={data.length === 0}
      legend={
        series.length > 1
          ? series.map((item, index) => ({
              label: labelOf(series, index),
              color: item.color ?? seriesColor(series, index),
              shape: 'circle' as const,
            }))
          : undefined
      }
      table={{
        caption: typeof title === 'string' ? title : 'Chart data',
        columns: [
          { key: xKey, label: xKey },
          { key: yKey, label: yKey },
          ...(sizeKey ? [{ key: sizeKey, label: sizeKey }] : []),
        ],
        rows: buildTableRows(data, [
          { key: xKey },
          { key: yKey },
          ...(sizeKey ? [{ key: sizeKey }] : []),
        ]),
      }}
    >
      {(size) => (
        <ScatterCanvas
          data={data}
          xKey={xKey}
          yKey={yKey}
          sizeKey={sizeKey}
          series={series}
          size={size}
          showGrid={showGrid}
          animate={animate}
          xFormat={xFormat}
          yFormat={yFormat}
        />
      )}
    </ChartFrame>
  )
}
