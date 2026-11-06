import {
  ArrowUpRight,
  Check,
  CircleCheck,
  Folder,
  FolderOpen,
  Gauge,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { useState } from 'react'

import { Badge } from '~/components/ui/badge'
import { BentoGrid, BentoItem } from '~/components/ui/bento-grid'
import { Button } from '~/components/ui/button'
import { Callout } from '~/components/ui/callout'
import { Card } from '~/components/ui/card'
import { DescriptionItem, DescriptionList } from '~/components/ui/description-list'
import { DiffViewer } from '~/components/ui/diff-viewer'
import { Empty } from '~/components/ui/empty'
import { ErrorState } from '~/components/ui/error-state'
import { JsonViewer } from '~/components/ui/json-viewer'
import { Invoice } from '~/components/ui/invoice'
import { Link } from '~/components/ui/link'
import { List, ListItem } from '~/components/ui/list'
import { Marquee } from '~/components/ui/marquee'
import { NumberTicker } from '~/components/ui/number-ticker'
import { Receipt } from '~/components/ui/receipt'
import { Result } from '~/components/ui/result'
import { Code, Heading, Highlight } from '~/components/ui/typography'
import { Banner } from '~/components/ui/banner'
import { Stat, StatGroup } from '~/components/ui/stat'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import {
  Timeline,
  TimelineDescription,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from '~/components/ui/timeline'
import { TreeView } from '~/components/ui/tree-view'
import { Section } from '../showcase'
import styles from '../docs.module.scss'

const nodes = [
  {
    id: 'src',
    label: 'src',
    icon: <FolderOpen aria-hidden size={15} />,
    children: [
      {
        id: 'components',
        label: 'components',
        icon: <Folder aria-hidden size={15} />,
        children: [
          { id: 'button', label: 'button.tsx' },
          { id: 'card', label: 'card.tsx' },
        ],
      },
      { id: 'styles', label: 'styles', icon: <Folder aria-hidden size={15} /> },
      { id: 'main', label: 'main.tsx' },
    ],
  },
  { id: 'package', label: 'package.json' },
]

const oldCode = `export function Badge() {
  return <span className="badge">Draft</span>
}`
const newCode = `export function Badge({ tone = 'neutral' }) {
  return <span className={tones[tone]}>Draft</span>
}`

export function DataDisplayPage() {
  const [builds, setBuilds] = useState(1280)

  return (
    <>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>Data display</span>
        <h1 className={styles.heroTitle}>Numbers, states and structure.</h1>
        <p className={styles.heroLead}>
          Small pieces that carry the meaning of a screen: stats, definition
          lists, timelines, trees, tables, diffs and honest empty states. Each
          one stays quiet until the data needs emphasis.
        </p>
        <div className={styles.chipRow}>
          <span className={styles.chip}>Semantic markup</span>
          <span className={styles.chip}>Theme-aware tokens</span>
          <span className={styles.chip}>Keyboard tree navigation</span>
        </div>
      </header>

      <Section title="Stats" lead="A label, a value and optional movement. Never colour the number itself; colour the delta.">
        <StatGroup>
          <Stat label="Monthly revenue" value="$76.2k" delta="12.4%" trend="up" icon={<ArrowUpRight aria-hidden size={15} />} />
          <Stat label="Active members" value="2,481" delta="3.1%" trend="up" icon={<Users aria-hidden size={15} />} />
          <Stat label="Error rate" value="0.42%" delta="0.08%" trend="down" invertTrend icon={<ShieldCheck aria-hidden size={15} />} />
          <Stat label="p95 latency" value="184ms" delta="6ms" trend="flat" icon={<Gauge aria-hidden size={15} />} />
        </StatGroup>
      </Section>

      <Section
        title="Counters"
        lead="NumberTicker animates a value change with an ease-out curve and respects reduced motion. Use it for totals, not for live prices."
      >
        <div className={styles.grid}>
          <Card flat padded>
            <h3 className={styles.cardTitle}>Builds this month</h3>
            <p className={styles.statValue}>
              <NumberTicker value={builds} />
            </p>
            <div className="vz-demo-row">
              <Button size="sm" onClick={() => setBuilds((value) => value + 24)}>
                Add 24 builds
              </Button>
              <Button size="sm" variant="outline" onClick={() => setBuilds(1280)}>
                Reset
              </Button>
            </div>
          </Card>
          <Card flat padded>
            <h3 className={styles.cardTitle}>Seats used</h3>
            <p className={styles.statValue}>
              <NumberTicker value={2481} />
            </p>
            <p className={styles.cardText}>Formatting runs through Intl.NumberFormat.</p>
          </Card>
        </div>
      </Section>

      <Section
        title="List, links and result states"
        lead="Content primitives for settings rows, inline code and full-page outcomes."
      >
        <div className={styles.grid}>
          <List>
            <ListItem
              icon={<CircleCheck aria-hidden />}
              title="Design review"
              description="Thursday · 10:00–10:45"
              trailing={<Badge variant="soft">Soon</Badge>}
            />
            <ListItem
              icon={<Folder aria-hidden />}
              title="Component library"
              description="128 components · 14 modules"
              trailing="Updated"
            />
            <ListItem
              icon={<Users aria-hidden />}
              title="Members"
              description="12 seats used of 20"
              href="#/layout"
              trailing="Manage"
            />
          </List>
          <Result
            tone="success"
            title="Deployment complete"
            description="v0.2.0 is live in production. All health checks passed."
            actions={
              <>
                <Button size="sm">View deployment</Button>
                <Button size="sm" variant="outline">
                  Open logs
                </Button>
              </>
            }
          />
        </div>
        <div className={styles.demoStack}>
          <p className={styles.cardText}>
            Inline <Code>npm run build</Code> and a <Highlight>highlighted match</Highlight>{' '}
            inside copy. Read the <Link href="#/foundations" variant="standalone">foundations</Link>{' '}
            or open the <Link href="https://example.com" external>external reference</Link>.
          </p>
          <Heading as="h3" size="lg">
            A heading with semantic level and visual size
          </Heading>
        </div>
      </Section>

      <Section title="Descriptions" lead="Definition lists scale from one to three columns. The value wraps before the layout does.">
        <div className={styles.grid}>
          <Card flat padded>
            <DescriptionList columns={1}>
              <DescriptionItem term="Plan">Pro, billed yearly</DescriptionItem>
              <DescriptionItem term="Seats">12 of 20 used</DescriptionItem>
              <DescriptionItem term="Renewal">1 December 2026</DescriptionItem>
              <DescriptionItem term="Owner">Ada Lovelace</DescriptionItem>
            </DescriptionList>
          </Card>
          <Card flat padded>
            <DescriptionList columns={2}>
              <DescriptionItem term="Region">eu-west-1</DescriptionItem>
              <DescriptionItem term="Runtime">Node 22</DescriptionItem>
              <DescriptionItem term="Build">v0.1.0</DescriptionItem>
              <DescriptionItem term="Status">
                <Badge variant="success">Healthy</Badge>
              </DescriptionItem>
            </DescriptionList>
          </Card>
        </div>
      </Section>

      <Section title="Timeline" lead="Vertical, horizontal, status-toned and optionally animated. The pulse sweeps the default connector and respects reduced motion.">
        <div className={styles.demoStack}>
          <Card flat padded>
            <Timeline pulse>
              <TimelineItem status="done" tone="success" date="09:41">
                <TimelineTitle>Build completed</TimelineTitle>
                <TimelineDescription>All 2,099 modules transformed in 1.7s.</TimelineDescription>
                <TimelineTime dateTime="2026-11-05T09:41">5 Nov 2026</TimelineTime>
              </TimelineItem>
              <TimelineItem status="active" tone="active" date="09:46">
                <TimelineTitle>Design review</TimelineTitle>
                <TimelineDescription>Focus rings, table density and chart tooltips.</TimelineDescription>
                <TimelineTime dateTime="2026-11-05T09:46">5 Nov 2026</TimelineTime>
              </TimelineItem>
              <TimelineItem status="default" date="11:00">
                <TimelineTitle>Accessibility audit</TimelineTitle>
                <TimelineDescription>Lighthouse and keyboard pass.</TimelineDescription>
              </TimelineItem>
            </Timeline>
          </Card>

          <Card flat padded>
            <Timeline orientation="horizontal">
              <TimelineItem status="done" tone="success" date="1">
                <TimelineTitle>Draft</TimelineTitle>
                <TimelineDescription>Scope and copy.</TimelineDescription>
              </TimelineItem>
              <TimelineItem status="done" tone="success" date="2">
                <TimelineTitle>Build</TimelineTitle>
                <TimelineDescription>Components and tokens.</TimelineDescription>
              </TimelineItem>
              <TimelineItem status="active" tone="active" date="3">
                <TimelineTitle>Review</TimelineTitle>
                <TimelineDescription>Keyboard and contrast.</TimelineDescription>
              </TimelineItem>
              <TimelineItem status="default" date="4">
                <TimelineTitle>Ship</TimelineTitle>
                <TimelineDescription>Publish the package.</TimelineDescription>
              </TimelineItem>
            </Timeline>
          </Card>
        </div>
      </Section>

      <Section title="Tree and table" lead="The tree is a real keyboard widget: arrows, Home and End. The table wrapper is a labelled scroll region.">
        <div className={styles.grid}>
          <TreeView nodes={nodes} defaultExpanded={['src', 'components']} label="Project files" />
          <Card flat padded>
            <Table>
              <TableCaption>Recent invoices</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>INV-1042</TableCell>
                  <TableCell><Badge variant="success">Paid</Badge></TableCell>
                  <TableCell>$240.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>INV-1043</TableCell>
                  <TableCell><Badge variant="soft">Open</Badge></TableCell>
                  <TableCell>$240.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>INV-1044</TableCell>
                  <TableCell><Badge variant="destructive">Failed</Badge></TableCell>
                  <TableCell>$240.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>
      </Section>

      <Section title="Code and JSON" lead="Both viewers render plain text or spans; no untrusted HTML is injected.">
        <div className={styles.grid}>
          <JsonViewer data={{ name: 'react_scss', version: '0.2.0', features: ['scss', 'tokens', 'charts'], stable: true }} />
          <DiffViewer oldValue={oldCode} newValue={newCode} />
        </div>
      </Section>

      <Section
        title="Receipt and invoice"
        lead="Presentational finance surfaces with tabular figures, print styles and locale-aware formatting."
      >
        <div className={styles.grid}>
          <Receipt
            title="Order #1042"
            subtitle="Vorzela Store · 5 Nov 2026"
            items={[
              { label: 'Design tokens pack', qty: 1, amount: 48 },
              { label: 'Component license', qty: 2, amount: 120 },
              { label: 'Priority support', qty: 1, amount: 36 },
            ]}
            subtotal={204}
            tax={16.32}
            total={220.32}
            footer="Thanks for supporting source-owned UI."
          />
          <Invoice
            number="INV-2026-042"
            status="paid"
            issuedAt="1 Nov 2026"
            dueAt="15 Nov 2026"
            from={{ name: 'Vorzela Studio', lines: ['Nairobi, Kenya', 'billing@vorzela.dev'] }}
            to={{ name: 'Northwind Labs', lines: ['12 Market Street', 'London, UK'] }}
            items={[
              { description: 'Design system audit', quantity: 1, unitPrice: 1800 },
              { description: 'Component implementation', quantity: 24, unitPrice: 85 },
              { description: 'Accessibility review', quantity: 1, unitPrice: 640 },
            ]}
            taxRate={16}
            notes="Payment terms: net 14. Thank you."
          />
        </div>
      </Section>

      <Section title="States" lead="Empty and error states should say what happened and offer one next step.">
        <div className={styles.grid}>
          <Empty
            icon={<FolderOpen aria-hidden size={20} />}
            title="No projects yet"
            description="Create a project to start collecting builds and deployments."
            action={{ label: 'New project', onClick: () => {} }}
          />
          <ErrorState
            title="Could not load usage"
            description="The billing service is taking too long to respond."
            onRetry={() => {}}
          />
        </div>
        <div className={styles.demoStack}>
          <Banner tone="info" title="Scheduled maintenance">
            The API will be read-only on Saturday from 02:00–03:00 UTC.
          </Banner>
          <Banner tone="warning" title="Usage at 82%" dismissible>
            You have used 82% of this month's build minutes.
          </Banner>
          <Callout tone="tip" title="Copy, don't depend">
            Components are source-owned. Keep the module next to the component
            when you copy it into your app.
          </Callout>
        </div>
      </Section>

      <Section title="Bento and motion" lead="Bento tiles size by the grid container, not the viewport. The ticker and marquee respect reduced motion.">
        <BentoGrid>
          <BentoItem colSpan={2} rowSpan={2}>
            <h3 className={styles.cardTitle}>Release velocity</h3>
            <p className={styles.statValue}>
              <NumberTicker value={128} suffix=" builds" />
            </p>
            <p className={styles.cardText}>Across 14 projects this month.</p>
          </BentoItem>
          <BentoItem>
            <h3 className={styles.cardTitle}>Uptime</h3>
            <p className={styles.statValue}>99.98%</p>
          </BentoItem>
          <BentoItem>
            <h3 className={styles.cardTitle}>Members</h3>
            <p className={styles.statValue}>
              <NumberTicker value={2481} />
            </p>
          </BentoItem>
          <BentoItem colSpan={2}>
            <h3 className={styles.cardTitle}>Trusted by teams</h3>
            <Marquee speed={24}>
              <span className={styles.marqueeRow}>
                {['Northwind', 'Acme', 'Globex', 'Initech', 'Umbrella', 'Hooli'].map((name) => (
                  <span key={name} className={styles.marqueeItem}>
                    <Check aria-hidden size={14} />
                    {name}
                  </span>
                ))}
              </span>
            </Marquee>
          </BentoItem>
        </BentoGrid>
      </Section>
    </>
  )
}
