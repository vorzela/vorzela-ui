import type { CSSProperties } from 'react'

import { Badge, Card, GlassPanel, Kbd } from '~/components/ui'
import { CodeBlock, Demo, Section } from '../showcase'
import styles from '../docs.module.scss'

const colors = [
  { token: 'background', role: 'Page canvas' },
  { token: 'foreground', role: 'Primary text' },
  { token: 'card', role: 'Raised surface' },
  { token: 'primary', role: 'Single accent' },
  { token: 'secondary', role: 'Quiet fill' },
  { token: 'muted', role: 'Recessed fill' },
  { token: 'accent', role: 'Hover wash' },
  { token: 'destructive', role: 'Error, delete' },
  { token: 'success', role: 'Confirmed' },
  { token: 'info', role: 'Neutral status' },
  { token: 'warning', role: 'Caution' },
  { token: 'border', role: 'Hairline' },
]

const typeScale = [
  { name: 'display', size: 'var(--text-5xl)', weight: 700, sample: 'Design with restraint' },
  { name: 'title-1', size: 'var(--text-3xl)', weight: 700, sample: 'A calmer product surface' },
  { name: 'title-2', size: 'var(--text-2xl)', weight: 600, sample: 'Settings and preferences' },
  { name: 'title-3', size: 'var(--text-xl)', weight: 600, sample: 'Workspace members' },
  { name: 'body', size: 'var(--text-base)', weight: 400, sample: 'The quick brown fox jumps over the lazy dog.' },
  { name: 'body-sm', size: 'var(--text-sm)', weight: 400, sample: 'Supporting copy sits at 14px with generous leading.' },
  { name: 'caption', size: 'var(--text-xs)', weight: 500, sample: 'UPPERCASE LABEL · 12PX' },
]

const spaceSteps = ['0.5', '1', '1.5', '2', '3', '4', '6', '8', '12', '16']

const radii = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full']

const durations = [
  { token: 'fast', value: '150ms', use: 'Hover, press' },
  { token: 'base', value: '200ms', use: 'Colour, border' },
  { token: 'slow', value: '300ms', use: 'Panels, drawers' },
  { token: 'slower', value: '500ms', use: 'Progress, large moves' },
]

