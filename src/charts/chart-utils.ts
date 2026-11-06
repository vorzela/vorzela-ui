import type { ChartDatum, ChartSeries } from './chart-types'

/** Semantic chart palette backed by the theme-aware CSS variables in charts.module.scss. */
export const CHART_PALETTE = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
  'hsl(var(--chart-8))',
] as const

export function chartColor(index: number): string {
  return CHART_PALETTE[index % CHART_PALETTE.length]
}

export function seriesColor(series: ChartSeries[], index: number): string {
  return series[index]?.color ?? chartColor(index)
}

export function numeric(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function valueAt(datum: ChartDatum, key: string): number | null {
  return numeric(datum[key])
}

export function seriesValues(data: ChartDatum[], series: ChartSeries[]): number[] {
  const values: number[] = []
  for (const datum of data) {
    for (const item of series) {
      const value = valueAt(datum, item.key)
      if (value != null) values.push(value)
    }
  }
  return values
}

export function extentOf(values: number[]): [number, number] {
  if (!values.length) return [0, 1]
  let min = values[0]
  let max = values[0]
  for (const value of values) {
    if (value < min) min = value
    if (value > max) max = value
  }
  if (min === max) return [Math.min(0, min), max === 0 ? 1 : max]
  return [min, max]
}

export function stackedExtent(
  data: ChartDatum[],
  series: ChartSeries[],
): [number, number] {
  let max = 0
  let min = 0
  for (const datum of data) {
    let positive = 0
    let negative = 0
    for (const item of series) {
      const value = valueAt(datum, item.key) ?? 0
      if (value >= 0) positive += value
      else negative += value
    }
    max = Math.max(max, positive)
    min = Math.min(min, negative)
  }
  return [min, max]
}

export function compactNumber(value: number): string {
  return new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function buildTableRows(
  data: ChartDatum[],
  series: ChartSeries[],
): ChartDatum[] {
  return data.map((datum) => {
    const row: ChartDatum = {}
    for (const [key, value] of Object.entries(datum)) {
      if (series.some((item) => item.key === key)) {
        row[key] = value
      }
    }
    return row
  })
}

export function labelOf(series: ChartSeries[], index: number): string {
  return series[index]?.label ?? series[index]?.key ?? `Series ${index + 1}`
}
