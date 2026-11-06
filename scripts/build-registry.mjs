#!/usr/bin/env node
/**
 * Build the shadcn-style registry from the source tree.
 *
 * Run: node scripts/build-registry.mjs
 * Output: registry/index.json and registry/<name>.json
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const registryDir = path.join(root, 'registry')
const version = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8'),
).version

fs.rmSync(registryDir, { recursive: true, force: true })
fs.mkdirSync(registryDir, { recursive: true })

const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')
const exists = (relative) => fs.existsSync(path.join(root, relative))
const list = (relative) =>
  fs.existsSync(path.join(root, relative))
    ? fs.readdirSync(path.join(root, relative))
    : []

const UI_SKIP = new Set(['index.ts'])
const components = list('src/components/ui')
  .filter((file) => file.endsWith('.tsx') && !UI_SKIP.has(file))
  .map((file) => file.replace(/\.tsx$/, ''))
  .sort()

const items = new Map()

function addItem(name, type, files, extra = {}) {
  items.set(name, {
    name,
    type,
    version,
    dependencies: extra.dependencies ?? [],
    devDependencies: extra.devDependencies ?? [],
    registryDependencies: extra.registryDependencies ?? [],
    files: files.map((file) => ({
      path: file.output,
      content: read(file.source),
    })),
    description: extra.description ?? '',
  })
}

function collect(dir, outputPrefix, type, name) {
  const walk = (relative) =>
    fs.readdirSync(path.join(root, relative), { withFileTypes: true }).flatMap((entry) => {
      const child = path.posix.join(relative, entry.name)
      return entry.isDirectory() ? walk(child) : [child]
    })

  const files = walk(path.posix.join('src', dir))
    .filter((file) => file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.scss'))
    .map((file) => ({
      source: file,
      output: path.posix.join(
        outputPrefix,
        path.posix.relative(path.posix.join('src', dir), file),
      ),
    }))
  if (files.length > 0) addItem(name, type, files)
}

// Shared layers.
collect('styles', 'styles', 'style', 'styles')
collect('hooks', 'hooks', 'hook', 'hooks')
collect('components/primitives', 'components/primitives', 'primitive', 'primitives')
collect('components/utils', 'components/utils', 'util', 'helpers')
addItem('utils', 'lib', [{ source: 'src/lib/cx.ts', output: 'lib/cx.ts' }])
for (const [name, file] of [
  ['lib-overlay', 'overlay.ts'],
  ['lib-security', 'security.ts'],
  ['lib-refs', 'refs.ts'],
  ['lib-phone-countries', 'phone-countries.ts'],
  ['lib-table', 'table.ts'],
]) {
  const source = `src/lib/${file}`
  if (exists(source)) {
    addItem(name, 'lib', [{ source, output: `lib/${file}` }], {
      dependencies: file === 'security.ts' ? ['dompurify'] : [],
    })
  }
}

function resolveUiLocal(specifier) {
  const base = specifier.replace(/^\.\//, '')
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.module.scss`,
    `${base}.scss`,
  ]
  return (
    candidates.find((candidate) =>
      exists(`src/components/ui/${candidate}`),
    ) ?? null
  )
}

function parseImports(source) {
  const found = new Set()
  const re = /(?:from\s+|import\s*\()\s*['"]([^'"]+)['"]/g
  let match
  while ((match = re.exec(source)) !== null) found.add(match[1])
  return [...found]
}

function packageName(specifier) {
  if (specifier.startsWith('@')) return specifier.split('/').slice(0, 2).join('/')
  return specifier.split('/')[0]
}

const UI_COMPONENT_NAMES = new Set(components)

for (const name of components) {
  const sourcePath = `src/components/ui/${name}.tsx`
  const source = read(sourcePath)
  const files = [{ source: sourcePath, output: `components/ui/${name}.tsx` }]
  const modulePath = `src/components/ui/${name}.module.scss`
  if (exists(modulePath)) {
    files.push({ source: modulePath, output: `components/ui/${name}.module.scss` })
  }

  const dependencies = new Set()
  const registryDependencies = new Set(['styles'])

  const extraFiles = new Set()
  const includeLocals = (sourceText) => {
    for (const specifier of parseImports(sourceText)) {
      if (!specifier.startsWith('./')) continue
      const base = resolveUiLocal(specifier)
      if (!base || base === `${name}.tsx` || base === `${name}.module.scss`) {
        continue
      }

      const symbol = base.replace(/\.(tsx|ts|module\.scss|scss)$/, '')
      if (UI_COMPONENT_NAMES.has(symbol)) {
        registryDependencies.add(symbol)
      } else if (base.endsWith('.ts') && !extraFiles.has(base)) {
        extraFiles.add(base)
        includeLocals(read(`src/components/ui/${base}`))
      } else if (base.endsWith('.scss')) {
        extraFiles.add(base)
      }
    }
  }
  includeLocals(source)

  for (const extra of extraFiles) {
    files.push({
      source: `src/components/ui/${extra}`,
      output: `components/ui/${extra}`,
    })
  }

  const scss = files
    .filter((file) => file.source.endsWith('.scss'))
    .map((file) => read(file.source))
    .join('\n')

  if (scss.includes("@use 'styles'")) registryDependencies.add('styles')

  for (const specifier of parseImports(source)) {
    if (specifier.startsWith('~/components/ui/')) {
      registryDependencies.add(specifier.split('/').pop())
    } else if (specifier.startsWith('./') && UI_COMPONENT_NAMES.has(specifier.slice(2))) {
      registryDependencies.add(specifier.slice(2))
    } else if (specifier.startsWith('~/components/primitives/')) {
      registryDependencies.add('primitives')
    } else if (specifier.startsWith('~/components/utils/')) {
      registryDependencies.add('helpers')
    } else if (specifier.startsWith('~/hooks/')) {
      registryDependencies.add('hooks')
    } else if (specifier === '~/lib/cx') {
      registryDependencies.add('utils')
    } else if (specifier.startsWith('~/lib/')) {
      const map = {
        overlay: 'lib-overlay',
        security: 'lib-security',
        refs: 'lib-refs',
        'phone-countries': 'lib-phone-countries',
        table: 'lib-table',
      }
      const key = specifier.replace('~/lib/', '').replace(/\.ts$/, '')
      if (map[key]) registryDependencies.add(map[key])
    } else if (!specifier.startsWith('.') && !specifier.startsWith('~')) {
      const pkg = packageName(specifier)
      if (pkg !== 'react' && pkg !== 'react-dom') dependencies.add(pkg)
    }
  }

  addItem(name, 'ui', files, {
    dependencies: [...dependencies].sort(),
    registryDependencies: [...registryDependencies].sort(),
    description: `${name} component`,
  })
}

// ── Charts ────────────────────────────────────────────────
const CHART_SHARED_FILES = [
  'chart-colors.ts',
  'chart-types.ts',
  'chart-utils.ts',
  'chart-tooltip.tsx',
  'use-animated-progress.ts',
  'charts.module.scss',
]
const chartSharedSpecifiers = new Set(
  CHART_SHARED_FILES.map((file) => `./${file}`),
)

function analyzeSource(source, sharedSpecifiers = new Map()) {
  const dependencies = new Set()
  const registryDependencies = new Set(['styles'])

  for (const specifier of parseImports(source)) {
    if (specifier.startsWith('~/components/ui/')) {
      registryDependencies.add(specifier.split('/').pop())
    } else if (
      specifier.startsWith('./') &&
      UI_COMPONENT_NAMES.has(specifier.slice(2))
    ) {
      registryDependencies.add(specifier.slice(2))
    } else if (specifier.startsWith('~/components/primitives/')) {
      registryDependencies.add('primitives')
    } else if (specifier.startsWith('~/components/utils/')) {
      registryDependencies.add('helpers')
    } else if (specifier.startsWith('~/hooks/')) {
      registryDependencies.add('hooks')
    } else if (specifier === '~/lib/cx') {
      registryDependencies.add('utils')
    } else if (specifier.startsWith('~/lib/')) {
      const map = {
        overlay: 'lib-overlay',
        security: 'lib-security',
        refs: 'lib-refs',
        'phone-countries': 'lib-phone-countries',
        table: 'lib-table',
      }
      const key = specifier.replace('~/lib/', '').replace(/\.ts$/, '')
      if (map[key]) registryDependencies.add(map[key])
    } else if (sharedSpecifiers.has(specifier)) {
      registryDependencies.add(sharedSpecifiers.get(specifier))
    } else if (!specifier.startsWith('.') && !specifier.startsWith('~')) {
      const pkg = packageName(specifier)
      if (pkg !== 'react' && pkg !== 'react-dom') dependencies.add(pkg)
    }
  }

  return {
    dependencies: [...dependencies].sort(),
    registryDependencies: [...registryDependencies].sort(),
  }
}

addItem(
  'charts-shared',
  'shared',
  CHART_SHARED_FILES.map((file) => ({
    source: `src/charts/${file}`,
    output: `charts/${file}`,
  })),
  {
    registryDependencies: ['hooks', 'styles', 'utils'],
    description: 'Shared chart types, palette, tooltip, motion and styles.',
  },
)

const chartComponents = list('src/charts')
  .filter(
    (file) => file.endsWith('.tsx') && !CHART_SHARED_FILES.includes(file),
  )
  .sort()

for (const file of chartComponents) {
  const name = file.replace(/\.tsx$/, '')
  const shared = new Map([...chartSharedSpecifiers].map((specifier) => [specifier, 'charts-shared']))
  shared.set('./chart-frame', 'chart-frame')
  const analysis = analyzeSource(read(`src/charts/${file}`), shared)
  const devDependencies = new Set()
  if (analysis.dependencies.includes('d3')) devDependencies.add('@types/d3')
  if (analysis.dependencies.includes('d3-sankey')) devDependencies.add('@types/d3-sankey')

  addItem(
    name,
    'chart',
    [{ source: `src/charts/${file}`, output: `charts/${file}` }],
    {
      ...analysis,
      devDependencies: [...devDependencies].sort(),
      description: `${name} chart`,
    },
  )
}

// AreaChart is exported from line-chart.tsx, so install the same module.
addItem('area-chart', 'chart', [], {
  dependencies: ['d3'],
  devDependencies: ['@types/d3'],
  registryDependencies: ['line-chart'],
  description: 'AreaChart is exported from the line-chart module.',
})

// ── Reusable form wrappers ────────────────────────────────
for (const [name, file] of [
  ['form', 'form.tsx'],
  ['form-date-picker', 'form-date-picker.tsx'],
]) {
  const analysis = analyzeSource(read(`src/components/reusable/${file}`))
  analysis.dependencies = [
    ...new Set([...analysis.dependencies, '@tanstack/react-form']),
  ].sort()

  addItem(
    name,
    'ui',
    [{ source: `src/components/reusable/${file}`, output: `components/reusable/${file}` }],
    {
      ...analysis,
      description: `${name} form wrapper`,
    },
  )
}

const index = [...items.values()]
  .map((item) => ({
    name: item.name,
    type: item.type,
    version: item.version,
    dependencies: item.dependencies,
    devDependencies: item.devDependencies,
    registryDependencies: item.registryDependencies,
    description: item.description,
    files: item.files.map((file) => file.path),
  }))
  .sort((a, b) => a.name.localeCompare(b.name))

fs.writeFileSync(
  path.join(registryDir, 'index.json'),
  JSON.stringify({ version, generatedAt: new Date().toISOString(), items: index }, null, 2),
)

for (const item of items.values()) {
  fs.writeFileSync(
    path.join(registryDir, `${item.name}.json`),
    JSON.stringify(item, null, 2),
  )
}

console.log(
  `Registry built: ${items.size} items · ${index.filter((i) => i.type === 'ui').length} UI components · ${index.filter((i) => i.type === 'chart').length} charts`,
)
