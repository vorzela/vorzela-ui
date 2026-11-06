import { area, curveMonotoneX, line, scaleLinear, scalePoint } from 'd3'
import { useId } from 'react'

import { useContainerSize } from '~/hooks/use-container-size'
import { cx } from '~/lib/cx'
import styles from './charts.module.scss'
import { useAnimatedProgress } from './use-animated-progress'
import { chartColor, numeric } from './chart-utils'
import type { ChartDatum } from './chart-types'

export function Sparkline({
  data,
  valueKey,
  height = 36,
  color = chartColor(0),
  filled = true,
  animate = true,
  label,
  className,
}: {
  data: ChartDatum[]
  valueKey: string
  height?: number
  color?: string
  filled?: boolean
  animate?: boolean
  label?: string
  className?: string
}) {
  const { ref, width } = useContainerSize<HTMLDivElement>()
  const gradientId = useId().replace(/:/g, '')
  const progress = useAnimatedProgress({
    enabled: animate,
    duration: 500,
    resetKey: `${data.length}:${data[0]?.[valueKey]}:${data[data.length - 1]?.[valueKey]}`,
  })

  const values = data.map((datum) => numeric(datum[valueKey]) ?? 0)
  const min = Math.min(...values, 0)
  const max = Math.max(...values, 1)
  const x = scalePoint<number>()
    .domain(values.map((_, index) => index))
    .range([0, Math.max(1, width)])
  const y = scaleLinear().domain([min, max]).range([height - 2, 2])
  const baseline = height

  const lineGen = line<number>()
    .x((_, index) => x(index) ?? 0)
    .y((value) => y(min + (value - min) * progress))
    .curve(curveMonotoneX)
  const areaGen = area<number>()
    .x((_, index) => x(index) ?? 0)
    .y0(baseline)
    .y1((value) => y(min + (value - min) * progress))
    .curve(curveMonotoneX)

  return (
    <div
      ref={ref}
      className={cx(styles.fluid, className)}
      style={{ height }}
      role="img"
      aria-label={label ?? `Sparkline with ${values.length} points`}
    >
      {width > 0 && values.length > 1 ? (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {filled ? <path d={areaGen(values) ?? ''} fill={`url(#${gradientId})`} /> : null}
          <path
            d={lineGen(values) ?? ''}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </svg>
      ) : null}
    </div>
  )
}
