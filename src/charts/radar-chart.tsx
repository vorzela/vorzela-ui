import { scaleLinear } from 'd3'
import type { ReactNode } from 'react'

import styles from './charts.module.scss'
import { ChartFrame } from './chart-frame'
import { useAnimatedProgress } from './use-animated-progress'
import {
  buildTableRows,
  compactNumber,
  labelOf,
  numeric,
  seriesColor,
} from './chart-utils'
import type { ChartDatum, ChartSeries, ChartSize } from './chart-types'

export type RadarChartProps = {
  data: ChartDatum[]
  axisKey?: string
  series: ChartSeries[]
  height?: number
  title?: ReactNode
  description?: ReactNode
  className?: string
  maxValue?: number
  animate?: boolean
  valueFormat?: (value: number) => string
  ariaLabel?: string
}

function RadarCanvas({
  data,
  axisKey,
  series,
  size,
  maxValue,
  animate,
}: {
  data: ChartDatum[]
  axisKey: string
  series: ChartSeries[]
  size: ChartSize
  maxValue?: number
  animate: boolean
}) {
  const progress = useAnimatedProgress({
    enabled: animate,
    resetKey: `${data.length}:${series.map((item) => item.key).join(',')}`,
  })

  const width = size.width
  const height = size.height
  const radius = Math.max(1, Math.min(width, height) / 2 - 46)
  const centerX = width / 2
  const centerY = height / 2
  const count = Math.max(1, data.length)
  const max =
    maxValue ??
    Math.max(
      1,
      ...data.flatMap((datum) => series.map((item) => numeric(datum[item.key]) ?? 0)),
    )
  const r = scaleLinear().domain([0, max]).range([0, radius])
  const angle = (index: number) => (Math.PI * 2 * index) / count - Math.PI / 2
  const point = (index: number, value: number) => {
    const distance = r(value) * progress
    return [
      centerX + Math.cos(angle(index)) * distance,
      centerY + Math.sin(angle(index)) * distance,
    ] as const
  }

  const rings = [0.25, 0.5, 0.75, 1]

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="group"
      aria-label="Radar chart. Use the data table below for exact values."
      tabIndex={0}
      className={styles.canvas}
    >
      <title>{`Radar chart with ${data.length} axes and ${series.length} series`}</title>
      <desc>Equivalent data is available in the data table below the chart.</desc>

      {rings.map((ring) => (
        <polygon
          key={ring}
          points={data
            .map((_, index) => {
              const distance = radius * ring
              return `${centerX + Math.cos(angle(index)) * distance},${centerY + Math.sin(angle(index)) * distance}`
            })
            .join(' ')}
          fill="none"
          strokeDasharray={ring === 1 ? undefined : '3 3'}
          className={styles.gridLine}
        />
      ))}

      {data.map((datum, index) => {
        const outer = point(index, max)
        return (
          <g key={String(datum[axisKey] ?? index)}>
            <line
              x1={centerX}
              y1={centerY}
              x2={outer[0]}
              y2={outer[1]}
              className={styles.gridLine}
            />
            <text
              x={centerX + Math.cos(angle(index)) * (radius + 14)}
              y={centerY + Math.sin(angle(index)) * (radius + 14)}
              textAnchor={
                Math.cos(angle(index)) > 0.2
                  ? 'start'
                  : Math.cos(angle(index)) < -0.2
                    ? 'end'
                    : 'middle'
              }
              dominantBaseline="middle"
              className={styles.tick}
            >
              {String(datum[axisKey] ?? '')}
            </text>
          </g>
        )
      })}

      {series.map((item, seriesIndex) => {
        const color = seriesColor(series, seriesIndex)
        const points = data.map((datum, index) =>
          point(index, numeric(datum[item.key]) ?? 0),
        )
        return (
          <g key={item.key}>
            <polygon
              points={points.map(([x, y]) => `${x},${y}`).join(' ')}
              fill={color}
              fillOpacity={0.12}
              stroke={color}
              strokeWidth={2}
              strokeLinejoin="round"
            />
            {points.map(([x, y], index) => (
              <circle key={index} cx={x} cy={y} r={2.5} fill={color} />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

export function RadarChart({
  data,
  axisKey = 'axis',
  series,
  height = 280,
  title,
  description,
  className,
  maxValue,
  animate = true,
  valueFormat = compactNumber,
  ariaLabel,
}: RadarChartProps) {
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
        shape: 'line',
      }))}
      table={{
        caption: typeof title === 'string' ? title : 'Radar data',
        columns: [
          { key: axisKey, label: 'Axis' },
          ...series.map((item, index) => ({
            key: item.key,
            label: labelOf(series, index),
            format: (value: unknown) =>
              typeof value === 'number' ? valueFormat(value) : '',
          })),
        ],
        rows: buildTableRows(data, series),
      }}
    >
      {(size) => (
        <RadarCanvas
          data={data}
          axisKey={axisKey}
          series={series}
          size={size}
          maxValue={maxValue}
          animate={animate}
        />
      )}
    </ChartFrame>
  )
}
