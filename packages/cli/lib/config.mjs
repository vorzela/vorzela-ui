import fs from 'node:fs'
import path from 'node:path'

export const DEFAULT_CONFIG = {
  registry: 'https://raw.githubusercontent.com/vorzela/vorzela-ui/v1.2.0/registry',
  version: '1.2.0',
  aliases: {
    base: '~',
    components: '~/components/ui',
    lib: '~/lib',
    hooks: '~/hooks',
    styles: '~/styles',
  },
  paths: {
    base: 'app',
    components: 'app/components/ui',
    lib: 'app/lib',
    hooks: 'app/hooks',
    styles: 'app/styles',
  },
  css: 'app/styles/global.scss',
}

export function configPath(cwd) {
  return path.join(cwd, 'vorzela.json')
}

export function readConfig(cwd) {
  const file = configPath(cwd)
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

export function writeConfig(cwd, config = DEFAULT_CONFIG) {
  fs.writeFileSync(configPath(cwd), JSON.stringify(config, null, 2) + '\n')
  return config
}

export function targetFor(config, registryPath) {
  const normalized = registryPath.replaceAll('\\', '/')
  const file = path.posix.basename(normalized)

  // Every stylesheet lives under the configured styles folder. Components keep
  // their source path so `styles/components/ui/button.module.scss` mirrors the
  // registry tree and imports stay predictable.
  if (normalized.endsWith('.scss')) {
    return path.join(
      config.paths.styles,
      normalized.startsWith('styles/')
        ? normalized.slice('styles/'.length)
        : normalized,
    )
  }

  if (normalized.startsWith('components/ui/')) {
    return path.join(config.paths.components, file)
  }
  if (normalized.startsWith('components/primitives/')) {
    return path.join(config.paths.base, 'components/primitives', file)
  }
  if (normalized.startsWith('components/utils/')) {
    return path.join(config.paths.base, 'components/utils', file)
  }
  if (normalized.startsWith('components/reusable/')) {
    return path.join(config.paths.base, 'components/reusable', file)
  }
  if (normalized.startsWith('charts/')) {
    return path.join(config.paths.base, 'charts', file)
  }
  if (normalized.startsWith('lib/')) {
    return path.join(config.paths.lib, file)
  }
  if (normalized.startsWith('hooks/')) {
    return path.join(config.paths.hooks, file)
  }
  if (normalized.startsWith('styles/')) {
    return path.join(config.paths.styles, normalized.slice('styles/'.length))
  }
  return path.join(config.paths.base, normalized)
}

/**
 * Rewrite a relative stylesheet import to the installed styles folder.
 *
 * Registry modules import `./button.module.scss`; consumers receive
 * `~/styles/components/ui/button.module.scss`, keeping every stylesheet out of
 * the component directory.
 */
function rewriteScssImports(content, config, sourcePath) {
  let next = content

  // Registry-normalized imports: `~/components/primitives/primitives.module.scss`.
  next = next
    .replace(
      /(['"])~\/components\/([^'"]+\.scss)\1/g,
      (match, quote, relative) =>
        `${quote}${config.aliases.styles}/components/${relative}${quote}`,
    )
    .replace(
      /(['"])~\/charts\/([^'"]+\.scss)\1/g,
      (match, quote, relative) =>
        `${quote}${config.aliases.styles}/charts/${relative}${quote}`,
    )

  if (!sourcePath) return next
  const sourceDir = path.posix.dirname(sourcePath)
  if (sourceDir === '.') return next

  return next.replace(
    /(['"])(\.\.?\/[^'"]+\.scss)\1/g,
    (match, quote, relative) => {
      const resolved = path.posix.normalize(
        path.posix.join(sourceDir, relative),
      )
      return `${quote}${config.aliases.styles}/${resolved}${quote}`
    },
  )
}

export function rewriteImports(content, config, sourcePath = '') {
  let next = rewriteScssImports(content, config, sourcePath)
  const replacements = [
    ['~/components/ui/', `${config.aliases.components}/`],
    ['~/components/primitives/', `${config.aliases.base}/components/primitives/`],
    ['~/components/utils/', `${config.aliases.base}/components/utils/`],
    ['~/components/reusable/', `${config.aliases.base}/components/reusable/`],
    ['~/charts/', `${config.aliases.base}/charts/`],
    ['~/lib/', `${config.aliases.lib}/`],
    ['~/hooks/', `${config.aliases.hooks}/`],
    ['~/styles', config.aliases.styles],
  ]

  for (const [from, to] of replacements) {
    next = next.replaceAll(from, to)
  }

  return next.replace(/~\/\.\.\./g, `${config.aliases.base}/...`)
}

export function rewriteScss(content, target, config, cwd) {
  const stylesDir = path.resolve(cwd, config.paths.styles)
  const targetDir = path.dirname(path.resolve(cwd, target))
  let relative = path.relative(targetDir, stylesDir).replaceAll('\\', '/')
  if (!relative.startsWith('.')) relative = `./${relative}`
  return content.replaceAll("@use 'styles' as vz;", `@use '${relative}' as vz;`)
}
