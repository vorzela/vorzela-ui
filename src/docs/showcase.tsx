import { Check, Copy } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { highlight } from 'sugar-high'
import { lang } from 'sugar-high/lang'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { PACKAGE_REQUIREMENTS, componentScss } from './requirements'
import styles from './docs.module.scss'

export interface SectionProps {
  id?: string
  title: string
  lead?: ReactNode
  children: ReactNode
}

export function Section({ id, title, lead, children }: SectionProps) {
  return (
    <section id={id} className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {lead ? <p className={styles.sectionLead}>{lead}</p> : null}
      </div>
      {children}
    </section>
  )
}

export interface DemoProps {
  title?: string
  note?: string
  children: ReactNode
  className?: string
}

/** A bordered preview surface used across every docs page. */
export function Demo({ title = 'Preview', note, children, className }: DemoProps) {
  return (
    <div className={styles.demo}>
      <div className={styles.demoHeader}>
        <span className={styles.demoTitle}>{title}</span>
        {note ? <span className={styles.demoBadge}>{note}</span> : null}
      </div>
      <div className={`${styles.demoBody} ${className ?? ''}`}>{children}</div>
    </div>
  )
}

export function DemoStack({ children }: { children: ReactNode }) {
  return <div className={styles.demoStack}>{children}</div>
}

export function DemoField({ children }: { children: ReactNode }) {
  return <div className={styles.demoField}>{children}</div>
}

export function CodeBlock({
  code,
  language = 'tsx',
}: {
  code: string
  language?: string
}) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const canonical = lang(language) ?? 'javascript'
  const html = useMemo(
    () => highlight(code.trim(), { lang: canonical }),
    [code, canonical],
  )

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className={styles.code}>
      <div className={styles.codeHeader}>
        <span className={styles.codeLang}>{language}</span>
        <button type="button" className={styles.copyButton} onClick={copy}>
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className={styles.codeBody}>
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  )
}

export interface PropRow {
  name: string
  type: string
  defaultValue?: string
  description: string
}

type CodeTab = 'usage' | 'package' | 'styles'

const CODE_TABS: Array<{ value: CodeTab; label: string }> = [
  { value: 'usage', label: 'Usage' },
  { value: 'package', label: 'package.json' },
  { value: 'styles', label: 'SCSS' },
]

/** Usage, package requirements and style wiring in one compact tab bar. */
export function CodeTabs({
  code,
  language = 'tsx',
  name,
}: {
  code: string
  language?: string
  name: string
}) {
  const [tab, setTab] = useState<CodeTab>('usage')
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  const snippets = useMemo(
    () =>
      ({
        usage: { code, language },
        package: { code: PACKAGE_REQUIREMENTS, language: 'json' },
        styles: { code: componentScss(name), language: 'scss' },
      }) satisfies Record<CodeTab, { code: string; language: string }>,
    [code, language, name],
  )

  const highlighted = useMemo(() => {
    const out = {} as Record<CodeTab, string>
    for (const key of Object.keys(snippets) as CodeTab[]) {
      const snippet = snippets[key]
      out[key] = highlight(snippet.code.trim(), {
        lang: lang(snippet.language) ?? 'javascript',
      })
    }
    return out
  }, [snippets])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippets[tab].code)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value as CodeTab)}
      className={styles.codeTabs}
    >
      <div className={styles.codeTabsHead}>
        <TabsList className={styles.codeTabList} aria-label="Code examples">
          {CODE_TABS.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className={styles.codeTab}
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className={styles.codeTabsMeta}>
          <span className={styles.codeTabsLang}>
            {snippets[tab].language}
          </span>
          <button type="button" className={styles.copyButton} onClick={copy}>
            {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {CODE_TABS.map((item) => (
        <TabsContent
          key={item.value}
          value={item.value}
          className={styles.codeTabPanel}
        >
          <pre className={styles.codeBody}>
            <code dangerouslySetInnerHTML={{ __html: highlighted[item.value] }} />
          </pre>
        </TabsContent>
      ))}
    </Tabs>
  )
}

/** Compact API reference for a component's public props. */
export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className={styles.demo} style={{ overflowX: 'auto' }}>
      <table className={styles.apiTable}>
        <thead>
          <tr>
            <th scope="col">Prop</th>
            <th scope="col">Type</th>
            <th scope="col">Default</th>
            <th scope="col">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td className={styles.apiName}>{row.name}</td>
              <td className={styles.apiType}>{row.type}</td>
              <td className={styles.apiDefault}>{row.defaultValue ?? '—'}</td>
              <td>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
