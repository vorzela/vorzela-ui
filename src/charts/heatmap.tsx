import { interpolateBlues, scaleBand, scaleSequential } from 'd3'
import { useState, type ReactNode } from 'react'

import styles from './charts.module.scss'
import { ChartFrame } from './chart-frame'
import { ChartTooltip } from './chart-tooltip'
import { useAnimatedProgress } from './use-animated-progress'
import { compactNumber, extentOf, numeric } from './chart-utils'
import type { ChartDatum, ChartSize } from './chart-types'

export type HeatmapProps = {
  data: ChartDatum[]
  xKey?: string
  yKey?: string
  valueKey?: string
  height?: number
  title?: ReactNode
  description?: ReactNode
  className?: string
  animate?: boolean
  valueFormat?: (value: number) => string
  ariaLabel?: string
}

function HeatmapCanvas({
  data,
  xKey,
  yKey,
  valueKey,
  size,
  animate,
  valueFormat,
}: {
  data: ChartDatum[]
  xKey: string
  yKey: string
  valueKey: string
  size: ChartSize
  animate: boolean
  valueFormat: (value: number) => string
}) {
  const [active, setActive] = useState<number | null>(null)
  const progress = useAnimatedProgress({
    enabled: animate,
    resetKey: `${data.length}:${data[0]?.[valueKey]}:${data[data.length - 1]?.[valueKey]}`,
  })

  const width = size.width
  const height = size.height
  const margin = { top: 8, right: 8, bottom: 28, left: 72 }
  const innerW = Math.max(1, width - margin.left - margin.right)
  const innerH = Math.max(1, height - margin.top - margin.bottom)

  const xValues = Array.from(new Set(data.map((datum) => String(datum[xKey] ?? ''))))
  const yValues = Array.from(new Set(data.map((datum) => String(datum[yKey] ?? ''))))
  const x = scaleBand<string>().domain(xValues).range([0, innerW]).padding(0.04)
  const y = scaleBand<string>().domain(yValues).range([0, innerH]).padding(0.04)
  const values = data.map((datum) => numeric(datum[valueKey]) ?? 0)
  const domain = extentOf(values)
  const color = scaleSequential(interpolateBlues).domain(domain)

  const activeDatum = active != null ? data[active] : null

  return (
    <>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label="Heatmap. Use the data table below for exact values."
        tabIndex={0}
        className={styles.canvas}
      >
        <title>{`Heatmap with ${xValues.length} columns and ${yValues.length} rows`}</title>
        <desc>Equivalent data is available in the data table below the chart.</desc>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {yValues.map((label) => (
            <text
              key={label}
              x={-8}
              y={(y(label) ?? 0) + y.bandwidth() / 2}
              textAnchor="end"
              dominantBaseline="middle"
              className={styles.tick}
            >
              {label.length > 10 ? `${label.slice(0, 10)}…` : label}
            </text>
          ))}
          {xValues.map((label) => (
            <text
              key={label}
              x={(x(label) ?? 0) + x.bandwidth() / 2}
              y={innerH + 16}
              textAnchor="middle"
              className={styles.tick}
            >
              {label.length > 8 ? `${label.slice(0, 8)}…` : label}
            </text>
          ))}
          {data.map((datum, index) => {
            const value = numeric(datum[valueKey]) ?? 0
            return (
              <rect
                key={index}
                x={x(String(datum[xKey] ?? '')) ?? 0}
                y={y(String(datum[yKey] ?? '')) ?? 0}
                width={x.bandwidth()}
                height={y.bandwidth()}
                rx={2}
                fill={color(value)}
                fillOpacity={0.15 + 0.85 * progress}
                stroke="hsl(var(--card))"
                strokeWidth={1}
                onPointerEnter={() => setActive(index)}
                onPointerLeave={() => setActive(null)}
                className={styles.hit}
              />
            )
          })}
        </g>
      </svg>

      <div className={styles.scaleLegend}>
        <span className={styles.scaleLabel}>{valueFormat(domain[0])}</span>
        <span
          aria-hidden
          className={styles.scaleBar}
          style={{
            background: `linear-gradient(to right, ${interpolateBlues(0)}, ${interpolateBlues(1)})`,
          }}
        />
        <span className={styles.scaleLabel}>{valueFormat(domain[1])}</span>
      </div>

      {activeDatum ? (
        <ChartTooltip
          x={margin.left + (x(String(activeDatum[xKey] ?? '')) ?? 0) + x.bandwidth() / 2}
          y={margin.top + (y(String(activeDatum[yKey] ?? '')) ?? 0)}
          width={width}
        >
          <p className={styles.tooltipTitle}>
            {String(activeDatum[xKey] ?? '')} · {String(activeDatum[yKey] ?? '')}
          </p>
          <p className={styles.tooltipRow}>
            {valueFormat(numeric(activeDatum[valueKey]) ?? 0)}
          </p>
        </ChartTooltip>
      ) : null}
    </>
  )
}

export function Heatmap({
  data,
  xKey = 'x',
  yKey = 'y',
  valueKey = 'value',
  height = 260,
  title,
  description,
  className,
  animate = true,
  valueFormat = compactNumber,
  ariaLabel,
}: HeatmapProps) {
  return (
    <ChartFrame
      title={title}
      description={description}
      height={height}
      className={className}
      aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
      empty={data.length === 0}
      table={{
        caption: typeof title === 'string' ? title : 'Heatmap data',
        columns: [
          { key: xKey, label: 'Column' },
          { key: yKey, label: 'Row' },
          {
            key: valueKey,
            label: 'Value',
            format: (value: unknown) =>
              typeof value === 'number' ? valueFormat(value) : '',
          },
        ],
        rows: data,
      }}
    >
      {(size) => (
        <HeatmapCanvas
          data={data}
          xKey={xKey}
          yKey={yKey}
          valueKey={valueKey}
          size={size}
          animate={animate}
          valueFormat={valueFormat}
        />
      )}
    </ChartFrame>
  )
}
