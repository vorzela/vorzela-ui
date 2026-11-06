import {
  Accessibility,
  BarChart3,
  Boxes,
  Compass,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  LayoutList,
  Menu,
  Moon,
  Palette,
  PanelsTopLeft,
  Sun,
  Table2,
  TextCursorInput,
  X,
} from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'

import { Spinner } from '~/components/ui/spinner'
import { Sidebar, type SidebarNavGroup } from '~/components/ui/sidebar'
import { components, componentGroups, findComponent } from './docs/registry'
import { usageBySlug } from './docs/usage'
import { inventoryCount } from './docs/inventory'
import { useRoute, useTheme } from './docs/hooks'
import styles from './docs/docs.module.scss'

const OverviewPage = lazy(() =>
  import('./docs/pages/overview').then((module) => ({ default: module.OverviewPage })),
)
const FoundationsPage = lazy(() =>
  import('./docs/pages/foundations').then((module) => ({ default: module.FoundationsPage })),
)
const ComponentsIndexPage = lazy(() =>
  import('./docs/pages/components').then((module) => ({ default: module.ComponentsIndexPage })),
)
const ComponentDetailPage = lazy(() =>
  import('./docs/pages/components').then((module) => ({ default: module.ComponentDetailPage })),
)
const AccessibilityPage = lazy(() =>
  import('./docs/pages/accessibility').then((module) => ({ default: module.AccessibilityPage })),
)
const ThemingPage = lazy(() =>
  import('./docs/pages/theming').then((module) => ({ default: module.ThemingPage })),
)
const TablesPage = lazy(() =>
  import('./docs/pages/tables').then((module) => ({ default: module.TablesPage })),
)
const ChartsPage = lazy(() =>
  import('./docs/pages/charts').then((module) => ({ default: module.ChartsPage })),
)
const DataDisplayPage = lazy(() =>
  import('./docs/pages/data-display').then((module) => ({ default: module.DataDisplayPage })),
)
const FormsPage = lazy(() =>
  import('./docs/pages/forms').then((module) => ({ default: module.FormsPage })),
)
const OverlaysPage = lazy(() =>
  import('./docs/pages/overlays').then((module) => ({ default: module.OverlaysPage })),
)
const NavigationPage = lazy(() =>
  import('./docs/pages/navigation').then((module) => ({ default: module.NavigationPage })),
)
const MediaPage = lazy(() =>
  import('./docs/pages/media').then((module) => ({ default: module.MediaPage })),
)
const LayoutPage = lazy(() =>
  import('./docs/pages/layout').then((module) => ({ default: module.LayoutPage })),
)

const GETTING_STARTED = [
  { path: 'overview', label: 'Overview', icon: <LayoutDashboard aria-hidden size={18} /> },
  { path: 'foundations', label: 'Foundations', icon: <Palette aria-hidden size={18} /> },
]

const PAGES = [
  { path: 'tables', label: 'Tables', icon: <Table2 aria-hidden size={18} /> },
  { path: 'charts', label: 'Charts', icon: <BarChart3 aria-hidden size={18} /> },
  { path: 'data', label: 'Data display', icon: <LayoutList aria-hidden size={18} /> },
  { path: 'forms', label: 'Forms', icon: <TextCursorInput aria-hidden size={18} /> },
  { path: 'overlays', label: 'Overlays', icon: <Layers aria-hidden size={18} /> },
  { path: 'navigation', label: 'Navigation', icon: <Compass aria-hidden size={18} /> },
  { path: 'media', label: 'Media & system', icon: <ImageIcon aria-hidden size={18} /> },
  { path: 'layout', label: 'Layout', icon: <PanelsTopLeft aria-hidden size={18} /> },
]

const GUIDES = [
  { path: 'accessibility', label: 'Accessibility', icon: <Accessibility aria-hidden size={18} /> },
  { path: 'theming', label: 'Theming', icon: <Moon aria-hidden size={18} /> },
]

const SIDEBAR_GROUPS: SidebarNavGroup[] = [
  {
    group: 'Getting started',
    collapsible: true,
    items: GETTING_STARTED.map((item) => ({
      label: item.label,
      href: `#/${item.path}`,
      icon: item.icon,
    })),
  },
  {
    group: 'Build',
    collapsible: true,
    items: [
      { label: `Components (${inventoryCount})`, href: '#/components', icon: <Boxes aria-hidden size={18} /> },
      ...PAGES.map((item) => ({ label: item.label, href: `#/${item.path}`, icon: item.icon })),
      ...GUIDES.map((item) => ({ label: item.label, href: `#/${item.path}`, icon: item.icon })),
    ],
  },
  ...componentGroups.map((group) => ({
    group,
    collapsible: true,
    defaultOpen: false,
    items: components
      .filter((component) => component.group === group)
      .map((component) => ({
        label: component.name,
        href: `#/components/${component.slug}`,
      })),
  })),
]

