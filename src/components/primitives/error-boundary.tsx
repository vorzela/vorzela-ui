import * as React from 'react'

import styles from './primitives.module.scss'

type Props = { children: React.ReactNode; fallback?: React.ReactNode }
type State = { error: Error | null }

/** Isolates a failing widget or chart so the rest of the page keeps working. */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Vorzela UI error boundary:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div role="alert" className={styles.error}>
            Something went wrong in this section.
          </div>
        )
      )
    }
    return this.props.children
  }
}
