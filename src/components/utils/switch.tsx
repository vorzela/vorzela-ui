import React from 'react'

/**
 * Declarative switch/case component.
 *
 * <Switch value={status}>
 *   <Match when="active">  <ActiveBadge />  </Match>
 *   <Match when="pending"> <PendingBadge /> </Match>
 *   <Match when="banned">  <BannedBadge />  </Match>
 *   <Default>              <UnknownBadge /> </Default>
 * </Switch>
 *
 * - Renders the first <Match> whose `when` strictly equals `value`.
 * - Falls back to the first <Default> child if no match is found.
 * - Both Match and Default are thin wrappers; all logic lives in Switch.
 */

// ── Public components ─────────────────────────────────────────────────────────

interface MatchProps<T> {
  when: T
  children: React.ReactNode
}

/**
 * Represents one case inside a <Switch>. Must be a direct child of <Switch>.
 */
export function Match<T>(_props: MatchProps<T>): React.ReactElement {
  // Rendered by Switch, never directly.
  return <></>
}

interface DefaultProps {
  children: React.ReactNode
}

/**
 * Fallback rendered by <Switch> when no <Match> case applies.
 */
export function Default(_props: DefaultProps): React.ReactElement {
  return <></>
}

// ── Switch ────────────────────────────────────────────────────────────────────

interface SwitchProps<T> {
  value: T
  children: React.ReactNode
}

export function Switch<T>({ value, children }: SwitchProps<T>) {
  const kids = React.Children.toArray(children) as React.ReactElement[]

  for (const child of kids) {
    if (!React.isValidElement(child)) continue

    if (child.type === Match) {
      const props = child.props as MatchProps<T>
      if (props.when === value) return <>{props.children}</>
    }
  }

  // No match — find the first <Default>
  for (const child of kids) {
    if (!React.isValidElement(child)) continue
    if (child.type === Default) {
      return <>{(child.props as DefaultProps).children}</>
    }
  }

  return null
}
