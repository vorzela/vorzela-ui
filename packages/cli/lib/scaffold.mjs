import fs from 'node:fs'
import path from 'node:path'

const apiComments = [
  '// ── Vorzela Sass API ─────────────────────────────────────────',
  '// Tokens',
  "//   vz.color('primary', 0.9)      semantic colour with alpha",
  "//   vz.space(4)                   spacing scale",
  "//   vz.font-size('sm')            type scale",
  "//   vz.radius('lg')               corner radius",
  '//   vz.elevation(2)               shadow level',
  "//   vz.duration('base')           motion duration",
  "//   vz.ease('out')                motion easing",
  "//   vz.z('popover')               z-index layer",
  '',
  '// Responsive',
  "//   @include vz.up('md') { … }        min-width 48rem",
  "//   @include vz.down('lg') { … }      below 64rem",
  "//   @include vz.between('sm', 'lg') { … }",
  '//   @include vz.container-up(28rem) { … }',
  "//   vz.breakpoint-value('md')         48rem",
  '',
  '// Mixins',
  '//   @include vz.surface(1);',
  '//   @include vz.raised(2);',
  '//   @include vz.inset;',
  '//   @include vz.scrim(12px, 0.5);',
  '//   @include vz.focus-ring(2px, 2px, 0.6);',
  '//   @include vz.truncate;',
  '//   @include vz.line-clamp(2);',
  '//   @include vz.scrollbar(10px);',
  '//   @include vz.icon(4);',
  '//   @include vz.hover { … }',
  '//   @include vz.active { … }',
  '//   @include vz.disabled { … }',
  '//   @include vz.motion-reduce { … }',
  '',
  '// Sass math (Dart Sass)',
  '//   math.div(100%, 3)',
  '//   math.percentage(math.div(1, 3))',
  '//   math.round(1.6)',
  '//   math.clamp(1rem, 2vw, 2rem)',
  '',
  '// Overrides',
  '//   Prefer semantic tokens for theme-wide changes:',
  '//   :root { --primary: 217 91% 46%; }',
  '//   .dark { --primary: 211 100% 58%; }',
  '',
  '//   For a single component, reuse its CSS variables rather than copying the',
  '//   generated module into this folder.',
  '// ─────────────────────────────────────────────────────────────',
]

const customHeader = [
  '// ── Vorzela custom styles ──────────────────────────────────',
  '// Add your own selectors, theme overrides and new component styles here.',
  '// Do not edit the generated files under components/ or charts/; updates',
  '// replace them. Keep your changes in this folder instead.',
  '',
  '// global.scss imports this file automatically. Split larger sets into',
  "// neighbouring files and add `@use 'buttons';` style rules below.",
  '// ─────────────────────────────────────────────────────────────',
]

export const customIndexContent = [
  ...customHeader,
  '',
  "@use '..' as vz;",
  "@use 'sass:math';",
  '',
  ...apiComments,
  '',
  '// Add your rules below.',
  '',
].join('\n')

export const customReadmeContent = `# Custom styles

The CLI writes generated component styles into \`components/ui\` and
\`components/primitives\` inside this styles folder. Do not edit those files:
\`vorzela-ui update\` replaces them.

Put overrides and your own styles in this \`custom\` folder. \`global.scss\`
imports \`custom/_index.scss\`, so selectors added there are part of the app.

1. Add rules to \`_index.scss\`, or create a sibling file and import it:
   \`\`\`scss
   @use 'buttons';
   \`\`\`
2. Start every new file with:
   \`\`\`scss
   @use '..' as vz;
   @use 'sass:math';
   \`\`\`
3. Use the \`vz-scss\` VS Code snippet to insert the header and API notes.

Prefer semantic tokens (\`:root\` and \`.dark\` custom properties) for global
changes, and component-specific selectors or CSS variables for local changes.
`

function readJson(file) {
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

export function ensureCustomScaffold(cwd, config) {
  const customDir = path.join(cwd, config.paths.styles, 'custom')
  fs.mkdirSync(customDir, { recursive: true })

  const indexFile = path.join(customDir, '_index.scss')
  if (!fs.existsSync(indexFile)) fs.writeFileSync(indexFile, customIndexContent)

  const readmeFile = path.join(customDir, 'README.md')
  if (!fs.existsSync(readmeFile)) fs.writeFileSync(readmeFile, customReadmeContent)

  return customDir
}

export function ensureEditorSupport(cwd) {
  const vscodeDir = path.join(cwd, '.vscode')
  fs.mkdirSync(vscodeDir, { recursive: true })

  const settingsFile = path.join(vscodeDir, 'settings.json')
  const settingsExists = fs.existsSync(settingsFile)
  const settings = readJson(settingsFile)
  if (!settingsExists || settings) {
    const next = settings ?? {}
    const associations = next['files.associations']
    next['files.associations'] = {
      '*.scss': 'scss',
      ...(associations && typeof associations === 'object'
        ? associations
        : {}),
    }
    if (!next['editor.quickSuggestions']) {
      next['editor.quickSuggestions'] = {
        other: true,
        comments: false,
        strings: true,
      }
    }
    if (!next['editor.snippetSuggestions']) {
      next['editor.snippetSuggestions'] = 'top'
    }
    writeJson(settingsFile, next)
  }

  const snippetsFile = path.join(vscodeDir, 'scss.code-snippets')
  const snippetsExists = fs.existsSync(snippetsFile)
  const snippets = readJson(snippetsFile)
  if ((!snippetsExists || snippets) && !snippets?.['Vorzela SCSS file']) {
    const next = snippets ?? {}
    next['Vorzela SCSS file'] = {
      prefix: ['vz-scss', 'vz-header'],
      body: [
        '// ${TM_FILENAME_BASE} — custom Vorzela styles',
        '// Generated helpers: see styles/custom/_index.scss for the full API.',
        ...apiComments,
        '',
        "@use '..' as vz;",
        "@use 'sass:math';",
        '',
        '$0',
      ],
      description:
        'Start a custom Vorzela SCSS file with the responsive and mixin API notes.',
    }
    writeJson(snippetsFile, next)
  }
}
