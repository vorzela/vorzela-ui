export type ChartDatum = Record<string, string | number | null | undefined>

export type ChartSeries = {
  key: string
  label?: string
  color?: string
}

export type ChartSize = {
  width: number
  height: number
}

export type ChartTableColumn = {
  key: string
  label: string
  format?: (value: unknown, row: ChartDatum) => string
}

export type ChartLegendItem = {
  label: string
  color: string
  shape?: 'line' | 'square' | 'circle'
}
