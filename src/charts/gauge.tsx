import { arc } from 'd3'

import { useContainerSize } from '~/hooks/use-container-size'
import { cx } from '~/lib/cx'
import styles from './charts.module.scss'
import { useAnimatedProgress } from './use-animated-progress'
import { clamp, compactNumber } from './chart-utils'
import type { ChartSize } from './chart-types'

export function Gauge({
  value,
  max = 100,
  height = 180,
  label,
  valueFormat = compactNumber,
  color = 'hsl(var(--chart-1))',
  animate = true,
  className,
}: {
  value: number
  max?: number
  height?: number
  label?: string
  valueFormat?: (value: number) => string
  color?: string
  animate?: boolean
  className?: string
}) {
  const { ref, width } = useContainerSize<HTMLDivElement>()
  const progress = useAnimatedProgress({
    enabled: animate,
    duration: 700,
    resetKey: `${value}:${max}`,
  })
  const size: ChartSize = { width, height }
  const ratio = clamp(value / Math.max(1, max), 0, 1)
  const animated = ratio * progress

  const centerY = height - 14
  const radius = Math.max(1, Math.min(size.width / 2 - 16, centerY - 10))
  const inner = radius * 0.72
  const start = -Math.PI / 2
  const end = Math.PI / 2
  const arcGen = arc<{ startAngle: number; endAngle: number }>()
    .innerRadius(inner)
    .outerRadius(radius)
    .cornerRadius(4)

  return (
    <div
      ref={ref}
      className={cx(styles.fluid, className)}
      style={{ height }}
      role="img"
      aria-label={`${label ?? 'Gauge'}: ${valueFormat(value)} of ${valueFormat(max)}`}
    >
      {width > 0 ? (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
          <g transform={`translate(${width / 2},${centerY})`}>
            <path
              d={arcGen({ startAngle: start, endAngle: end }) ?? ''}
              fill="hsl(var(--muted))"
            />
            <path
              d={
                arcGen({
                  startAngle: start,
                  endAngle: start + (end - start) * animated,
                }) ?? ''
              }
              fill={color}
            />
            <text
              y={-radius * 0.34}
              textAnchor="middle"
              dominantBaseline="middle"
              className={styles.centerValue}
            >
              {valueFormat(value)}
            </text>
            {label ? (
              <text
                y={-radius * 0.06}
                textAnchor="middle"
                dominantBaseline="middle"
                className={styles.tick}
              >
                {label}
              </text>
            ) : null}
          </g>
        </svg>
      ) : null}
    </div>
  )
}
