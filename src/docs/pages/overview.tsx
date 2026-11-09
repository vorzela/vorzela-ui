import {
  Accessibility,
  ArrowRight,
  Boxes,
  Feather,
  Layers,
  Moon,
  Palette,
  Zap,
} from 'lucide-react'

import { Badge, Button, Card, StatusDot } from '~/components/ui'
import { navigate } from '../hooks'
import { inventoryCount } from '../inventory'
import { CodeBlock, Demo, Section } from '../showcase'
import { useLatestTag } from '../use-latest-tag'
import styles from '../docs.module.scss'

const installCode = `# install only the components you use
npx vorzela-ui init
npx vorzela-ui add button card input`

const usageCode = `import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import '~/styles/global.scss'

export function SignIn() {
  return (
    <Card padded>
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
      />
      <Button>Continue</Button>
    </Card>
  )
}`

const principles = [
  {
    icon: Layers,
    title: 'Layered, not loud',
    text: 'Neutral surfaces, hairline borders and one accent. Depth comes from a restrained shadow scale, not gradients.',
  },
  {
    icon: Feather,
    title: 'CSS Modules, owned',
    text: 'Every component ships one .module.scss file. No utility soup, no runtime style engine, no merge layer.',
  },
  {
    icon: Palette,
    title: 'Tokens that retune',
    text: 'Colour, radius, spacing, motion and elevation are CSS variables. Change them once and the kit follows.',
  },
  {
    icon: Accessibility,
    title: 'Keyboard first',
    text: 'Visible focus rings, roving tabindex, labelled controls and reduced-motion fallbacks are built in.',
  },
]

const highlights = [
  { name: 'Button', slug: 'button', copy: 'Six tones, flat fills, one primary per view.' },
  { name: 'Input', slug: 'input', copy: 'Inline validation with a calm focus ring.' },
  { name: 'Card', slug: 'card', copy: 'Composable surface with soft elevation.' },
  { name: 'Tabs', slug: 'tabs', copy: 'Arrow-key navigation and focusable panels.' },
  { name: 'Switch', slug: 'switch', copy: 'Instant settings with readable descriptions.' },
  { name: 'Progress', slug: 'progress', copy: 'Determinate or indeterminate, four tones.' },
]

export function OverviewPage() {
  const version = useLatestTag()

  return (
    <>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>
          <StatusDot tone="success" size="sm" />
          React 19 · SCSS Modules · v{version}
        </span>
        <h1 className={styles.heroTitle}>Interfaces with less noise.</h1>
        <p className={styles.heroLead}>
          A small React UI kit with an Apple-inspired product language: layered
          neutral surfaces, SF-first type, continuous corners and one accent.
          Built on plain SCSS Modules — no Tailwind, no class merging, no runtime
          CSS.
        </p>
        <div className={styles.heroActions}>
          <Button onClick={() => navigate('components')}>
            Browse components
            <ArrowRight aria-hidden />
          </Button>
          <Button variant="outline" onClick={() => navigate('foundations')}>
            Read the foundations
          </Button>
        </div>
        <div className={styles.heroMeta}>
          <span className={styles.metaItem}>
            <span className={styles.metaValue}>{inventoryCount}</span>
            <span className={styles.metaLabel}>Components</span>
          </span>
          <span className={styles.metaItem}>
            <span className={styles.metaValue}>8</span>
            <span className={styles.metaLabel}>Token groups</span>
          </span>
          <span className={styles.metaItem}>
            <span className={styles.metaValue}>0</span>
            <span className={styles.metaLabel}>Runtime CSS deps</span>
          </span>
          <span className={styles.metaItem}>
            <span className={styles.metaValue}>Safari 16.4+</span>
            <span className={styles.metaLabel}>Baseline support</span>
          </span>
        </div>
      </header>

      <Section
        title="Start in a minute"
        lead="The kit is a source package, not a black box. Copy a component, keep the module next to it, and change what you need."
      >
        <div className={styles.demoGrid}>
          <CodeBlock code={installCode} language="bash" />
          <CodeBlock code={usageCode} language="tsx" />
        </div>
      </Section>

      <Section
        title="What it optimises for"
        lead="A product interface should feel calm at 9am and at 9pm. These are the rules the kit follows."
      >
        <div className={styles.grid}>
          {principles.map((principle) => {
            const Icon = principle.icon
            return (
              <Card key={principle.title} flat padded>
                <span className={styles.cardIcon}>
                  <Icon aria-hidden />
                </span>
                <h3 className={styles.cardTitle}>{principle.title}</h3>
                <p className={styles.cardText}>{principle.text}</p>
              </Card>
            )
          })}
        </div>
      </Section>

      <Section
        title="A small, complete set"
        lead="Grouped by the job it does — not by file name. Every entry has a live demo, a copyable snippet and an API table."
      >
        <div className={styles.componentGrid}>
          {highlights.map((item) => (
            <a
              key={item.slug}
              href={`#/components/${item.slug}`}
              className={styles.componentCard}
            >
              <span className={styles.componentTop}>
                <span className={styles.componentName}>{item.name}</span>
                <ArrowRight size={14} aria-hidden />
              </span>
              <p className={styles.componentDesc}>{item.copy}</p>
            </a>
          ))}
        </div>
      </Section>

      <Section
        title="Two themes, one token set"
        lead="Light and dark are the same semantic tokens with different values. The toggle in the top bar writes to localStorage and respects the OS preference on first visit."
      >
        <Demo title="Semantic state" note="Always paired with text">
          <div className="vz-demo-row">
            <span className="vz-status-item">
              <StatusDot tone="success" pulse /> Operational
            </span>
            <span className="vz-status-item">
              <StatusDot tone="warning" /> Degraded
            </span>
            <span className="vz-status-item">
              <StatusDot tone="danger" /> Outage
            </span>
            <Badge variant="soft">No colour-only signals</Badge>
          </div>
        </Demo>
        <div className={styles.grid} style={{ marginTop: '1rem' }}>
          <Card flat padded>
            <span className={styles.cardIcon}>
              <Zap aria-hidden />
            </span>
            <h3 className={styles.cardTitle}>Runtime switching</h3>
            <p className={styles.cardText}>
              Toggling <code className={styles.codeInline}>.dark</code> on the
              document swaps every variable at once — no re-render required.
            </p>
          </Card>
          <Card flat padded>
            <span className={styles.cardIcon}>
              <Moon aria-hidden />
            </span>
            <h3 className={styles.cardTitle}>Respectful motion</h3>
            <p className={styles.cardText}>
              Essential transitions stay; decorative movement is disabled under
              <code className={styles.codeInline}>prefers-reduced-motion</code>.
            </p>
          </Card>
          <Card flat padded>
            <span className={styles.cardIcon}>
              <Boxes aria-hidden />
            </span>
            <h3 className={styles.cardTitle}>Boring by design</h3>
            <p className={styles.cardText}>
              Typed variant maps, forwardRef on controls, no CVA and no
              compile-time magic to debug.
            </p>
          </Card>
        </div>
      </Section>
    </>
  )
}
