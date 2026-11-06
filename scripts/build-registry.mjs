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

const index = [...items.values()]
  .map((item) => ({
    name: item.name,
    type: item.type,
    version: item.version,
    dependencies: item.dependencies,
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
  `Registry built: ${items.size} items · ${index.filter((i) => i.type === 'ui').length} UI components`,
)
