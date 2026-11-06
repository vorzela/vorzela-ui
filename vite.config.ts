import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import browserslist from 'browserslist'
import { browserslistToTargets } from 'lightningcss'
import { defineConfig, type Plugin } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const targets = browserslistToTargets(browserslist())

/**
 * Vite's Lightning CSS transformer exports CSS Modules with their original
 * (kebab-case) names. The codebase uses camelCase accessors such as
 * `styles.heroTitle`, so mirror every dashed export as a camelCase alias.
 *
 * This runs after `vite:css-post`, which is the plugin that turns the
 * Lightning CSS module map into the JavaScript module.
 */
function cssModulesCamelCase(): Plugin {
  const camelCase = (value: string) =>
    value.replace(/-+([a-z0-9])/g, (_, character: string) => character.toUpperCase())

  return {
    name: 'vorzela:css-modules-camel-case',
    enforce: 'post',
    transform(code, id) {
      if (!/\.module\.(css|scss|sass|less|styl|stylus)(\?|$)/.test(id)) return null

      const marker = 'export default {'
      const start = code.indexOf(marker)
      if (start === -1) return null

      const end = code.indexOf('\n};', start)
      if (end === -1) return null

      const body = code.slice(start + marker.length, end)
      const existing = new Set<string>()
      const entries: Array<{ key: string; value: string }> = []

      for (const line of body.split('\n')) {
        const match = line.match(
          /^\s*(?:"([^"]+)"|'([^']+)'|([A-Za-z_$][\w$]*)):\s*(.+?),?\s*$/,
        )
        if (!match) continue

        const key = match[1] ?? match[2] ?? match[3]
        const value = match[4].replace(/,$/, '')
        existing.add(key)
        entries.push({ key, value })
      }

      const additions: string[] = []
      for (const { key, value } of entries) {
        if (!key.includes('-')) continue

        const alias = camelCase(key)
        if (alias === key || existing.has(alias)) continue

        existing.add(alias)
        additions.push(`\t${alias}: ${value},`)
      }

      if (additions.length === 0) return null

      const separator = body.trimEnd().endsWith(',') ? '' : ','
      return {
        code: `${code.slice(0, end)}${separator}\n${additions.join('\n')}${code.slice(end)}`,
        map: null,
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), cssModulesCamelCase()],
  resolve: {
    alias: {
      '~': path.resolve(rootDir, './src'),
    },
  },
  css: {
    devSourcemap: true,
    transformer: 'lightningcss',
    lightningcss: {
      targets,
    },
    modules: {
      localsConvention: 'camelCaseOnly',
    },
    preprocessorOptions: {
      scss: {
        loadPaths: [path.resolve(rootDir, './src')],
      },
    },
  },
  build: {
    cssMinify: 'lightningcss',
  },
})
