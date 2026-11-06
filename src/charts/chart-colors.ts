/**
 * Chart colours shared by the d3 renderers.
 *
 * Every entry resolves through a design-token CSS variable, so charts follow
 * the active light/dark theme without a JavaScript colour lookup.
 */
export const CHART_COLORS = {
  primary: 'hsl(var(--foreground))',
  muted: 'hsl(var(--muted-foreground))',
  track: 'hsl(var(--muted))',
  grid: 'hsl(var(--border))',
  accent: 'hsl(var(--primary))',
  success: 'hsl(var(--success))',
  warn: 'hsl(var(--warning))',
  danger: 'hsl(var(--destructive))',
} as const

export type ChartColorName = keyof typeof CHART_COLORS

/** Resolve a semantic chart colour, falling back to the accent. */
export function chartToken(name: ChartColorName): string {
  return CHART_COLORS[name] ?? CHART_COLORS.accent
}

/** Fill for a mark that should read as positive/negative. */
export function signColor(value: number): string {
  return value >= 0 ? CHART_COLORS.success : CHART_COLORS.danger
}