const easings = [
  { token: 'out', value: 'cubic-bezier(0.22, 1, 0.36, 1)', use: 'Default exit' },
  { token: 'in-out', value: 'cubic-bezier(0.4, 0, 0.2, 1)', use: 'Symmetric moves' },
  { token: 'spring', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', use: 'Playful overshoot' },
]

const breakpoints = [
  { name: 'sm', value: '40rem', px: '640px' },
  { name: 'md', value: '48rem', px: '768px' },
  { name: 'lg', value: '64rem', px: '1024px' },
  { name: 'xl', value: '80rem', px: '1280px' },
  { name: '2xl', value: '96rem', px: '1536px' },
]

const layers = [
  { name: 'base', value: '0' },
  { name: 'dropdown', value: '1000' },
  { name: 'sticky', value: '1100' },
  { name: 'overlay', value: '1200' },
  { name: 'modal', value: '1300' },
  { name: 'popover', value: '1400' },
  { name: 'toast', value: '1500' },
  { name: 'tooltip', value: '1600' },
]

const colorCode = `// SCSS function
color: vz.color('primary', 0.85);

// equivalent CSS custom property
color: hsl(var(--primary) / 0.85);`

const typeCode = `.title {
  @include vz.text('title-3');
}

.meta {
  color: vz.color('muted-foreground');
  font-size: vz.font-size('sm');
}`

const spaceCode = `.stack {
  display: flex;
  flex-direction: column;
  gap: vz.space(3);
  padding: vz.space(5);
}`

const radiusCode = `.card {
  border-radius: vz.radius('xl');
}`

const elevationCode = `.card {
  box-shadow: vz.elevation(1);
}

.popover {
  box-shadow: vz.elevation(2);
}`

const motionCode = `.panel {
  transition:
    background-color vz.duration('base') vz.ease('out'),
    transform vz.duration('fast') vz.ease('spring');

  @include vz.motion-reduce {
    transition: none;
  }
}`

const breakpointsCode = `.grid {
  grid-template-columns: 1fr;

  @include vz.up('sm') {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @include vz.down('lg') {
    padding: vz.space(4);
  }
}`

const layersCode = `.modal {
  z-index: vz.z('modal');
}

.tooltip {
  z-index: vz.z('tooltip');
}`

const exampleCode = `@use '../../styles' as vz;

.card {
  display: flex;
  flex-direction: column;
  gap: vz.space(3);
  padding: vz.space(5);
  border: 1px solid vz.color('border');
  border-radius: vz.radius('xl');
  background: vz.color('card');
  box-shadow: vz.elevation(1);
  transition: box-shadow vz.duration('base') vz.ease('out');

  @include vz.hover {
    box-shadow: vz.elevation(2);
  }

  @include vz.motion-reduce {
    transition: none;
  }

  @include vz.down('md') {
    padding: vz.space(4);
  }
}`

export function FoundationsPage() {
  return (
    <>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>Foundations</span>
        <h1 className={styles.heroTitle}>The rules behind the surfaces.</h1>
        <p className={styles.heroLead}>
          A compact token layer: semantic colour, a 4px spacing grid, SF-first
          type, continuous radii, three elevations, four durations, five
          breakpoints and one z-index ladder. Everything below is a CSS custom
          property you can override — and a Sass helper you can call.
        </p>
      </header>

      <Section
        id="color"
        title="Colour"
        lead="Tokens are HSL triplets so alpha works without color-mix: hsl(var(--primary) / 0.18). Status colours are semantic, never decorative."
      >
        <div className={styles.swatchGrid}>
          {colors.map((color) => (
            <div key={color.token} className={styles.swatch}>
              <div
                className={styles.swatchColor}
                style={{ background: `hsl(var(--${color.token}))` }}
              />
              <div className={styles.swatchMeta}>
                <span className={styles.swatchName}>{color.role}</span>
                <span className={styles.swatchValue}>--{color.token}</span>
              </div>
            </div>
          ))}
        </div>
        <CodeBlock code={colorCode} language="scss" />
        <Demo title="Status tones" note="Soft fills, solid dots">
          <div className="vz-demo-row">
            <Badge variant="soft">Neutral</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </Demo>
      </Section>

      <Section
        id="type"
        title="Typography"
        lead="SF Pro on Apple platforms, Segoe UI on Windows, Roboto on Android. Sizes are fixed rems with tight tracking on display copy."
      >
        <div className={styles.typeStack}>
          {typeScale.map((row) => (
            <div key={row.name} className={styles.typeRow}>
              <span
                className={styles.typeSample}
                style={{
                  fontSize: row.size,
                  fontWeight: row.weight,
                  letterSpacing: row.name.startsWith('display') || row.name.startsWith('title-1') ? '-0.03em' : undefined,
                }}
              >
                {row.sample}
              </span>
              <span className={styles.typeMeta}>{row.name}</span>
            </div>
          ))}
        </div>
        <div className={styles.chipRow}>
          <span className={styles.chip}>400 regular</span>
          <span className={styles.chip}>500 medium</span>
          <span className={styles.chip}>600 semibold</span>
          <span className={styles.chip}>700 bold</span>
        </div>
        <CodeBlock code={typeCode} language="scss" />
      </Section>

      <Section
        id="space"
        title="Space"
        lead="A 4px base grid. Components use steps 1–8; page rhythm uses 12–24. Space is intentionally not fluid — density should stay predictable."
      >
        <div className={styles.spaceStack}>
          {spaceSteps.map((step) => (
            <div key={step} className={styles.spaceRow}>
              <span className={styles.spaceMeta}>space({step})</span>
              <span
                className={styles.spaceBar}
                style={{
                  width: `calc(var(--space-${step.replace('.', '-')}) * 5)`,
                }}
              />
            </div>
          ))}
        </div>
        <CodeBlock code={spaceCode} language="scss" />
      </Section>

      <Section
        id="radius"
        title="Radius"
        lead="Continuous corners, not pills for everything. Controls sit at 10–12px, cards at 16–20px, and only avatars and status use full rounding."
      >
        <div className={styles.radiusGrid}>
          {radii.map((radius) => (
            <div key={radius} className={styles.radiusCell}>
              <div
                className={styles.radiusBox}
                style={{ borderRadius: `var(--radius-${radius})` }}
              />
              <span className={styles.radiusMeta}>--radius-{radius}</span>
            </div>
          ))}
        </div>
        <CodeBlock code={radiusCode} language="scss" />
      </Section>

      <Section
        id="elevation"
        title="Elevation"
        lead="Three levels, all soft. Dark mode swaps to deeper black shadows rather than lightening surfaces with gradients."
      >
        <div className={styles.grid}>
          {[1, 2, 3].map((level) => (
            <div
              key={level}
              style={
                {
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-xl)',
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  boxShadow: `var(--shadow-${level})`,
                } satisfies CSSProperties
              }
            >
              <h3 className={styles.cardTitle}>Level {level}</h3>
              <p className={styles.cardText}>
                {level === 1
                  ? 'Cards, controls at rest.'
                  : level === 2
                    ? 'Hover lift, popovers.'
                    : 'Modals, mobile drawers.'}
              </p>
            </div>
          ))}
        </div>
        <CodeBlock code={elevationCode} language="scss" />
      </Section>

      <Section
        id="glass"
        title="Glass"
        lead="Translucency is a surface, not a decoration. GlassPanel uses a backdrop blur with an opaque fallback when the browser cannot filter."
      >
        <div className={styles.glassStage}>
          <span className={styles.glassBlobA} aria-hidden />
          <span className={styles.glassBlobB} aria-hidden />
          <GlassPanel blur="lg" className={styles.glassCard}>
            <span className={styles.eyebrow}>Glass panel</span>
            <h3 className={styles.cardTitle}>Layered translucency</h3>
            <p className={styles.cardText}>
              A 20px blur, a 60% card tint and a hairline border. The panel keeps
              text readable over moving colour and falls back to an opaque card
              when `backdrop-filter` is missing.
            </p>
            <div className={styles.chipRow}>
              <Badge variant="soft">backdrop-filter</Badge>
              <Badge variant="outline">opaque fallback</Badge>
            </div>
          </GlassPanel>
        </div>
      </Section>

      <Section
        id="motion"
        title="Motion"
        lead="Short, purposeful transitions with a single out-curve. Reduced-motion disables decorative movement globally."
      >
        <div className={styles.tokenList}>
          {durations.map((duration) => (
            <div key={duration.token} className={styles.tokenRow}>
              <span className={styles.tokenName}>--duration-{duration.token}</span>
              <span className={styles.tokenValue}>
                {duration.value} · {duration.use}
              </span>
            </div>
          ))}
          {easings.map((easing) => (
            <div key={easing.token} className={styles.tokenRow}>
              <span className={styles.tokenName}>vz.ease(&apos;{easing.token}&apos;)</span>
              <span className={styles.tokenValue}>
                {easing.value} · {easing.use}
              </span>
            </div>
          ))}
        </div>
        <CodeBlock code={motionCode} language="scss" />
        <Card flat padded>
          <h3 className={styles.cardTitle}>Keyboard focus</h3>
          <p className={styles.cardText}>
            Focus uses <code className={styles.codeInline}>outline</code> with a
            2px offset so it follows rounded corners and never shifts layout.
            Press <Kbd size="sm">Tab</Kbd> through this page to see it.
          </p>
        </Card>
      </Section>

      <Section
        id="breakpoints"
        title="Breakpoints"
        lead="Five viewport stops on the same scale. There is intentionally no xs stop — the base styles are the mobile layout. Prefer container queries for reusable components; use viewport breakpoints for page-level layout."
      >
        <div className={styles.tokenList}>
          {breakpoints.map((breakpoint) => (
            <div key={breakpoint.name} className={styles.tokenRow}>
              <span className={styles.tokenName}>
                @include vz.up(&apos;{breakpoint.name}&apos;)
              </span>
              <span className={styles.tokenValue}>
                {breakpoint.value} · {breakpoint.px}
              </span>
            </div>
          ))}
        </div>
        <CodeBlock code={breakpointsCode} language="scss" />
      </Section>

      <Section
        id="layers"
        title="Layers"
        lead="One stacking ladder for every overlay. Do not invent local z-index values; pick the layer that matches the surface."
      >
        <div className={styles.tokenList}>
          {layers.map((layer) => (
            <div key={layer.name} className={styles.tokenRow}>
              <span className={styles.tokenName}>vz.z(&apos;{layer.name}&apos;)</span>
              <span className={styles.tokenValue}>{layer.value}</span>
            </div>
          ))}
        </div>
        <CodeBlock code={layersCode} language="scss" />
      </Section>

      <Section
        id="scss"
        title="Use it in your SCSS"
        lead="All of the above is available through one Sass entry point. The same API works in your own modules, not just the kit."
      >
        <CodeBlock code={exampleCode} language="scss" />
        <Demo title="Full reference" note="docs">
          <p className={styles.cardText}>
            The <a className={styles.apiLink} href="#/scss">SCSS API</a> page
            lists every token function and mixin, including responsive and
            container-query helpers. New SCSS files get the import automatically
            when you run <code className={styles.codeInline}>vorzela-ui init</code>.
          </p>
        </Demo>
      </Section>
    </>
  )
}
