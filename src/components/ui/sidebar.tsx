import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { useMediaQuery } from '~/hooks/use-media-query'
import { lockBodyScroll, trapFocus } from '~/lib/overlay'
import { cx } from '~/lib/cx'
import styles from './sidebar.module.scss'

export type SidebarNavChild = {
  label: string
  href: string
  icon?: ReactNode
  permission?: string
}

export type SidebarNavItem = {
  label: string
  href?: string
  icon?: ReactNode
  permission?: string
  children?: SidebarNavChild[]
}

export type SidebarNavGroup = {
  group: string
  items: SidebarNavItem[]
  /** Allow the whole group to be collapsed from its heading. */
  collapsible?: boolean
  defaultOpen?: boolean
}

export interface SidebarProps {
  groups: SidebarNavGroup[]
  brand?: ReactNode
  /** Small square mark shown before the brand text. */
  brandMark?: ReactNode
  subtitle?: string
  mobileOpen?: boolean
  onMobileClose?: () => void
  footer?: ReactNode
  version?: string
  hasPermission?: (permission: string) => boolean
  defaultCollapsed?: boolean
  drawerSide?: 'left' | 'right'
  /** Render in-flow inside a frame (docs, settings previews). */
  contained?: boolean
  /** Current route. Pass `location.pathname` or your hash path. */
  currentPath?: string
}

function pathMatches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function isHrefActive(pathname: string, href: string, siblingHrefs: string[]) {
  if (pathname === href) return true
  if (!pathname.startsWith(`${href}/`)) return false
  return !siblingHrefs.some(
    (other) =>
      other !== href &&
      other.length > href.length &&
      (pathname === other || pathname.startsWith(`${other}/`)),
  )
}

