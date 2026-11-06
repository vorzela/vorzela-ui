import { scaleBand, scaleLinear } from 'd3'
import { useState, type ReactNode } from 'react'

import styles from './charts.module.scss'
import { ChartFrame } from './chart-frame'
import { ChartTooltip } from './chart-tooltip'
import { useAnimatedProgress } from './use-animated-progress'
import {
  buildTableRows,
  compactNumber,
  extentOf,
  labelOf,
  seriesColor,
  seriesValues,
  stackedExtent,
  valueAt,
} from './chart-utils'
import type { ChartDatum, ChartSeries, ChartSize } from './chart-types'

export type BarChartProps = {
  data: ChartDatum[]
  xKey: string
  series: ChartSeries[]
  height?: number
  title?: ReactNode
  description?: ReactNode
  className?: string
  layout?: 'vertical' | 'horizontal'
  stacked?: boolean
  showGrid?: boolean
  animate?: boolean
  yFormat?: (value: number) => string
  xFormat?: (value: string) => string
  ariaLabel?: string
}

type ActiveBar = {
  datumIndex: number
  seriesIndex: number
  x: number
  y: number
}

function BarCanvas({
  data,
  xKey,
  series,
  size,
  layout,
  stacked,
  showGrid,
  animate,
  yFormat,
  xFormat,
}: {
  data: ChartDatum[]
  xKey: string
  series: ChartSeries[]
  size: ChartSize
  layout: 'vertical' | 'horizontal'
  stacked: boolean
  showGrid: boolean
  animate: boolean
  yFormat: (value: number) => string
  xFormat: (value: string) => string
}) {
  const [active, setActive] = useState<ActiveBar | null>(null)
  const resetKey = `${data.length}:${series.map((item) => item.key).join(',')}:${layout}:${stacked}`
  const progress = useAnimatedProgress({ enabled: animate, resetKey })

  const width = size.width
  const height = size.height
  const compact = width < 420
  const margin =
    layout === 'vertical'
      ? { top: 12, right: 12, bottom: compact ? 28 : 34, left: compact ? 34 : 44 }
      : { top: 12, right: 16, bottom: compact ? 24 : 30, left: compact ? 74 : 96 }
  const innerW = Math.max(1, width - margin.left - margin.right)
  const innerH = Math.max(1, height - margin.top - margin.bottom)

  const xValues = data.map((datum) => String(datum[xKey] ?? ''))
  const domain = stacked
    ? stackedExtent(data, series)
    : extentOf(seriesValues(data, series))
  const min = Math.min(0, domain[0])
  const max = Math.max(0, domain[1] === 0 ? 1 : domain[1])
  const valueScale = scaleLinear().domain([min, max]).nice()

  const band =
    layout === 'vertical'
      ? scaleBand<string>().domain(xValues).range([0, innerW]).padding(0.24)
      : scaleBand<string>().domain(xValues).range([0, innerH]).padding(0.24)
  const seriesBand = scaleBand<string>()
    .domain(series.map((item) => item.key))
    .range([0, band.bandwidth()])
    .padding(0.08)

  const tickCount = compact ? 3 : 4
  const ticks =
    layout === 'vertical'
      ? valueScale.range([innerH, 0]).ticks(tickCount)
      : valueScale.range([0, innerW]).ticks(tickCount)

  const bars: ReactNode[] = []
  const labelStep = Math.max(1, Math.ceil(xValues.length / (compact ? 4 : 7)))

  data.forEach((datum, datumIndex) => {
    const label = xValues[datumIndex]
    let positive = 0
    let negative = 0

    series.forEach((item, seriesIndex) => {
      const raw = valueAt(datum, item.key) ?? 0
      const value = raw * progress
      const color = seriesColor(series, seriesIndex)
      let barX = 0
      let barY = 0
      let barW = 0
      let barH = 0

      if (layout === 'vertical') {
        const groupX = band(label) ?? 0
        if (stacked) {
          const start = raw >= 0 ? positive : negative
          const end = start + value
          if (raw >= 0) positive = end
          else negative = end
          const yStart = valueScale.range([innerH, 0])(start)
          const yEnd = valueScale.range([innerH, 0])(end)
          barX = groupX
          barW = band.bandwidth()
          barY = Math.min(yStart, yEnd)
          barH = Math.abs(yStart - yEnd)
        } else {
          barX = groupX + (seriesBand(item.key) ?? 0)
          barW = seriesBand.bandwidth()
          const zero = valueScale.range([innerH, 0])(0)
          const y = valueScale.range([innerH, 0])(value)
          barY = Math.min(zero, y)
          barH = Math.abs(zero - y)
        }
      } else {
        const groupY = band(label) ?? 0
        const zero = valueScale.range([0, innerW])(0)
        if (stacked) {
          const start = raw >= 0 ? positive : negative
          const end = start + value
          if (raw >= 0) positive = end
          else negative = end
          const xStart = valueScale.range([0, innerW])(start)
          const xEnd = valueScale.range([0, innerW])(end)
          barX = Math.min(xStart, xEnd)
          barW = Math.abs(xStart - xEnd)
          barY = groupY
          barH = band.bandwidth()
        } else {
          const x = valueScale.range([0, innerW])(value)
          barX = Math.min(zero, x)
          barW = Math.abs(zero - x)
          barY = groupY + (seriesBand(item.key) ?? 0)
          barH = seriesBand.bandwidth()
        }
      }

      bars.push(
        <rect
          key={`${datumIndex}-${item.key}`}
          x={barX}
          y={barY}
          width={Math.max(0, barW)}
          height={Math.max(0, barH)}
          rx={Math.min(4, barW / 3, barH / 3)}
          fill={color}
          opacity={
            active &&
            (active.datumIndex !== datumIndex || active.seriesIndex !== seriesIndex)
              ? 0.55
              : 1
          }
          onPointerEnter={() =>
            setActive({
              datumIndex,
              seriesIndex,
              x: margin.left + barX + barW / 2,
              y: margin.top + barY,
            })
          }
          onPointerLeave={() => setActive(null)}
          className={styles.fade}
        />,
      )
    })

    if (layout === 'vertical') {
      if (datumIndex % labelStep === 0) {
        bars.push(
          <text
            key={`label-${label}`}
            x={(band(label) ?? 0) + band.bandwidth() / 2}
            y={innerH + 16}
            textAnchor="middle"
            className={styles.tick}
          >
            {xFormat(label)}
          </text>,
        )
      }
    } else if (datumIndex % labelStep === 0) {
      bars.push(
        <text
          key={`label-${label}`}
          x={-8}
          y={(band(label) ?? 0) + band.bandwidth() / 2}
          textAnchor="end"
          dominantBaseline="middle"
          className={styles.tick}
        >
          {xFormat(label)}
        </text>,
      )
    }
  })

  const activeDatum = active ? data[active.datumIndex] : null
  const activeSeries = active ? series[active.seriesIndex] : null

  return (
    <>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label="Bar chart. Use the data table below for exact values."
        tabIndex={0}
        onPointerLeave={() => setActive(null)}
        className={styles.canvas}
      >
        <title>{`Bar chart with ${series.length} series and ${data.length} categories`}</title>
        <desc>Equivalent data is available in the data table below the chart.</desc>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {showGrid
            ? ticks.map((tick) => {
                const position =
                  layout === 'vertical'
                    ? valueScale.range([innerH, 0])(tick)
                    : valueScale.range([0, innerW])(tick)
                return layout === 'vertical' ? (
                  <line
                    key={tick}
                    x1={0}
                    x2={innerW}
                    y1={position}
                    y2={position}
                    strokeDasharray="3 3"
                    className={styles.gridLine}
                  />
                ) : (
                  <line
                    key={tick}
                    x1={position}
                    x2={position}
                    y1={0}
                    y2={innerH}
                    strokeDasharray="3 3"
                    className={styles.gridLine}
                  />
                )
              })
            : null}

          {ticks.map((tick) =>
            layout === 'vertical' ? (
              <text
                key={tick}
                x={-8}
                y={valueScale.range([innerH, 0])(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                className={styles.tickNumeric}
              >
                {yFormat(tick)}
              </text>
            ) : (
              <text
                key={tick}
                x={valueScale.range([0, innerW])(tick)}
                y={innerH + 16}
                textAnchor="middle"
                className={styles.tickNumeric}
              >
                {yFormat(tick)}
              </text>
            ),
          )}

          {bars}
        </g>
      </svg>

      {active && activeDatum && activeSeries ? (
        <ChartTooltip x={active.x} y={active.y} width={width}>
          <p className={styles.tooltipTitle}>
            {xFormat(String(activeDatum[xKey] ?? ''))}
          </p>
          <p className={styles.tooltipRow}>
            <span
              className={styles.tooltipDot}
              style={{ background: seriesColor(series, active.seriesIndex) }}
              aria-hidden
            />
            {labelOf(series, active.seriesIndex)}:{' '}
            <span className={styles.tooltipValue}>
              {yFormat(valueAt(activeDatum, activeSeries.key) ?? 0)}
            </span>
          </p>
        </ChartTooltip>
      ) : null}
    </>
  )
}

export function BarChart({
  data,
  xKey,
  series,
  height = 240,
  title,
  description,
  className,
  layout = 'vertical',
  stacked = false,
  showGrid = true,
  animate = true,
  yFormat = compactNumber,
  xFormat = (value) => value,
  ariaLabel,
}: BarChartProps) {
  return (
    <ChartFrame
      title={title}
      description={description}
      height={height}
      className={className}
      aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
      empty={data.length === 0}
      legend={series.map((item, index) => ({
        label: labelOf(series, index),
        color: item.color ?? seriesColor(series, index),
        shape: 'square',
      }))}
      table={{
        caption: typeof title === 'string' ? title : 'Chart data',
        columns: [
          { key: xKey, label: 'Category' },
          ...series.map((item, index) => ({
            key: item.key,
            label: labelOf(series, index),
            format: (value: unknown) => (typeof value === 'number' ? yFormat(value) : ''),
          })),
        ],
        rows: buildTableRows(data, series),
      }}
    >
      {(size) => (
        <BarCanvas
          data={data}
          xKey={xKey}
          series={series}
          size={size}
          layout={layout}
          stacked={stacked}
          showGrid={showGrid}
          animate={animate}
          yFormat={yFormat}
          xFormat={xFormat}
        />
      )}
    </ChartFrame>
  )
}
