import { arc, pie, type PieArcDatum } from 'd3'
import { useState, type ReactNode } from 'react'

import { cx } from '~/lib/cx'
import styles from './charts.module.scss'
import { ChartFrame } from './chart-frame'
import { ChartTooltip } from './chart-tooltip'
import { useAnimatedProgress } from './use-animated-progress'
import { chartColor, compactNumber, labelOf, numeric } from './chart-utils'
import type { ChartDatum, ChartSeries, ChartSize } from './chart-types'

export type DonutChartProps = {
  data: ChartDatum[]
  nameKey?: string
  valueKey?: string
  height?: number
  title?: ReactNode
  description?: ReactNode
  className?: string
  innerRadius?: number
  padAngle?: number
  showLabels?: boolean
  centerLabel?: ReactNode
  animate?: boolean
  valueFormat?: (value: number) => string
  ariaLabel?: string
}

function DonutCanvas({
  data,
  nameKey,
  valueKey,
  size,
  innerRadius,
  padAngle,
  showLabels,
  centerLabel,
  animate,
  valueFormat,
}: {
  data: ChartDatum[]
  nameKey: string
  valueKey: string
  size: ChartSize
  innerRadius: number
  padAngle: number
  showLabels: boolean
  centerLabel?: ReactNode
  animate: boolean
  valueFormat: (value: number) => string
}) {
  const [active, setActive] = useState<number | null>(null)
  const resetKey = `${data.length}:${data.map((item) => item[valueKey]).join(',')}`
  const progress = useAnimatedProgress({ enabled: animate, resetKey })

  const width = size.width
  const height = size.height
  const radius = Math.max(1, Math.min(width, height) / 2 - 16)
  const inner = radius * Math.max(0, Math.min(0.9, innerRadius))

  const layout = pie<ChartDatum>()
    .value((datum) => numeric(datum[valueKey]) ?? 0)
    .sort(null)
    .padAngle(padAngle)
    .endAngle(2 * Math.PI * progress)

  const arcs = layout(data)
  const arcGen = arc<PieArcDatum<ChartDatum>>()
    .innerRadius(inner)
    .outerRadius(radius)
    .cornerRadius(3)

  const total = data.reduce((sum, datum) => sum + (numeric(datum[valueKey]) ?? 0), 0)
  const activeDatum = active != null ? data[active] : null
  const activeArc = active != null ? arcs[active] : null

  return (
    <>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label="Donut chart. Use the data table below for exact values."
        tabIndex={0}
        className={styles.canvas}
      >
        <title>{`Donut chart with ${data.length} segments`}</title>
        <desc>Equivalent data is available in the data table below the chart.</desc>
        <g transform={`translate(${width / 2},${height / 2})`}>
          {arcs.map((slice, index) => {
            const mid = (slice.startAngle + slice.endAngle) / 2
            const labelRadius = (inner + radius) / 2
            const color = chartColor(index)
            return (
              <g key={String(slice.data[nameKey] ?? index)}>
                <path
                  d={arcGen(slice) ?? ''}
                  fill={color}
                  opacity={active != null && active !== index ? 0.5 : 1}
                  onPointerEnter={() => setActive(index)}
                  onPointerLeave={() => setActive(null)}
                  className={cx(styles.hit, styles.fade)}
                />
                {showLabels && slice.endAngle - slice.startAngle > 0.35 ? (
                  <text
                    x={Math.cos(mid - Math.PI / 2) * labelRadius}
                    y={Math.sin(mid - Math.PI / 2) * labelRadius}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={styles.labelOnMark}
                  >
                    {Math.round(((slice.endAngle - slice.startAngle) / (2 * Math.PI)) * 100)}%
                  </text>
                ) : null}
              </g>
            )
          })}
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            className={styles.centerValue}
          >
            {centerLabel ?? valueFormat(total)}
          </text>
          <text y={18} textAnchor="middle" className={styles.centerCaption}>
            Total
          </text>
        </g>
      </svg>

      {activeDatum && activeArc ? (
        <ChartTooltip
          x={
            width / 2 +
            Math.cos((activeArc.startAngle + activeArc.endAngle) / 2 - Math.PI / 2) *
              radius
          }
          y={
            height / 2 +
            Math.sin((activeArc.startAngle + activeArc.endAngle) / 2 - Math.PI / 2) *
              radius
          }
          width={width}
        >
          <p className={styles.tooltipTitle}>{String(activeDatum[nameKey] ?? '')}</p>
          <p className={styles.tooltipRow}>
            {valueFormat(numeric(activeDatum[valueKey]) ?? 0)}
            <span className={styles.tooltipPercent}>
              (
              {total
                ? Math.round(((numeric(activeDatum[valueKey]) ?? 0) / total) * 100)
                : 0}
              %)
            </span>
          </p>
        </ChartTooltip>
      ) : null}
    </>
  )
}

export function DonutChart({
  data,
  nameKey = 'name',
  valueKey = 'value',
  height = 240,
  title,
  description,
  className,
  innerRadius = 0.62,
  padAngle = 0.02,
  showLabels = false,
  centerLabel,
  animate = true,
  valueFormat = compactNumber,
  ariaLabel,
}: DonutChartProps) {
  const series: ChartSeries[] = data.map((datum, index) => ({
    key: String(datum[nameKey] ?? index),
    label: String(datum[nameKey] ?? `Segment ${index + 1}`),
    color: chartColor(index),
  }))

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
        color: item.color ?? chartColor(index),
        shape: 'circle',
      }))}
      table={{
        caption: typeof title === 'string' ? title : 'Chart data',
        columns: [
          { key: nameKey, label: 'Segment' },
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
        <DonutCanvas
          data={data}
          nameKey={nameKey}
          valueKey={valueKey}
          size={size}
          innerRadius={innerRadius}
          padAngle={padAngle}
          showLabels={showLabels}
          centerLabel={centerLabel}
          animate={animate}
          valueFormat={valueFormat}
        />
      )}
    </ChartFrame>
  )
}
