import { scaleBand, scaleLinear } from 'd3'
import { useState, type ReactNode } from 'react'

import styles from './charts.module.scss'
import { ChartFrame } from './chart-frame'
import { ChartTooltip } from './chart-tooltip'
import { useAnimatedProgress } from './use-animated-progress'
import { compactNumber } from './chart-utils'
import type { ChartSize } from './chart-types'

export type Candle = {
  date: string
  open: number
  high: number
  low: number
  close: number
}

function CandleCanvas({
  data,
  size,
  animate,
  valueFormat,
}: {
  data: Candle[]
  size: ChartSize
  animate: boolean
  valueFormat: (value: number) => string
}) {
  const [active, setActive] = useState<number | null>(null)
  const progress = useAnimatedProgress({
    enabled: animate,
    resetKey: `${data.length}:${data[data.length - 1]?.close}`,
  })

  const width = size.width
  const height = size.height
  const compact = width < 420
  const margin = { top: 12, right: 12, bottom: compact ? 26 : 32, left: compact ? 36 : 48 }
  const innerW = Math.max(1, width - margin.left - margin.right)
  const innerH = Math.max(1, height - margin.top - margin.bottom)

  const lows = data.map((item) => item.low)
  const highs = data.map((item) => item.high)
  const min = Math.min(...lows)
  const max = Math.max(...highs)
  const mid = (min + max) / 2
  const y = scaleLinear()
    .domain([min, max === min ? min + 1 : max])
    .nice()
    .range([innerH, 0])
  const animatedY = (value: number) => y(mid + (value - mid) * progress)
  const x = scaleBand<string>()
    .domain(data.map((item) => item.date))
    .range([0, innerW])
    .padding(0.25)
  const candleWidth = Math.max(2, x.bandwidth() * 0.62)
  const tickStep = Math.max(1, Math.ceil(data.length / (compact ? 4 : 7)))
  const ticks = y.ticks(compact ? 3 : 4)

  const activeCandle = active != null ? data[active] : null

  return (
    <>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label="Candlestick chart. Use the data table below for exact values."
        tabIndex={0}
        className={styles.canvas}
      >
        <title>{`Candlestick chart with ${data.length} sessions`}</title>
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

          {data.map((item, index) => {
            const up = item.close >= item.open
            const color = up ? 'hsl(var(--success))' : 'hsl(var(--destructive))'
            const cx = (x(item.date) ?? 0) + x.bandwidth() / 2
            const bodyTop = Math.min(animatedY(item.open), animatedY(item.close))
            const bodyHeight = Math.max(
              1,
              Math.abs(animatedY(item.open) - animatedY(item.close)),
            )
            return (
              <g
                key={item.date}
                onPointerEnter={() => setActive(index)}
                onPointerLeave={() => setActive(null)}
                className={styles.hit}
              >
                <line
                  x1={cx}
                  x2={cx}
                  y1={animatedY(item.high)}
                  y2={animatedY(item.low)}
                  stroke={color}
                  strokeWidth={1}
                />
                <rect
                  x={cx - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  rx={1}
                  fill={up ? color : 'hsl(var(--card))'}
                  stroke={color}
                  strokeWidth={1}
                />
                {index % tickStep === 0 ? (
                  <text
                    x={cx}
                    y={innerH + 16}
                    textAnchor="middle"
                    className={styles.tick}
                  >
                    {item.date}
                  </text>
                ) : null}
              </g>
            )
          })}
        </g>
      </svg>

      {activeCandle ? (
        <ChartTooltip
          x={margin.left + (x(activeCandle.date) ?? 0) + x.bandwidth() / 2}
          y={margin.top + animatedY(activeCandle.high)}
          width={width}
        >
          <p className={styles.tooltipTitle}>{activeCandle.date}</p>
          <p className={styles.tooltipRow}>
            O {valueFormat(activeCandle.open)} · H {valueFormat(activeCandle.high)}
          </p>
          <p className={styles.tooltipRow}>
            L {valueFormat(activeCandle.low)} · C {valueFormat(activeCandle.close)}
          </p>
        </ChartTooltip>
      ) : null}
    </>
  )
}

export function CandlestickChart({
  data,
  height = 280,
  title,
  description,
  className,
  animate = true,
  valueFormat = compactNumber,
  ariaLabel,
}: {
  data: Candle[]
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
      table={{
        caption: typeof title === 'string' ? title : 'Candlestick data',
        columns: [
          { key: 'date', label: 'Date' },
          {
            key: 'open',
            label: 'Open',
            format: (value) => (typeof value === 'number' ? valueFormat(value) : ''),
          },
          {
            key: 'high',
            label: 'High',
            format: (value) => (typeof value === 'number' ? valueFormat(value) : ''),
          },
          {
            key: 'low',
            label: 'Low',
            format: (value) => (typeof value === 'number' ? valueFormat(value) : ''),
          },
          {
            key: 'close',
            label: 'Close',
            format: (value) => (typeof value === 'number' ? valueFormat(value) : ''),
          },
        ],
        rows: data as unknown as Array<Record<string, string | number>>,
      }}
    >
      {(size) => (
        <CandleCanvas data={data} size={size} animate={animate} valueFormat={valueFormat} />
      )}
    </ChartFrame>
  )
}
