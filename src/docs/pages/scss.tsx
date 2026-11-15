import { CodeBlock, Demo, Section } from '../showcase'
import styles from '../docs.module.scss'

const importCode = `// app/styles/custom/price-tag.scss
@use '..' as vz;

.price {
  color: vz.color('foreground');
}`

const tokenRows = [
  ['vz.color($name, $alpha: 1)', 'Semantic colour from CSS variables', "vz.color('primary', 0.9)"],
  ['vz.space($step)', '4px spacing scale', 'vz.space(4)'],
  ['vz.font-size($name)', 'Primitive type size', "vz.font-size('sm')"],
  ['vz.text($preset)', 'Size + line-height + weight + tracking', "vz.text('title-3')"],
  ['vz.radius($name)', 'Continuous corner radius', "vz.radius('xl')"],
  ['vz.elevation($level)', 'Shadow level 1–3', 'vz.elevation(2)'],
  ['vz.duration($name)', 'Motion duration', "vz.duration('fast')"],
  ['vz.ease($name)', 'Motion easing', "vz.ease('out')"],
  ['vz.z($name)', 'Stacking layer', "vz.z('modal')"],
]

const mixinRows = [
  ['vz.focus-ring($width, $offset, $alpha, $token)', 'Visible keyboard focus ring'],
  ['vz.hover', 'Hover only on fine pointers'],
  ['vz.active', 'Pressed state'],
  ['vz.disabled', 'Native :disabled and aria-disabled'],
  ['vz.selected', 'aria-selected and data-state="selected"'],
  ['vz.placeholder', 'Input placeholder styles'],
  ['vz.surface($level: 1)', 'Card surface with border and elevation'],
  ['vz.raised($level: 2)', 'Popover/dropdown surface'],
  ['vz.inset', 'Recessed well for code and groups'],
  ['vz.truncate', 'Single-line ellipsis'],
  ['vz.line-clamp($lines: 2)', 'Multi-line clamp'],
  ['vz.scrollbar($size: 10px)', 'Theme-aware slim scrollbar'],
  ['vz.icon($step: 4)', 'Normalise an inline SVG icon'],
  ['vz.supports($feature)', 'Progressive enhancement gate'],
  ['vz.progressive($property, $fallback, $modern)', 'Fallback-first declaration'],
  ['vz.motion-safe / vz.motion-reduce', 'Reduced-motion guards'],
  ['vz.group-hover / vz.group-focus', 'Style children from a parent state'],
  ['vz.peer-focus / vz.peer-checked', 'Style a sibling from a peer state'],
]

const responsiveCode = `@use '..' as vz;

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: vz.space(4);

  @include vz.up('sm') {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @include vz.up('lg') {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @include vz.between('md', 'lg') {
    gap: vz.space(6);
  }
}

// Container query version for reusable components
.card {
  container-type: inline-size;

  @include vz.container-up(28rem) {
    display: flex;
  }
}`

const moduleCode = `@use '..' as vz;

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
}

.title {
  @include vz.text('title-3');
  @include vz.truncate;

  margin: 0;
}

.meta {
  color: vz.color('muted-foreground');
  font-size: vz.font-size('sm');
}

.status {
  display: inline-flex;
  align-items: center;
  gap: vz.space(1.5);
  color: vz.color('success');
}`

const vscodeCode = `# Run once in the project root
vorzela-ui init

# Then type vz-scss in a new file under app/styles/custom.
# The snippet inserts @use lines plus the token, responsive,
# mixin and sass:math reference.

# Skip .vscode settings and snippets
vorzela-ui init --no-vscode`

