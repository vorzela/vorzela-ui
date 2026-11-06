import { scaleLinear } from 'd3'
import type { ReactNode } from 'react'

import styles from './charts.module.scss'
import { ChartFrame } from './chart-frame'
import { useAnimatedProgress } from './use-animated-progress'
import { chartColor, compactNumber } from './chart-utils'
import type { ChartDatum, ChartSize } from './chart-types'

export type FunnelDatum = { label: string; value: number }

function FunnelCanvas({
  data,
  size,
  animate,
  valueFormat,
}: {
  data: FunnelDatum[]
  size: ChartSize
  animate: boolean
  valueFormat: (value: number) => string
}) {
  const progress = useAnimatedProgress({
    enabled: animate,
    resetKey: `${data.length}:${data.map((item) => item.value).join(',')}`,
  })

  const width = size.width
  const height = size.height
  const margin = { top: 8, right: 20, bottom: 8, left: 88 }
  const innerW = Math.max(1, width - margin.left - margin.right)
  const innerH = Math.max(1, height - margin.top - margin.bottom)
  const max = Math.max(1, ...data.map((item) => item.value))
  const x = scaleLinear().domain([0, max]).range([0, innerW])
  const rowHeight = innerH / Math.max(1, data.length)
  const gap = Math.min(8, rowHeight * 0.18)

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="group"
      aria-label="Funnel chart. Use the data table below for exact values."
      tabIndex={0}
      className={styles.canvas}
    >
      <title>{`Funnel with ${data.length} stages`}</title>
      <desc>Equivalent data is available in the data table below the chart.</desc>
      <g transform={`translate(${margin.left},${margin.top})`}>
        {data.map((item, index) => {
          const topWidth = x(item.value) * progress
          const nextValue = data[index + 1]?.value ?? item.value * 0.85
          const bottomWidth = x(nextValue) * progress
          const top = index * rowHeight + gap / 2
          const bottom = (index + 1) * rowHeight - gap / 2
          const center = innerW / 2
          const points = [
            `${center - topWidth / 2},${top}`,
            `${center + topWidth / 2},${top}`,
            `${center + bottomWidth / 2},${bottom}`,
            `${center - bottomWidth / 2},${bottom}`,
          ].join(' ')
          return (
            <g key={item.label}>
              <polygon points={points} fill={chartColor(index)} opacity={0.85} />
              <text
                x={-8}
                y={(top + bottom) / 2}
                textAnchor="end"
                dominantBaseline="middle"
                className={styles.tick}
              >
                {item.label.length > 12 ? `${item.label.slice(0, 12)}…` : item.label}
              </text>
              <text
                x={center}
                y={(top + bottom) / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className={styles.labelOnMark}
              >
                {valueFormat(item.value)}
              </text>
            </g>
          )
        })}
      </g>
    </svg>
  )
}

export function FunnelChart({
  data,
  height = 260,
  title,
  description,
  className,
  animate = true,
  valueFormat = compactNumber,
  ariaLabel,
}: {
  data: FunnelDatum[]
  height?: number
  title?: ReactNode
  description?: ReactNode
  className?: string
  animate?: boolean
  valueFormat?: (value: number) => string
  ariaLabel?: string
}) {
  return (
    <ChartFrame
      title={title}
      description={description}
      height={Math.max(height, data.length * 46 + 16)}
      className={className}
      aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
      empty={data.length === 0}
      table={{
        caption: typeof title === 'string' ? title : 'Funnel data',
        columns: [
          { key: 'label', label: 'Stage' },
          {
            key: 'value',
            label: 'Value',
            format: (value: unknown) =>
              typeof value === 'number' ? valueFormat(value) : '',
          },
        ],
        rows: data as unknown as ChartDatum[],
      }}
    >
      {(size) => (
        <FunnelCanvas data={data} size={size} animate={animate} valueFormat={valueFormat} />
      )}
    </ChartFrame>
  )
}
