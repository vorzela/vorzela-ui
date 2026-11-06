import { Check } from 'lucide-react'

import { Badge, Button, Input, Kbd, Separator, Switch } from '~/components/ui'
import { Demo, Section } from '../showcase'
import styles from '../docs.module.scss'

const builtIn = [
  {
    title: 'Visible focus, never removed',
    text: 'Every interactive component uses a 2px outline with an offset. The ring follows the corner radius and does not consume layout space.',
  },
  {
    title: 'Labels are programmatic',
    text: 'Input and Textarea generate ids with useId, link the label, and attach hint and error text through aria-describedby.',
  },
  {
    title: 'Errors announce themselves',
    text: 'Field errors use role="alert"; the destructive Alert uses it too. Informational tones use role="status" so they stay polite.',
  },
  {
    title: 'Roving tabindex in Tabs',
    text: 'Only the selected tab is in the tab order. Arrow keys move selection, Home and End jump to the ends, and panels are focusable.',
  },
  {
    title: 'Switch semantics, not a checkbox',
    text: 'The switch is a button with role="switch" and aria-checked, so screen readers announce on/off rather than checked/unchecked.',
  },
  {
    title: 'Motion respects the OS',
    text: 'A global reduced-motion guard collapses decorative animation; non-essential transitions are also disabled inside components.',
  },
  {
    title: 'Colour is never the only signal',
    text: 'Status dots ship with text, alerts pair an icon with a title, and badges carry a word. Tone is reinforcement.',
  },
  {
    title: 'Disabled is still discoverable',
    text: 'Disabled controls dim and block interaction but keep their accessible name and position in the reading order.',
  },
]

const keyboard = [
  ['Tab / Shift+Tab', 'Move between controls and landing on the selected tab.'],
  ['Enter / Space', 'Activate a button or flip a switch.'],
  ['Arrow keys', 'Move between tabs on the axis set by orientation.'],
  ['Home / End', 'Jump to the first or last tab.'],
  ['Esc', 'Expected to close overlays; the docs shell closes the mobile sidebar.'],
]

export function AccessibilityPage() {
  return (
    <>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>Accessibility</span>
        <h1 className={styles.heroTitle}>Usable before it is pretty.</h1>
        <p className={styles.heroLead}>
          The kit targets WCAG 2.2 AA for contrast and interaction. Semantics,
          focus order and announcements are part of each component — not an
          afterthought you add per screen.
        </p>
        <div className={styles.chipRow}>
          <span className={styles.chip}>WCAG 2.2 AA target</span>
          <span className={styles.chip}>Keyboard complete</span>
          <span className={styles.chip}>Screen-reader tested patterns</span>
        </div>
      </header>

      <Section
        title="Built in, not bolted on"
        lead="These behaviours ship with the components. If you fork one, keep them."
      >
        <div className={styles.checkList}>
          {builtIn.map((item) => (
            <div key={item.title} className={styles.checkItem}>
              <span className={styles.checkIcon}>
                <Check aria-hidden />
              </span>
              <div className={styles.checkBody}>
                <h3 className={styles.checkTitle}>{item.title}</h3>
                <p className={styles.checkText}>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Keyboard map"
        lead="Expected behaviour across the component set. Native controls keep their browser defaults."
      >
        <div className={styles.demo} style={{ overflowX: 'auto' }}>
          <table className={styles.apiTable}>
            <thead>
              <tr>
                <th scope="col">Keys</th>
                <th scope="col">Behaviour</th>
              </tr>
            </thead>
            <tbody>
              {keyboard.map(([keys, behaviour]) => (
                <tr key={keys}>
                  <td className={styles.apiName}>{keys}</td>
                  <td>{behaviour}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Try the focus order"
        lead="Tab through the controls below. The outline should always be visible, including on the switch and the input."
      >
        <Demo title="Focus playground" note="Press Tab">
          <div className={styles.demoStack}>
            <div className={styles.demoField}>
              <Input label="Project name" placeholder="Vorzela UI" />
            </div>
            <div className="vz-demo-row">
              <Button>Primary action</Button>
              <Button variant="outline">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <Switch
              label="Email notifications"
              description="A short confirmation when a build finishes."
              defaultChecked
            />
            <div className="vz-demo-row">
              <span className="vz-demo-muted">Shortcut</span>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
              <Separator orientation="vertical" />
              <Badge variant="soft">Focus visible</Badge>
            </div>
          </div>
        </Demo>
      </Section>

      <Section
        title="Contrast and colour"
        lead="Body text meets 4.5:1, large text and borders meet 3:1. Status hues are paired with text so colour-blind users are not excluded."
      >
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Text</h3>
            <p className={styles.cardText}>
              Foreground on background and card are checked in both themes. Muted
              text is reserved for secondary copy at 14px or larger.
            </p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Borders</h3>
            <p className={styles.cardText}>
              Hairlines are decorative. Anything that conveys state also carries
              an icon, a label or a shape change.
            </p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Focus</h3>
            <p className={styles.cardText}>
              The ring uses the accent at 60% opacity over the surface, with a
              2px offset so it stays visible on same-coloured backgrounds.
            </p>
          </div>
        </div>
      </Section>
    </>
  )
}
