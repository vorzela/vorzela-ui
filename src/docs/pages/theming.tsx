import { Moon, Palette, Sun } from 'lucide-react'

import { Badge, Button, Card, StatusDot, Switch } from '~/components/ui'
import { CodeBlock, Demo, Section } from '../showcase'
import styles from '../docs.module.scss'

const overrideCode = `/* app.css — load after the kit's global.scss */
:root {
  --primary: 262 83% 58%;
  --radius-lg: 14px;
  --radius-xl: 18px;
  --radius-2xl: 22px;
}

.dark {
  --primary: 262 91% 72%;
}`

const runtimeCode = `// Toggle the class, not individual variables.
document.documentElement.classList.toggle('dark', isDark)
document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'`

const tokenRows = [
  ['--background / --foreground', 'Page canvas and primary text'],
  ['--card / --card-foreground', 'Raised surfaces and their text'],
  ['--primary / --primary-foreground', 'The single accent and text on it'],
  ['--secondary / --muted / --accent', 'Quiet, recessed and hover fills'],
  ['--destructive / --success', 'Error and confirmation'],
  ['--info / --warning', 'Neutral status and caution'],
  ['--border / --input / --ring', 'Hairline, field border, focus ring'],
  ['--radius-*', 'Continuous corner scale'],
  ['--shadow-1…3', 'Three soft elevations'],
  ['--duration-* / --ease-*', 'Motion timing'],
]

export function ThemingPage() {
  return (
    <>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>Theming</span>
        <h1 className={styles.heroTitle}>Retune it without a fork.</h1>
        <p className={styles.heroLead}>
          The kit ships semantic CSS variables, not hard-coded hex values. Override
          the accent, the radii or the whole palette in your app stylesheet and
          every component follows — in both themes.
        </p>
        <div className={styles.chipRow}>
          <span className={styles.chip}>
            <StatusDot tone="success" size="sm" />
            Runtime variables
          </span>
          <span className={styles.chip}>Light + dark</span>
          <span className={styles.chip}>No JS theme provider</span>
        </div>
      </header>

      <Section
        title="Override three things"
        lead="Most products only need a brand accent and slightly softer corners. Keep the variable names and the rest of the kit stays coherent."
      >
        <CodeBlock code={overrideCode} language="css" />
        <Demo title="Live accent" note="Current theme">
          <div className="vz-demo-row">
            <Button>Primary</Button>
            <Badge variant="primary">Currency</Badge>
            <StatusDot tone="info" pulse label="Syncing" />
            <span className="vz-demo-muted">--primary</span>
          </div>
        </Demo>
      </Section>

      <Section
        title="Light and dark"
        lead="Dark mode is a class on the document root. Switching it swaps the token block; components do not re-render and no stylesheet is loaded."
      >
        <div className={styles.demoGrid}>
          <Card flat padded>
            <span className={styles.cardIcon}>
              <Sun aria-hidden />
            </span>
            <h3 className={styles.cardTitle}>Light</h3>
            <p className={styles.cardText}>
              Page canvas at 97% lightness, white cards and a 91% hairline. The
              accent darkens to hold 4.5:1 on white.
            </p>
            <div className="vz-demo-row">
              <Badge variant="outline">--background</Badge>
              <Badge variant="soft">--card</Badge>
            </div>
          </Card>
          <Card flat padded>
            <span className={styles.cardIcon}>
              <Moon aria-hidden />
            </span>
            <h3 className={styles.cardTitle}>Dark</h3>
            <p className={styles.cardText}>
              Canvas and cards separate by 5% lightness, borders brighten instead
              of shadows, and the accent lightens for legibility.
            </p>
            <div className="vz-demo-row">
              <Badge variant="outline">.dark</Badge>
              <Badge variant="soft">color-scheme: dark</Badge>
            </div>
          </Card>
        </div>
        <CodeBlock code={runtimeCode} language="ts" />
      </Section>

      <Section
        title="The public variables"
        lead="Everything below is emitted by src/styles/global.scss. Treat the names as API; values are yours."
      >
        <div className={styles.tokenList}>
          {tokenRows.map(([token, role]) => (
            <div key={token} className={styles.tokenRow}>
              <span className={styles.tokenName}>{token}</span>
              <span className={styles.tokenValue}>{role}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Theme-aware example"
        lead="The same markup in either theme. Toggle the moon button in the top bar and watch this card."
      >
        <Demo title="Settings card" note="Both themes">
          <div className={styles.demoStack} style={{ maxWidth: '26rem' }}>
            <div className="vz-demo-row">
              <span className={styles.cardIcon}>
                <Palette aria-hidden />
              </span>
              <span>
                <span className={styles.cardTitle}>Appearance</span>
                <p className={styles.cardText}>Follows the system by default.</p>
              </span>
            </div>
            <Switch
              label="Reduce transparency"
              description="Uses solid surfaces instead of blurred chrome."
            />
            <Switch
              label="High contrast borders"
              description="Increases the hairline to a 1.5px visible border."
              reverse
            />
          </div>
        </Demo>
      </Section>

      <Section
        title="Adding a token"
        lead="Add the same key to both maps in tokens/_color.scss. The accessor fails the build if a component asks for a token that does not exist."
      >
        <CodeBlock
          code={`// src/styles/tokens/_color.scss
$light: (
  'brand': '262 83% 58%',
) !default;

$dark: (
  'brand': '262 91% 72%',
) !default;

// any module
@use 'styles' as vz;
.cta { background: vz.color('brand'); }`}
        />
      </Section>
    </>
  )
}
