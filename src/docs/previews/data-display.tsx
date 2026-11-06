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

import { AspectRatio } from '~/components/ui/aspect-ratio'
import { Badge } from '~/components/ui/badge'
import { Banner } from '~/components/ui/banner'
import { BentoGrid, BentoItem } from '~/components/ui/bento-grid'
import { Button } from '~/components/ui/button'
import { Callout } from '~/components/ui/callout'
import { Card } from '~/components/ui/card'
import { DescriptionItem, DescriptionList } from '~/components/ui/description-list'
import { DiffViewer } from '~/components/ui/diff-viewer'
import { Empty } from '~/components/ui/empty'
import { ErrorState } from '~/components/ui/error-state'
import { Invoice } from '~/components/ui/invoice'
import { JsonViewer } from '~/components/ui/json-viewer'
import { Link } from '~/components/ui/link'
import { List, ListItem } from '~/components/ui/list'
import { Marquee } from '~/components/ui/marquee'
import { NumberTicker } from '~/components/ui/number-ticker'
import { Receipt } from '~/components/ui/receipt'
import { Result } from '~/components/ui/result'
import { Stat, StatGroup } from '~/components/ui/stat'
import {
  Timeline,
  TimelineDescription,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from '~/components/ui/timeline'
import { TreeView } from '~/components/ui/tree-view'
import { Code, Heading, Highlight } from '~/components/ui/typography'

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

export const dataPreviews = {
  'stat': (
    <StatGroup>
      <Stat label="Monthly revenue" value="$76.2k" delta="12.4%" trend="up" icon={<ArrowUpRight aria-hidden size={15} />} />
      <Stat label="Active members" value="2,481" delta="3.1%" trend="up" icon={<Users aria-hidden size={15} />} />
      <Stat label="Error rate" value="0.42%" delta="0.08%" trend="down" invertTrend icon={<ShieldCheck aria-hidden size={15} />} />
      <Stat label="p95 latency" value="184ms" delta="6ms" trend="flat" icon={<Gauge aria-hidden size={15} />} />
    </StatGroup>
  ),
  'description-list': (
    <Card flat padded>
      <DescriptionList columns={2}>
        <DescriptionItem term="Plan">Pro, billed yearly</DescriptionItem>
        <DescriptionItem term="Seats">12 of 20 used</DescriptionItem>
        <DescriptionItem term="Region">eu-west-1</DescriptionItem>
        <DescriptionItem term="Status">
          <Badge variant="success">Healthy</Badge>
        </DescriptionItem>
      </DescriptionList>
    </Card>
  ),
  'timeline': (
    <Card flat padded>
      <Timeline pulse>
        <TimelineItem status="done" tone="success" date="09:41">
          <TimelineTitle>Build completed</TimelineTitle>
          <TimelineDescription>All modules transformed in 1.7s.</TimelineDescription>
          <TimelineTime dateTime="2026-11-05T09:41">5 Nov 2026</TimelineTime>
        </TimelineItem>
        <TimelineItem status="active" tone="active" date="09:46">
          <TimelineTitle>Design review</TimelineTitle>
          <TimelineDescription>Focus rings, table density and chart tooltips.</TimelineDescription>
        </TimelineItem>
        <TimelineItem status="default" date="11:00">
          <TimelineTitle>Accessibility audit</TimelineTitle>
          <TimelineDescription>Lighthouse and keyboard pass.</TimelineDescription>
        </TimelineItem>
      </Timeline>
    </Card>
  ),
  'tree-view': (
    <TreeView nodes={nodes} defaultExpanded={['src', 'components']} label="Project files" />
  ),
  'json-viewer': (
    <JsonViewer
      data={{ name: 'react_scss', version: '0.2.0', features: ['scss', 'tokens', 'charts'], stable: true }}
    />
  ),
  'diff-viewer': <DiffViewer oldValue={oldCode} newValue={newCode} />,
  'empty': (
    <Empty
      icon={<FolderOpen aria-hidden size={20} />}
      title="No projects yet"
      description="Create a project to start collecting builds and deployments."
      action={{ label: 'New project', onClick: () => {} }}
    />
  ),
  'error-state': (
    <ErrorState
      title="Could not load usage"
      description="The billing service is taking too long to respond."
      onRetry={() => {}}
    />
  ),
  'banner': (
    <div className={styles.demoStack}>
      <Banner tone="info" title="Scheduled maintenance">
        The API will be read-only on Saturday from 02:00–03:00 UTC.
      </Banner>
      <Banner tone="warning" title="Usage at 82%" dismissible>
        You have used 82% of this month's build minutes.
      </Banner>
    </div>
  ),
  'callout': (
    <Callout tone="tip" title="Copy, don't depend">
      Components are source-owned. Keep the module next to the component when you
      copy it into your app.
    </Callout>
  ),
  'number-ticker': (
    <p className={styles.statValue}>
      <NumberTicker value={2481} />
    </p>
  ),
  'marquee': (
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
  ),
  'bento-grid': (
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
    </BentoGrid>
  ),
  'aspect-ratio': (
    <AspectRatio ratio={16 / 9}>
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          height: '100%',
          borderRadius: 'var(--radius-lg)',
          background: 'hsl(var(--chart-1) / 0.14)',
          color: 'hsl(var(--chart-1))',
          fontWeight: 600,
        }}
      >
        16 : 9 media
      </div>
    </AspectRatio>
  ),
  'receipt': (
    <Receipt
      title="Order #1042"
      subtitle="Vorzela Store · 5 Nov 2026"
      items={[
        { label: 'Design tokens pack', qty: 1, amount: 48 },
        { label: 'Component license', qty: 2, amount: 120 },
      ]}
      subtotal={168}
      tax={13.44}
      total={181.44}
      footer="Thanks for supporting source-owned UI."
    />
  ),
  'invoice': (
    <Invoice
      number="INV-2026-042"
      status="paid"
      issuedAt="1 Nov 2026"
      dueAt="15 Nov 2026"
      from={{ name: 'Vorzela Studio', lines: ['Nairobi, Kenya', 'billing@vorzela.dev'] }}
      to={{ name: 'Northwind Labs', lines: ['12 Market Street', 'London, UK'] }}
      items={[{ description: 'Design system audit', quantity: 1, unitPrice: 1800 }]}
      taxRate={16}
      notes="Payment terms: net 14."
    />
  ),
  'list': (
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
    </List>
  ),
  'link': (
    <p className={styles.cardText}>
      Read the <Link href="#/foundations" variant="standalone">foundations</Link> or open the{' '}
      <Link href="https://example.com" external>external reference</Link>.
    </p>
  ),
  'code': (
    <p className={styles.cardText}>
      Inline <Code>npm run build</Code> code.
    </p>
  ),
  'highlight': (
    <p className={styles.cardText}>
      A <Highlight>highlighted match</Highlight> inside copy.
    </p>
  ),
  'heading': (
    <Heading as="h3" size="lg">
      A heading with semantic level and visual size
    </Heading>
  ),
  'result': (
    <Result
      tone="success"
      title="Deployment complete"
      description="v0.2.0 is live in production. All health checks passed."
      actions={
        <>
          <Button size="sm">View deployment</Button>
          <Button size="sm" variant="outline">Open logs</Button>
        </>
      }
    />
  ),
}
