import {
  area as d3Area,
  curveCatmullRom,
  curveLinear,
  curveMonotoneX,
  curveStep,
  line as d3Line,
  scaleLinear,
  scalePoint,
} from 'd3'
import { useId, useState, type PointerEvent, type ReactNode } from 'react'

import styles from './charts.module.scss'
import { ChartFrame } from './chart-frame'
import { ChartTooltip } from './chart-tooltip'
import { useAnimatedProgress } from './use-animated-progress'
import {
  buildTableRows,
  clamp,
  compactNumber,
  extentOf,
  labelOf,
  seriesColor,
  seriesValues,
  valueAt,
} from './chart-utils'
import type { ChartDatum, ChartSeries, ChartSize } from './chart-types'

const CURVES = {
  linear: curveLinear,
  monotone: curveMonotoneX,
  step: curveStep,
  smooth: curveCatmullRom.alpha(0.5),
} as const

export type LineChartProps = {
  data: ChartDatum[]
  xKey: string
  series: ChartSeries[]
  height?: number
  title?: ReactNode
  description?: ReactNode
  className?: string
  curve?: keyof typeof CURVES
  showDots?: boolean
  showGrid?: boolean
  showArea?: boolean
  animate?: boolean
  yFormat?: (value: number) => string
  xFormat?: (value: string) => string
  yDomain?: [number, number]
  ariaLabel?: string
}

