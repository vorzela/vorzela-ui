import {
  AreaChart,
  BarChart,
  BulletChart,
  CandlestickChart,
  ChartFrame,
  DonutChart,
  FunnelChart,
  Gauge,
  Heatmap,
  HistogramChart,
  LineChart,
  RadarChart,
  RadialBarChart,
  SankeyChart,
  ScatterChart,
  Sparkline,
  TreemapChart,
  WaterfallChart,
} from '~/charts'

const monthly = [
  { month: 'Jan', revenue: 32, cost: 18 },
  { month: 'Feb', revenue: 38, cost: 20 },
  { month: 'Mar', revenue: 35, cost: 19 },
  { month: 'Apr', revenue: 48, cost: 24 },
  { month: 'May', revenue: 54, cost: 26 },
  { month: 'Jun', revenue: 61, cost: 29 },
  { month: 'Jul', revenue: 69, cost: 31 },
]

const channels = [
  { channel: 'Direct', new: 42, returning: 28 },
  { channel: 'Search', new: 34, returning: 22 },
  { channel: 'Social', new: 26, returning: 14 },
  { channel: 'Email', new: 18, returning: 24 },
]

const traffic = [
  { source: 'Direct', value: 42 },
  { source: 'Search', value: 28 },
  { source: 'Social', value: 17 },
  { source: 'Email', value: 13 },
]

const funnel = [
  { label: 'Visited', value: 12400 },
  { label: 'Signed up', value: 4200 },
  { label: 'Activated', value: 2600 },
  { label: 'Paid', value: 980 },
]

const radar = [
  { axis: 'Speed', design: 78, current: 62 },
  { axis: 'Clarity', design: 88, current: 70 },
  { axis: 'Density', design: 64, current: 74 },
  { axis: 'A11y', design: 92, current: 66 },
  { axis: 'Consistency', design: 84, current: 72 },
]

const scatter = [
  { spend: 12, conversion: 22, size: 18 },
  { spend: 18, conversion: 28, size: 24 },
  { spend: 24, conversion: 25, size: 14 },
  { spend: 31, conversion: 38, size: 30 },
  { spend: 38, conversion: 34, size: 20 },
  { spend: 44, conversion: 46, size: 36 },
  { spend: 52, conversion: 43, size: 22 },
]

const heatmap = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].flatMap((day, dayIndex) =>
  ['9am', '11am', '1pm', '3pm', '5pm'].map((hour, hourIndex) => ({
    day,
    hour,
    value: 8 + ((dayIndex * 7 + hourIndex * 11) % 28),
  })),
)

const spark = monthly.map((item) => ({ value: item.revenue }))

const candles = [
  { date: 'Mon', open: 42, high: 48, low: 39, close: 46 },
  { date: 'Tue', open: 46, high: 51, low: 44, close: 49 },
  { date: 'Wed', open: 49, high: 53, low: 46, close: 47 },
  { date: 'Thu', open: 47, high: 55, low: 45, close: 54 },
  { date: 'Fri', open: 54, high: 58, low: 51, close: 56 },
]

export const chartPreviews = {
  'line-chart': (
    <LineChart
      data={monthly}
      xKey="month"
      series={[
        { key: 'revenue', label: 'Revenue' },
        { key: 'cost', label: 'Cost' },
      ]}
      title="Revenue vs cost"
      height={260}
    />
  ),
  'area-chart': (
    <AreaChart
      data={monthly}
      xKey="month"
      series={[{ key: 'revenue', label: 'Revenue' }]}
      title="Revenue"
      height={260}
    />
  ),
  'bar-chart': (
    <BarChart
      data={channels}
      xKey="channel"
      series={[
        { key: 'new', label: 'New' },
        { key: 'returning', label: 'Returning' },
      ]}
      title="Acquisition channels"
      height={260}
    />
  ),
  'donut-chart': (
    <DonutChart
      data={traffic}
      nameKey="source"
      valueKey="value"
      title="Traffic mix"
      height={260}
      centerLabel="13.4k"
    />
  ),
  'scatter-chart': (
    <ScatterChart
      data={scatter}
      xKey="spend"
      yKey="conversion"
      sizeKey="size"
      title="Spend vs conversion"
      height={260}
    />
  ),
  'heatmap': (
    <Heatmap
      data={heatmap}
      xKey="hour"
      yKey="day"
      valueKey="value"
      title="Activity by hour"
      height={260}
    />
  ),
  'sparkline': <Sparkline data={spark} valueKey="value" label="Revenue trend" />,
  'gauge': <Gauge value={94} label="Uptime" height={190} />,
  'radar-chart': (
    <RadarChart
      data={radar}
      axisKey="axis"
      series={[
        { key: 'design', label: 'Target' },
        { key: 'current', label: 'Current' },
      ]}
      title="Design review"
      height={260}
    />
  ),
  'treemap-chart': (
    <TreemapChart
      data={{
        name: 'Components',
        children: [
          { name: 'Forms', value: 32 },
          { name: 'Data', value: 24 },
          { name: 'Charts', value: 18 },
          { name: 'Layout', value: 12 },
          { name: 'Overlays', value: 9 },
        ],
      }}
      title="Share by layer"
      height={260}
    />
  ),
  'sankey-chart': (
    <SankeyChart
      nodes={[
        { id: 'visits', name: 'Visits' },
        { id: 'signup', name: 'Sign up' },
        { id: 'active', name: 'Active' },
        { id: 'paid', name: 'Paid' },
      ]}
      links={[
        { source: 'visits', target: 'signup', value: 12400 },
        { source: 'signup', target: 'active', value: 4200 },
        { source: 'active', target: 'paid', value: 980 },
      ]}
      title="Activation flow"
      height={260}
    />
  ),
  'funnel-chart': (
    <FunnelChart data={funnel} title="Activation funnel" height={240} />
  ),
  'candlestick-chart': (
    <CandlestickChart data={candles} title="Weekly range" height={260} />
  ),
  'waterfall-chart': (
    <WaterfallChart
      data={[
        { label: 'Revenue', value: 120 },
        { label: 'Costs', value: -38 },
        { label: 'Ops', value: -16 },
        { label: 'Total', value: 66, total: true },
      ]}
      title="Margin bridge"
      height={260}
    />
  ),
  'histogram-chart': (
    <HistogramChart
      values={[12, 18, 22, 24, 31, 34, 38, 42, 44, 49, 52, 58, 61, 66, 72]}
      bins={8}
      title="Latency distribution"
      height={240}
    />
  ),
  'radial-bar-chart': (
    <RadialBarChart
      data={[
        { label: 'Search', value: 78 },
        { label: 'Direct', value: 62 },
        { label: 'Social', value: 44 },
      ]}
      title="Channel share"
      height={260}
    />
  ),
  'bullet-chart': (
    <BulletChart
      data={[
        { label: 'Revenue', value: 82, target: 76, max: 100 },
        { label: 'Retention', value: 68, target: 75, max: 100 },
        { label: 'Latency', value: 91, target: 88, max: 100 },
      ]}
      title="Targets vs actuals"
      height={220}
    />
  ),
  'chart-frame': (
    <ChartFrame title="Chart frame" description="Shared surface and legend" height={220}>
      {() => (
        <div
          style={{
            display: 'grid',
            placeItems: 'center',
            height: '100%',
            color: 'hsl(var(--muted-foreground))',
            fontSize: '0.875rem',
          }}
        >
          Any chart renderer goes here
        </div>
      )}
    </ChartFrame>
  ),
}
