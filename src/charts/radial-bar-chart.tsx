import { arc } from 'd3'
import { useState, type ReactNode } from 'react'

import { cx } from '~/lib/cx'
import styles from './charts.module.scss'
import { ChartFrame } from './chart-frame'
import { ChartTooltip } from './chart-tooltip'
import { useAnimatedProgress } from './use-animated-progress'
import { chartColor, compactNumber } from './chart-utils'
import type { ChartSize } from './chart-types'

export type RadialBarDatum = { label: string; value: number }

function RadialBarCanvas({
  data,
  max,
  size,
  animate,
  valueFormat,
}: {
  data: RadialBarDatum[]
  max?: number
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
  const radius = Math.max(1, Math.min(width, height) / 2 - 18)
  const maxValue = max ?? Math.max(1, ...data.map((item) => item.value))
  const ring = (radius - radius * 0.35) / Math.max(1, data.length)

  return (
    <>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label="Radial bar chart. Use the data table below for exact values."
        tabIndex={0}
        className={styles.canvas}
      >
        <title>{`Radial bar chart with ${data.length} rings`}</title>
        <desc>Equivalent data is available in the data table below the chart.</desc>
        <g transform={`translate(${width / 2},${height / 2})`}>
          {data.map((item, index) => {
            const inner = radius * 0.35 + index * ring
            const outer = inner + ring * 0.72
            const end = (item.value / maxValue) * Math.PI * 2 * progress
            const arcGen = arc<{ startAngle: number; endAngle: number }>()
              .innerRadius(inner)
              .outerRadius(outer)
              .cornerRadius(3)
            return (
              <g key={item.label}>
                <path
                  d={arcGen({ startAngle: 0, endAngle: Math.PI * 2 }) ?? ''}
                  fill="hsl(var(--muted))"
                />
                <path
                  d={arcGen({ startAngle: 0, endAngle: end }) ?? ''}
                  fill={chartColor(index)}
                  opacity={active != null && active !== index ? 0.5 : 1}
                  onPointerEnter={() => setActive(index)}
                  onPointerLeave={() => setActive(null)}
                  className={cx(styles.hit, styles.fade)}
                />
              </g>
            )
          })}
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            className={styles.centerValue}
          >
            {valueFormat(data.reduce((sum, item) => sum + item.value, 0))}
          </text>
        </g>
      </svg>

      {active != null ? (
        <ChartTooltip x={width / 2} y={height / 2 - radius} width={width}>
          <p className={styles.tooltipTitle}>{data[active].label}</p>
          <p className={styles.tooltipRow}>{valueFormat(data[active].value)}</p>
        </ChartTooltip>
      ) : null}
    </>
  )
}

export function RadialBarChart({
  data,
  max,
  height = 280,
  title,
  description,
  className,
  animate = true,
  valueFormat = compactNumber,
  ariaLabel,
}: {
  data: RadialBarDatum[]
  max?: number
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
      height={height}
      className={className}
      aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
      empty={data.length === 0}
      legend={data.map((item, index) => ({
        label: item.label,
        color: chartColor(index),
        shape: 'circle',
      }))}
      table={{
        caption: typeof title === 'string' ? title : 'Radial bar data',
        columns: [
          { key: 'label', label: 'Label' },
          {
            key: 'value',
            label: 'Value',
            format: (value) => (typeof value === 'number' ? valueFormat(value) : ''),
          },
        ],
        rows: data,
      }}
    >
      {(size) => (
        <RadialBarCanvas
          data={data}
          max={max}
          size={size}
          animate={animate}
          valueFormat={valueFormat}
        />
      )}
    </ChartFrame>
  )
}