/** Responsive navigation with a collapsible desktop rail and nested groups. */
export function Sidebar({
  groups,
  brand = 'Vorzela UI',
  brandMark,
  subtitle,
  mobileOpen = false,
  onMobileClose = () => {},
  footer,
  version,
  hasPermission,
  defaultCollapsed = false,
  drawerSide = 'left',
  contained = false,
  currentPath,
}: SidebarProps) {
  const [collapsedDesktop, setCollapsedDesktop] = useState(defaultCollapsed)
  const [collapsedMobile, setCollapsedMobile] = useState(false)
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})
  const [closedGroups, setClosedGroups] = useState<Record<string, boolean>>({})
  const isDesktop = useMediaQuery('(min-width: 64rem)')
  const collapsed = isDesktop ? collapsedDesktop : collapsedMobile
  const isRight = drawerSide === 'right'
  const asideRef = useRef<HTMLElement>(null)

  const resolvedPath = useMemo(() => {
    if (currentPath !== undefined) return currentPath
    if (typeof window === 'undefined') return ''
    return `${window.location.pathname}${window.location.hash}`
  }, [currentPath])

  const closeMobile = useCallback(() => {
    setCollapsedMobile(false)
    onMobileClose()
  }, [onMobileClose])

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobile()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen, closeMobile])

  // Close the drawer when the viewport becomes desktop-sized.
  useEffect(() => {
    if (isDesktop && mobileOpen) closeMobile()
  }, [isDesktop, mobileOpen, closeMobile])

  // Keep the page behind the mobile drawer still and trap keyboard focus.
  useEffect(() => {
    if (!mobileOpen) return
    const node = asideRef.current
    const release = lockBodyScroll()
    const untrap = node ? trapFocus(node, closeMobile) : undefined
    return () => {
      release()
      untrap?.()
    }
  }, [mobileOpen, closeMobile])

  const can = useCallback(
    (permission: string) => hasPermission?.(permission) ?? true,
    [hasPermission],
  )

  const visibleGroups = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          items: group.items
            .filter((item) => !item.permission || can(item.permission))
            .map((item) => ({
              ...item,
              children: item.children?.filter(
                (child) => !child.permission || can(child.permission),
              ),
            }))
            .filter(
              (item) => !item.children || item.children.length > 0 || item.href,
            ),
        }))
        .filter((group) => group.items.length > 0),
    [groups, can],
  )

  const allHrefs = useMemo(() => {
    const hrefs: string[] = []
    for (const group of visibleGroups) {
      for (const item of group.items) {
        if (item.href) hrefs.push(item.href)
        for (const child of item.children ?? []) hrefs.push(child.href)
      }
    }
    return hrefs
  }, [visibleGroups])

  const toggleCollapsed = () => {
    if (isDesktop) {
      setCollapsedDesktop((value) => !value)
      return
    }
    setCollapsedMobile((value) => !value)
  }

  const handleParent = (item: SidebarNavItem) => {
    if (collapsed) {
      setCollapsedDesktop(false)
      setCollapsedMobile(false)
      setOpenItems((open) => ({ ...open, [item.label]: true }))
      return
    }
    setOpenItems((open) => ({
      ...open,
      [item.label]: !(open[item.label] ?? isItemOpenByRoute(item)),
    }))
  }

  const isItemOpenByRoute = (item: SidebarNavItem) =>
    Boolean(item.children?.some((child) => pathMatches(resolvedPath, child.href)))

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className={styles.overlay}
          onClick={closeMobile}
        />
      ) : null}

      <aside
        ref={asideRef}
        className={cx(
          styles.root,
          collapsed && styles.collapsed,
          isRight && styles.right,
          mobileOpen && styles.open,
          contained && styles.contained,
        )}
        aria-label="Main navigation"
      >
        <div className={styles.header}>
          {collapsed ? null : (
            <>
              {brandMark ? (
                <span className={styles.brandMark}>{brandMark}</span>
              ) : null}
              <div className={styles.brand}>
                <span className={styles.brandName}>{brand}</span>
                {subtitle ? (
                  <p className={styles.brandSubtitle}>{subtitle}</p>
                ) : null}
              </div>
            </>
          )}

          <button
            type="button"
            className={styles.close}
            onClick={closeMobile}
            aria-label="Close menu"
          >
            <X aria-hidden />
          </button>
        </div>

        <nav className={styles.nav}>
          {visibleGroups.map((group) => {
            const hasActiveItem = group.items.some(
              (item) =>
                (item.href &&
                  isHrefActive(resolvedPath, item.href, allHrefs)) ||
                item.children?.some((child) =>
                  pathMatches(resolvedPath, child.href),
                ),
            )
            const groupOpen =
              closedGroups[group.group] ??
              (hasActiveItem ? true : (group.defaultOpen ?? true))

            return (
              <div key={group.group} className={styles.group}>
                {collapsed ? null : group.collapsible ? (
                  <button
                    type="button"
                    className={styles.groupHeadButton}
                    aria-expanded={groupOpen}
                    onClick={() =>
                      setClosedGroups((state) => ({
                        ...state,
                        [group.group]: !groupOpen,
                      }))
                    }
                  >
                    <span className={styles.groupLabel}>{group.group}</span>
                    <span className={styles.groupChevron} aria-hidden>
                      <ChevronDown />
                    </span>
                  </button>
                ) : (
                  <div className={styles.groupHead}>
                    <span className={styles.groupLabel}>{group.group}</span>
                  </div>
                )}

                {groupOpen
                  ? group.items.map((item) => {
                      const hasChildren = Boolean(item.children?.length)
                      const itemOpen =
                        openItems[item.label] ?? isItemOpenByRoute(item)
                      const active = item.href
                        ? isHrefActive(resolvedPath, item.href, allHrefs)
                        : Boolean(
                            item.children?.some((child) =>
                              pathMatches(resolvedPath, child.href),
                            ),
                          )

                      if (!hasChildren) {
                        return (
                          <a
                            key={item.label}
                            href={item.href}
                            className={cx(
                              styles.item,
                              active && styles.itemActive,
                            )}
                            aria-current={active ? 'page' : undefined}
                            aria-label={collapsed ? item.label : undefined}
                            data-label={collapsed ? item.label : undefined}
                            onClick={mobileOpen ? closeMobile : undefined}
                          >
                            {item.icon ? (
                              <span className={styles.itemIcon}>{item.icon}</span>
                            ) : collapsed ? (
                              <span className={cx(styles.itemIcon, styles.itemFallback)} aria-hidden>
                                {String(item.label).slice(0, 1)}
                              </span>
                            ) : null}
                            {collapsed ? null : (
                              <span className={styles.itemLabel}>{item.label}</span>
                            )}
                          </a>
                        )
                      }

                      return (
                        <div key={item.label}>
                          <button
                            type="button"
                            className={cx(
                              styles.item,
                              active && styles.itemActive,
                              itemOpen && styles.itemOpen,
                            )}
                            aria-expanded={collapsed ? undefined : itemOpen}
                            aria-label={collapsed ? item.label : undefined}
                            data-label={collapsed ? item.label : undefined}
                            onClick={() => handleParent(item)}
                          >
                            {item.icon ? (
                              <span className={styles.itemIcon}>{item.icon}</span>
                            ) : collapsed ? (
                              <span className={cx(styles.itemIcon, styles.itemFallback)} aria-hidden>
                                {String(item.label).slice(0, 1)}
                              </span>
                            ) : null}
                            {collapsed ? null : (
                              <>
                                <span className={styles.itemLabel}>{item.label}</span>
                                <span className={styles.chevron}>
                                  <ChevronDown aria-hidden />
                                </span>
                              </>
                            )}
                          </button>

                          {!collapsed ? (
                            <div
                              className={styles.childrenWrap}
                              data-open={itemOpen ? 'true' : 'false'}
                              inert={itemOpen ? undefined : true}
                            >
                              <div className={styles.childrenInner}>
                                <div className={styles.children}>
                                  {item.children?.map((child) => {
                                    const childActive = isHrefActive(
                                      resolvedPath,
                                      child.href,
                                      allHrefs,
                                    )
                                    return (
                                      <a
                                        key={child.href}
                                        href={child.href}
                                        className={cx(
                                          styles.item,
                                          styles.child,
                                          childActive && styles.itemActive,
                                        )}
                                        aria-current={childActive ? 'page' : undefined}
                                        onClick={mobileOpen ? closeMobile : undefined}
                                      >
                                        {child.icon ? (
                                          <span className={styles.itemIcon}>
                                            {child.icon}
                                          </span>
                                        ) : null}
                                        <span className={styles.itemLabel}>
                                          {child.label}
                                        </span>
                                      </a>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )
                    })
                  : null}
              </div>
            )
          })}
        </nav>

        <div className={styles.footer}>
          {version ? <p className={styles.version}>v{version}</p> : null}
          {!collapsed && footer ? (
            <div className={styles.footerContent}>{footer}</div>
          ) : null}
          <button
            type="button"
            className={styles.collapse}
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            data-label={collapsed ? 'Expand sidebar' : undefined}
          >
            {collapsed ? <ChevronRight aria-hidden /> : <ChevronLeft aria-hidden />}
            {collapsed ? null : <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
