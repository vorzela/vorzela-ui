import { Search } from 'lucide-react'
import * as React from 'react'

import { DismissableLayer } from '~/components/primitives/dismissable-layer'
import { FocusTrap } from '~/components/primitives/focus-trap'
import { Portal } from '~/components/primitives/portal'
import { cx } from '~/lib/cx'
import { lockBodyScroll } from '~/lib/overlay'
import styles from './command.module.scss'

interface CommandContextValue {
  search: string
  setSearch: (search: string) => void
  listId: string
  activeId: string | null
  setActiveId: (id: string | null) => void
  matches: Set<string>
}

const CommandContext = React.createContext<CommandContextValue | null>(null)

function useCommand(component: string): CommandContextValue {
  const context = React.useContext(CommandContext)
  if (!context) {
    throw new Error(`<${component}> must be rendered inside <Command>.`)
  }
  return context
}

interface CommandEntry {
  value: string
  keywords: string[]
}

function textContent(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textContent).join(' ')
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return textContent(node.props.children)
  }
  return ''
}

function entryFor(props: CommandItemProps): CommandEntry {
  return {
    value: props.value ?? textContent(props.children).trim(),
    keywords: props.keywords ?? [],
  }
}

function entryMatches(entry: CommandEntry, query: string): boolean {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true

  const haystack = [entry.value, ...entry.keywords].join(' ').toLowerCase()
  return terms.every((term) => haystack.includes(term))
}

function collectEntries(
  node: React.ReactNode,
  entries: CommandEntry[],
): void {
  if (node == null || typeof node === 'boolean') return
  if (Array.isArray(node)) {
    node.forEach((child) => collectEntries(child, entries))
    return
  }
  if (!React.isValidElement(node)) return

  if (node.type === CommandItem) {
    entries.push(entryFor(node.props as CommandItemProps))
    return
  }

  const { children } = node.props as { children?: React.ReactNode }
  collectEntries(children, entries)
}

export interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {}

/** Root command palette surface. Filters its items from the shared search. */
export function Command({ className, children, ...props }: CommandProps) {
  const [search, setSearchValue] = React.useState('')
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const listId = React.useId()

  const entries = React.useMemo(() => {
    const collected: CommandEntry[] = []
    collectEntries(children, collected)
    return collected
  }, [children])

  const matches = React.useMemo(() => {
    const visible = new Set<string>()
    entries.forEach((entry) => {
      if (entryMatches(entry, search)) visible.add(entry.value)
    })
    return visible
  }, [entries, search])

  const setSearch = React.useCallback((next: string) => {
    setSearchValue(next)
    setActiveId(null)
  }, [])

  const context = React.useMemo<CommandContextValue>(
    () => ({
      search,
      setSearch,
      listId,
      activeId,
      setActiveId,
      matches,
    }),
    [search, setSearch, listId, activeId, matches],
  )

  return (
    <CommandContext.Provider value={context}>
      <div
        className={cx(styles.root, className)}
        data-command-root
        {...props}
      >
        {children}
      </div>
    </CommandContext.Provider>
  )
}

export interface CommandInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export function CommandInput({
  className,
  onChange,
  onKeyDown,
  ...props
}: CommandInputProps) {
  const command = useCommand('CommandInput')

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return

    const list = document.getElementById(command.listId)
    if (!list) return

    const items = Array.from(
      list.querySelectorAll<HTMLElement>(
        '[data-command-item]:not([disabled])',
      ),
    )
    if (items.length === 0) return

    const current = items.findIndex((item) => item.id === command.activeId)

    let next = current
    switch (event.key) {
      case 'ArrowDown':
        next = current < 0 ? 0 : (current + 1) % items.length
        break
      case 'ArrowUp':
        next = current < 0 ? items.length - 1 : (current - 1 + items.length) % items.length
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = items.length - 1
        break
      case 'Enter': {
        const target = items[current < 0 ? 0 : current]
        if (!target) return
        event.preventDefault()
        target.click()
        return
      }
      default:
        return
    }

    event.preventDefault()
    const target = items[next]
    if (!target) return
    command.setActiveId(target.id)
    target.scrollIntoView({ block: 'nearest' })
  }

  return (
    <div className={styles.inputWrap}>
      <Search className={styles.searchIcon} aria-hidden />
      <input
        {...props}
        role="combobox"
        aria-label="Search"
        aria-expanded
        aria-controls={command.listId}
        aria-autocomplete="list"
        aria-activedescendant={command.activeId ?? undefined}
        autoComplete="off"
        className={cx(styles.input, className)}
        value={command.search}
        onChange={(event) => {
          command.setSearch(event.target.value)
          onChange?.(event)
        }}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}

export interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CommandList({
  className,
  children,
  ...props
}: CommandListProps) {
  const { listId } = useCommand('CommandList')

  return (
    <div
      {...props}
      id={listId}
      role="listbox"
      aria-label="Command results"
      className={cx(styles.list, className)}
    >
      {children}
    </div>
  )
}

export interface CommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CommandEmpty({
  className,
  children,
  ...props
}: CommandEmptyProps) {
  const { search, matches } = useCommand('CommandEmpty')

  if (!search.trim() || matches.size > 0) return null

  return (
    <div className={cx(styles.empty, className)} {...props}>
      {children}
    </div>
  )
}

export interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: string
}

export function CommandGroup({
  heading,
  className,
  children,
  ...props
}: CommandGroupProps) {
  const { matches } = useCommand('CommandGroup')
  const headingId = React.useId()

  const entries = React.useMemo(() => {
    const collected: CommandEntry[] = []
    collectEntries(children, collected)
    return collected
  }, [children])

  const visible =
    entries.length === 0 || entries.some((entry) => matches.has(entry.value))

  if (!visible) return null

  return (
    <div
      role="group"
      aria-labelledby={heading ? headingId : undefined}
      className={cx(styles.group, className)}
      {...props}
    >
      {heading ? (
        <div id={headingId} className={styles.groupHeading}>
          {heading}
        </div>
      ) : null}
      {children}
    </div>
  )
}

export interface CommandItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onSelect?: () => void
  /** Stable filter value. Defaults to the item's text content. */
  value?: string
  /** Extra searchable terms that are not rendered. */
  keywords?: string[]
}

export function CommandItem({
  className,
  children,
  onSelect,
  value,
  keywords,
  onClick,
  onPointerMove,
  id: idProp,
  ...props
}: CommandItemProps) {
  const command = useCommand('CommandItem')
  const generatedId = React.useId()
  const id = idProp ?? generatedId
  const entry = entryFor({ value, keywords, children })
  const hidden = command.search.trim().length > 0 && !entryMatches(entry, command.search)
  const active = command.activeId === id

  if (hidden) return null

  return (
    <button
      type="button"
      {...props}
      id={id}
      role="option"
      tabIndex={-1}
      aria-selected={active}
      data-command-item
      data-active={active || undefined}
      className={cx(styles.item, className)}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        command.setActiveId(id)
        onSelect?.()
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        if (!active) command.setActiveId(id)
      }}
    >
      {children}
    </button>
  )
}

export interface CommandSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function CommandSeparator({
  className,
  ...props
}: CommandSeparatorProps) {
  return (
    <div
      role="separator"
      className={cx(styles.separator, className)}
      {...props}
    />
  )
}

export interface CommandDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  /** Accessible name for the dialog. */
  label?: string
}

export function CommandDialog({
  open,
  onOpenChange,
  children,
  label = 'Command menu',
}: CommandDialogProps) {
  React.useEffect(() => {
    if (!open) return
    return lockBodyScroll()
  }, [open])

  if (!open) return null

  return (
    <Portal>
      <div className={styles.overlay}>
        <div
          aria-hidden
          className={styles.backdrop}
          onClick={() => onOpenChange(false)}
        />
        <FocusTrap className={styles.dialogWrap}>
          <DismissableLayer onDismiss={() => onOpenChange(false)}>
            <div
              role="dialog"
              aria-modal="true"
              aria-label={label}
              className={styles.dialog}
            >
              <Command>{children}</Command>
            </div>
          </DismissableLayer>
        </FocusTrap>
      </div>
    </Portal>
  )
}
