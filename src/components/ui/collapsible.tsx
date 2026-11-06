import { ChevronDown } from 'lucide-react'
import * as React from 'react'

import { useControllableState } from '~/hooks/use-controllable-state'
import { cx } from '~/lib/cx'
import styles from './collapsible.module.scss'

interface CollapsibleContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  contentId: string
  triggerId: string
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(
  null,
)

function useCollapsible(component: string): CollapsibleContextValue {
  const context = React.useContext(CollapsibleContext)
  if (!context) {
    throw new Error(`<${component}> must be rendered inside <Collapsible>.`)
  }
  return context
}

export interface CollapsibleProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  children?: React.ReactNode
}

/** Controlled or uncontrolled disclosure with a smooth height transition. */
export function Collapsible({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
}: CollapsibleProps) {
  const [open, setValue] = useControllableState({
    value: controlledOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const contentId = React.useId()
  const triggerId = React.useId()

  const setOpen = React.useCallback(
    (next: boolean) => setValue(next),
    [setValue],
  )

  const context = React.useMemo<CollapsibleContextValue>(
    () => ({ open, setOpen, contentId, triggerId }),
    [open, setOpen, contentId, triggerId],
  )

  return (
    <CollapsibleContext.Provider value={context}>
      <div
        className={cx(styles.root, className)}
        data-state={open ? 'open' : 'closed'}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
}

export interface CollapsibleTriggerProps {
  className?: string
  children?: React.ReactNode
}

export function CollapsibleTrigger({
  className,
  children,
}: CollapsibleTriggerProps) {
  const { open, setOpen, contentId, triggerId } =
    useCollapsible('CollapsibleTrigger')

  return (
    <button
      type="button"
      id={triggerId}
      className={cx(styles.trigger, className)}
      aria-expanded={open}
      aria-controls={contentId}
      onClick={() => setOpen(!open)}
    >
      <span className={styles.triggerLabel}>{children}</span>
      <ChevronDown className={styles.chevron} aria-hidden />
    </button>
  )
}

export interface CollapsibleContentProps {
  className?: string
  children?: React.ReactNode
}

export function CollapsibleContent({
  className,
  children,
}: CollapsibleContentProps) {
  const { open, contentId, triggerId } =
    useCollapsible('CollapsibleContent')

  return (
    <div
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      className={cx(styles.content, className)}
      data-state={open ? 'open' : 'closed'}
      inert={!open || undefined}
    >
      <div className={styles.contentInner}>
        <div className={styles.contentBody}>{children}</div>
      </div>
    </div>
  )
}