function LineCanvas({
  data,
  xKey,
  series,
  size,
  curve,
  showDots,
  showGrid,
  showArea,
  animate,
  yFormat,
  xFormat,
  yDomain,
}: {
  data: ChartDatum[]
  xKey: string
  series: ChartSeries[]
  size: ChartSize
  curve: keyof typeof CURVES
  showDots: boolean
  showGrid: boolean
  showArea: boolean
  animate: boolean
  yFormat: (value: number) => string
  xFormat: (value: string) => string
  yDomain?: [number, number]
}) {
  const [active, setActive] = useState<number | null>(null)
  const gradientId = useId().replace(/:/g, '')
  const resetKey = `${data.length}:${series.map((item) => item.key).join(',')}`
  const progress = useAnimatedProgress({ enabled: animate, resetKey })

  const width = size.width
  const height = size.height
  const compact = width < 420
  const margin = {
    top: 12,
    right: 12,
    bottom: compact ? 24 : 30,
    left: compact ? 34 : 44,
  }
  const innerW = Math.max(1, width - margin.left - margin.right)
  const innerH = Math.max(1, height - margin.top - margin.bottom)

  const xValues = data.map((datum) => String(datum[xKey] ?? ''))
  const x = scalePoint<string>()
    .domain(xValues)
    .range([0, innerW])
    .padding(0.5)

  const domain = yDomain ?? extentOf(seriesValues(data, series))
  const y = scaleLinear().domain(domain).nice().range([innerH, 0])
  const baseline = y.domain()[0]
  const yTicks = y.ticks(compact ? 3 : 4)
  const step = Math.max(1, Math.ceil(xValues.length / (compact ? 4 : 7)))
  const xTicks = xValues.filter((_, index) => index % step === 0)

  const curveFactory = CURVES[curve]
  const xAccessor = (datum: ChartDatum) => x(String(datum[xKey] ?? '')) ?? 0
  const yAccessor = (datum: ChartDatum, key: string) => {
    const value = valueAt(datum, key)
    const start = baseline
    return y(start + ((value ?? start) - start) * progress)
  }

  const activeDatum = active != null ? data[active] : null
  const activeX = active != null ? (x(xValues[active]) ?? 0) : 0

  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const px = clamp(event.clientX - rect.left - margin.left, 0, innerW)
    let nearest = 0
    let distance = Number.POSITIVE_INFINITY
    for (let index = 0; index < xValues.length; index += 1) {
      const next = Math.abs((x(xValues[index]) ?? 0) - px)
      if (next < distance) {
        distance = next
        nearest = index
      }
    }
    setActive(nearest)
  }

  return (
    <>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label="Line chart. Use arrow keys to inspect data points."
        tabIndex={0}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setActive(null)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            setActive((current) => Math.min(data.length - 1, (current ?? -1) + 1))
          } else if (event.key === 'ArrowLeft') {
            event.preventDefault()
            setActive((current) => Math.max(0, (current ?? data.length) - 1))
          } else if (event.key === 'Home') {
            event.preventDefault()
            setActive(0)
          } else if (event.key === 'End') {
            event.preventDefault()
            setActive(data.length - 1)
          }
        }}
        className={styles.canvas}
      >
        <title>{`Line chart with ${series.length} series and ${data.length} points`}</title>
        <desc>Equivalent data is available in the data table below the chart.</desc>
        <defs>
          {series.map((item, index) => (
            <linearGradient
              key={item.key}
              id={`${gradientId}-${index}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={seriesColor(series, index)} stopOpacity={0.28} />
              <stop offset="100%" stopColor={seriesColor(series, index)} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>

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
                  vectorEffect="non-scaling-stroke"
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
              className={styles.tick}
            >
              {xFormat(tick)}
            </text>
          ))}

          {series.map((item, index) => {
            const color = seriesColor(series, index)
            const generator = d3Line<ChartDatum>()
              .x(xAccessor)
              .y((datum) => yAccessor(datum, item.key))
              .curve(curveFactory)
            const areaGen = d3Area<ChartDatum>()
              .x(xAccessor)
              .y0(innerH)
              .y1((datum) => yAccessor(datum, item.key))
              .curve(curveFactory)
            return (
              <g key={item.key}>
                {showArea ? (
                  <path
                    d={areaGen(data) ?? ''}
                    fill={`url(#${gradientId}-${index})`}
                    stroke="none"
                  />
                ) : null}
                <path
                  d={generator(data) ?? ''}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {showDots
                  ? data.map((datum, datumIndex) => (
                      <circle
                        key={`${item.key}-${datumIndex}`}
                        cx={xAccessor(datum)}
                        cy={yAccessor(datum, item.key)}
                        r={active === datumIndex ? 3.5 : 2}
                        fill="hsl(var(--card))"
                        stroke={color}
                        strokeWidth={1.5}
                      />
                    ))
                  : null}
              </g>
            )
          })}

          {active != null ? (
            <line
              x1={activeX}
              x2={activeX}
              y1={0}
              y2={innerH}
              strokeDasharray="2 2"
              className={styles.cursorLine}
            />
          ) : null}
        </g>
      </svg>

      {activeDatum ? (
        <ChartTooltip x={margin.left + activeX} y={margin.top + 4} width={width}>
          <p className={styles.tooltipTitle}>{xFormat(xValues[active ?? 0])}</p>
          {series.map((item, index) => (
            <p key={item.key} className={styles.tooltipRow}>
              <span
                className={styles.tooltipDot}
                style={{ background: seriesColor(series, index) }}
                aria-hidden
              />
              {labelOf(series, index)}:{' '}
              <span className={styles.tooltipValue}>
                {yFormat(valueAt(activeDatum, item.key) ?? 0)}
              </span>
            </p>
          ))}
        </ChartTooltip>
      ) : null}
    </>
  )
}

export function LineChart({
  data,
  xKey,
  series,
  height = 240,
  title,
  description,
  className,
  curve = 'monotone',
  showDots = false,
  showGrid = true,
  showArea = false,
  animate = true,
  yFormat = compactNumber,
  xFormat = (value) => value,
  yDomain,
  ariaLabel,
}: LineChartProps) {
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
        caption: typeof title === 'string' ? title : 'Chart data',
        columns: [
          { key: xKey, label: 'Label' },
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
        <LineCanvas
          data={data}
          xKey={xKey}
          series={series}
          size={size}
          curve={curve}
          showDots={showDots}
          showGrid={showGrid}
          showArea={showArea}
          animate={animate}
          yFormat={yFormat}
          xFormat={xFormat}
          yDomain={yDomain}
        />
      )}
    </ChartFrame>
  )
}

export function AreaChart(props: LineChartProps) {
  return <LineChart {...props} showArea />
}