export default function App() {
  const route = useRoute()
  const { theme, toggle } = useTheme()
  const [navOpen, setNavOpen] = useState(false)
  const mainRef = useRef<HTMLDivElement>(null)

  const page = route.segments[0] ?? 'overview'
  const detailSlug = route.segments[1]
  const activeComponent = findComponent(detailSlug)
  const usageComponent = detailSlug ? usageBySlug.get(detailSlug) : undefined

  useEffect(() => {
    setNavOpen(false)
    mainRef.current?.scrollTo({ top: 0 })
  }, [route.path])

  useEffect(() => {
    const title = activeComponent?.name ?? usageComponent?.name ?? titleFor(page)
    document.title = `${title} · Vorzela UI`
  }, [page, activeComponent, usageComponent])

  return (
    <div className={styles.shell}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>

      <Sidebar
        groups={SIDEBAR_GROUPS}
        brand="Vorzela UI"
        brandMark="V"
        subtitle="React + SCSS · v0.2.0"
        footer={<span>MIT · source-owned</span>}
        version="0.2.0"
        mobileOpen={navOpen}
        onMobileClose={() => setNavOpen(false)}
        currentPath={`#/${route.path || 'overview'}`}
      />

      <div className={styles.main} ref={mainRef}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuButton}
            aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((open) => !open)}
          >
            {navOpen ? <X aria-hidden /> : <Menu aria-hidden />}
          </button>

          <span className={styles.topbarTitle}>
            <span>Docs</span>
            <span className={styles.topbarDivider}>/</span>
            <strong>{activeComponent?.name ?? usageComponent?.name ?? titleFor(page)}</strong>
          </span>

          <div className={styles.topbarActions}>
            <button
              type="button"
              className={styles.themeToggle}
              onClick={toggle}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? <Sun aria-hidden /> : <Moon aria-hidden />}
            </button>
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className={styles.content}>
          <div key={route.path} className={styles.page}>
            <Suspense
              fallback={
                <div className={styles.pageLoading}>
                  <Spinner label="Loading page" />
                </div>
              }
            >
              <Page page={page} slug={detailSlug} />
            </Suspense>
          </div>

          <footer className={styles.footer}>
            <span>Vorzela UI · built with React 19 and SCSS Modules</span>
            <span className={styles.footerLinks}>
              <a href="#/foundations">Foundations</a>
              <a href="#/accessibility">Accessibility</a>
              <a href="#/theming">Theming</a>
            </span>
          </footer>
        </main>
      </div>
    </div>
  )
}

function Page({ page, slug }: { page: string; slug?: string }) {
  switch (page) {
    case 'foundations':
      return <FoundationsPage />
    case 'tables':
      return <TablesPage />
    case 'charts':
      return <ChartsPage />
    case 'data':
      return <DataDisplayPage />
    case 'forms':
      return <FormsPage />
    case 'overlays':
      return <OverlaysPage />
    case 'navigation':
      return <NavigationPage />
    case 'media':
      return <MediaPage />
    case 'layout':
      return <LayoutPage />
    case 'components':
      return slug ? <ComponentDetailPage slug={slug} /> : <ComponentsIndexPage />
    case 'accessibility':
      return <AccessibilityPage />
    case 'theming':
      return <ThemingPage />
    case 'overview':
      return <OverviewPage />
    default:
      return <OverviewPage />
  }
}

function titleFor(page: string): string {
  switch (page) {
    case 'foundations':
      return 'Foundations'
    case 'tables':
      return 'Tables'
    case 'charts':
      return 'Charts'
    case 'data':
      return 'Data display'
    case 'forms':
      return 'Forms'
    case 'overlays':
      return 'Overlays'
    case 'navigation':
      return 'Navigation'
    case 'media':
      return 'Media & system'
    case 'layout':
      return 'Layout'
    case 'components':
      return 'Components'
    case 'accessibility':
      return 'Accessibility'
    case 'theming':
      return 'Theming'
    default:
      return 'Overview'
  }
}
