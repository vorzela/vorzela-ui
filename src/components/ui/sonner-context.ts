import { createContext, useContext } from 'react'

export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  title?: string
  description?: string
  type?: ToastType
  duration?: number
  action?: { label: string; onClick: () => void }
}

export interface ToasterContextValue {
  toast: (toast: Omit<Toast, 'id'>) => string
  dismiss: (id: string) => void
}

export const ToasterContext = createContext<ToasterContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToasterContext)
  if (!ctx) throw new Error('useToast must be used within <Toaster>')
  return ctx
}

/**
 * Imperative fallback for callers outside a React tree. Prefer `useToast()`
 * so the toast is rendered by the nearest <Toaster>.
 */
export const toast = (_t: Omit<Toast, 'id'>) => {
  console.warn('Use useToast() hook from Toaster context')
  return ''
}
