import { useState, type ReactNode } from 'react'

import { SkipLink } from '~/components/primitives/skip-link'
import { Sidebar, type SidebarNavGroup } from './sidebar'
import { Topbar } from './topbar'
import styles from './app-shell.module.scss'

export interface AppShellProps {
  children: ReactNode
  title?: string
  groups: SidebarNavGroup[]
  brand?: ReactNode
  brandMark?: ReactNode
  subtitle?: string
  footer?: ReactNode
  actions?: ReactNode
  version?: string
  hasPermission?: (permission: string) => boolean
  drawerSide?: 'left' | 'right'
  currentPath?: string
}

/** Responsive app frame: collapsible sidebar, mobile drawer and page header. */
export function AppShell({
  children,
  title,
  groups,
  brand,
  brandMark,
  subtitle,
  footer,
  actions,
  version,
  hasPermission,
  drawerSide = 'left',
  currentPath,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className={styles.root}>
      <SkipLink href="#main" />
      <Sidebar
        groups={groups}
        brand={brand}
        brandMark={brandMark}
        subtitle={subtitle}
        footer={footer}
        version={version}
        hasPermission={hasPermission}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        drawerSide={drawerSide}
        currentPath={currentPath}
      />
      <div className={styles.body}>
        <Topbar
          title={title}
          actions={actions}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main id="main" tabIndex={-1} className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  )
}