export function ScssPage() {
  return (
    <>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>SCSS API</span>
        <h1 className={styles.heroTitle}>Custom styles, same tokens.</h1>
        <p className={styles.heroLead}>
          Every kit component is written with a small Sass API. Use the same
          functions and mixins in your own <code>*.module.scss</code> files so
          spacing, colour, radii, motion and responsive rules stay in sync with
          the kit.
        </p>
        <div className={styles.chipRow}>
          <span className={styles.chip}>SCSS Modules</span>
          <span className={styles.chip}>CSS variables</span>
          <span className={styles.chip}>No Tailwind</span>
        </div>
      </header>

      <Section
        id="import"
        title="Import the API once per module"
        lead="Start custom files with @use '..' as vz. Generated component modules live under components/ and import the same API with ../../; do not edit them."
      >
        <CodeBlock code={importCode} language="scss" />
        <Demo title="Path rule" note="relative to the custom folder">
          <p className={styles.cardText}>
            From <code>app/styles/custom</code>, the styles API at{' '}
            <code>app/styles</code> is <code>..</code>. Generated modules under{' '}
            <code>app/styles/components/ui</code> use <code>../..</code>. Only
            one <code>@use</code> per module is needed.
          </p>
        </Demo>
      </Section>

      <Section
        id="tokens"
        title="Token functions"
        lead="These read the same CSS variables the kit emits. Themes swap the values without rebuilding your styles."
      >
        <table className={styles.apiTable}>
          <thead>
            <tr>
              <th>Function</th>
              <th>What it does</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            {tokenRows.map(([name, description, example]) => (
              <tr key={name}>
                <td className={styles.apiName}>{name}</td>
                <td>{description}</td>
                <td className={styles.apiDefault}>{example}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section
        id="mixins"
        title="Mixins"
        lead="Interaction, surfaces, truncation, scrollbars, icons and progressive enhancement. All mixins are namespaced with vz."
      >
        <table className={styles.apiTable}>
          <thead>
            <tr>
              <th>Mixin</th>
              <th>Use</th>
            </tr>
          </thead>
          <tbody>
            {mixinRows.map(([name, description]) => (
              <tr key={name}>
                <td className={styles.apiName}>{name}</td>
                <td>{description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section
        id="responsive"
        title="Responsive rules"
        lead="The breakpoint mixins use the kit’s scale: sm 40rem, md 48rem, lg 64rem, xl 80rem, 2xl 96rem. Prefer container queries for reusable components."
      >
        <CodeBlock code={responsiveCode} language="scss" />
        <Demo title="Breakpoints" note="min-width">
          <div className={styles.tokenList}>
            {['sm · 40rem', 'md · 48rem', 'lg · 64rem', 'xl · 80rem', '2xl · 96rem'].map(
              (row) => (
                <div key={row} className={styles.tokenRow}>
                  <span className={styles.tokenName}>{row.split(' · ')[0]}</span>
                  <span className={styles.tokenValue}>{row.split(' · ')[1]}</span>
                </div>
              ),
            )}
          </div>
        </Demo>
      </Section>

      <Section
        id="module"
        title="A complete custom module"
        lead="A card that uses colour, spacing, radius, elevation, motion, interaction, responsive and text presets together."
      >
        <CodeBlock code={moduleCode} language="scss" />
        <Demo title="Rules of thumb" note="keep it small">
          <ul>
            <li>Use semantic colour names, never raw hex values.</li>
            <li>Use the 4px spacing scale instead of arbitrary pixels.</li>
            <li>Put interaction states behind <code>vz.hover</code>, not bare <code>:hover</code>.</li>
            <li>Wrap non-essential motion in <code>vz.motion-safe</code> or disable it with <code>vz.motion-reduce</code>.</li>
            <li>Name custom files <code>*.scss</code>; generated component files stay <code>*.module.scss</code>.</li>
            <li>Do not edit generated modules under <code>components/</code>; add overrides in <code>custom/</code>.</li>
          </ul>
        </Demo>
      </Section>

      <Section
        id="editor"
        title="VS Code helper"
        lead="vorzela-ui init merges .vscode settings and writes a snippet file. Type vz-scss in a new SCSS file to insert the @use lines and a compact API reference."
      >
        <CodeBlock code={vscodeCode} language="bash" />
        <Demo title="Also included" note="custom folder">
          <p className={styles.cardText}>
            <code>styles/custom/_index.scss</code> is imported by{' '}
            <code>global.scss</code> and documents the token, responsive, mixin
            and <code>sass:math</code> helpers. Add new files beside it and
            import them from that index.
          </p>
        </Demo>
      </Section>
    </>
  )
}
