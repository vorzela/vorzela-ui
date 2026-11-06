import {
  BarChart,
  DonutChart,
  FunnelChart,
  Gauge,
  Heatmap,
  LineChart,
  RadarChart,
  ScatterChart,
  Sparkline,
} from '~/charts'
import { Badge } from '~/components/ui/badge'
import { Card } from '~/components/ui/card'
import { Section } from '../showcase'
import styles from '../docs.module.scss'

const monthly = [
  { month: 'Jan', revenue: 32, cost: 18 },
  { month: 'Feb', revenue: 38, cost: 20 },
  { month: 'Mar', revenue: 35, cost: 19 },
  { month: 'Apr', revenue: 48, cost: 24 },
  { month: 'May', revenue: 54, cost: 26 },
  { month: 'Jun', revenue: 61, cost: 29 },
  { month: 'Jul', revenue: 58, cost: 27 },
  { month: 'Aug', revenue: 69, cost: 31 },
  { month: 'Sep', revenue: 76, cost: 33 },
]

const channels = [
  { channel: 'Direct', new: 42, returning: 28 },
  { channel: 'Search', new: 34, returning: 22 },
  { channel: 'Social', new: 26, returning: 14 },
  { channel: 'Email', new: 18, returning: 24 },
  { channel: 'Referral', new: 12, returning: 9 },
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
  { label: 'Retained', value: 640 },
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
  { spend: 58, conversion: 55, size: 28 },
]

const heatmap = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].flatMap((day, dayIndex) =>
  ['9am', '11am', '1pm', '3pm', '5pm', '7pm'].map((hour, hourIndex) => ({
    day,
    hour,
    value: 8 + ((dayIndex * 7 + hourIndex * 11) % 28),
  })),
)

const spark = monthly.map((item) => ({ value: item.revenue }))

export function ChartsPage() {
  return (
    <>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>Charts</span>
        <h1 className={styles.heroTitle}>Data with a quiet pulse.</h1>
        <p className={styles.heroLead}>
          Eighteen d3 charts with one surface language: soft grid lines, tabular
          ticks, theme-aware series colours and a shared tooltip. Every chart has
          an accessible name and a data-table fallback.
        </p>
        <div className={styles.chipRow}>
          <span className={styles.chip}>d3 + d3-sankey</span>
          <span className={styles.chip}>Responsive container sizing</span>
          <span className={styles.chip}>Reduced-motion aware</span>
          <span className={styles.chip}>Light + dark palettes</span>
        </div>
      </header>

      <Section
        title="Line and area"
        lead="Use a line for change over time. Two series max before the chart becomes a spaghetti plot."
      >
        <div className={styles.grid}>
          <LineChart
            data={monthly}
            xKey="month"
            series={[
              { key: 'revenue', label: 'Revenue' },
              { key: 'cost', label: 'Cost' },
            ]}
            title="Revenue vs cost"
            description="USD thousands · last 9 months"
            height={260}
          />
          <BarChart
            data={channels}
            xKey="channel"
            series={[
              { key: 'new', label: 'New' },
              { key: 'returning', label: 'Returning' },
            ]}
            title="Acquisition channels"
            description="Sessions by cohort"
            height={260}
          />
        </div>
      </Section>

      <Section
        title="Composition"
        lead="Donuts for a small number of parts, funnels for a staged flow. In both cases the label sits next to the mark."
      >
        <div className={styles.grid}>
          <DonutChart
            data={traffic}
            nameKey="source"
            valueKey="value"
            title="Traffic mix"
            description="Share of sessions"
            height={260}
            centerLabel="13.4k"
          />
          <FunnelChart
            data={funnel}
            title="Activation funnel"
            description="Last 30 days"
            height={260}
          />
        </div>
      </Section>

      <Section
        title="Comparisons"
        lead="Radar for a small set of qualitative axes, scatter for correlation. Keep the number of marks low enough to read."
      >
        <div className={styles.grid}>
          <RadarChart
            data={radar}
            axisKey="axis"
            series={[
              { key: 'design', label: 'Target' },
              { key: 'current', label: 'Current' },
            ]}
            title="Design review"
            description="Score out of 100"
            height={280}
          />
          <ScatterChart
            data={scatter}
            xKey="spend"
            yKey="conversion"
            sizeKey="size"
            title="Spend vs conversion"
            description="Campaign performance"
            height={280}
          />
        </div>
      </Section>

      <Section
        title="Dense data"
        lead="Heatmaps and gauges answer one question at a glance. Add a caption when the scale is not obvious."
      >
        <div className={styles.grid}>
          <Heatmap
            data={heatmap}
            xKey="hour"
            yKey="day"
            valueKey="value"
            title="Activity by hour"
            description="Sessions per slot"
            height={280}
          />
          <div className={styles.card}>
            <div className={styles.cardHeaderRow}>
              <div>
                <h3 className={styles.cardTitle}>Health score</h3>
                <p className={styles.cardText}>Composite uptime and latency</p>
              </div>
              <Badge variant="success">Operational</Badge>
            </div>
            <Gauge value={94} label="Uptime" height={190} />
          </div>
        </div>
      </Section>

      <Section
        title="Inline signals"
        lead="Sparklines belong in tables and stat cards, not as a standalone chart. They show shape, not exact values."
      >
        <div className={styles.grid}>
          <Card flat padded>
            <h3 className={styles.cardTitle}>Monthly revenue</h3>
            <p className={styles.statValue}>$76.2k</p>
            <Sparkline data={spark} valueKey="value" label="Revenue trend" />
          </Card>
          <Card flat padded>
            <h3 className={styles.cardTitle}>Active projects</h3>
            <p className={styles.statValue}>128</p>
            <Sparkline
              data={spark.map((item) => ({ value: item.value + 8 }))}
              valueKey="value"
              label="Project trend"
            />
          </Card>
          <Card flat padded>
            <h3 className={styles.cardTitle}>Weekly retention</h3>
            <p className={styles.statValue}>72%</p>
            <Sparkline
              data={spark.map((item) => ({ value: item.value - 4 }))}
              valueKey="value"
              label="Retention trend"
            />
          </Card>
        </div>
      </Section>
    </>
  )
}
