import {
  Bell,
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
  X,
  type LucideIcon,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { Portal } from '~/components/primitives/portal'
import { cx } from '~/lib/cx'
import { ToasterContext, type Toast, type ToastType } from './sonner-context'
import styles from './sonner.module.scss'

export type ToasterPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'bottom-center'

const POSITION: Record<ToasterPosition, string> = {
  'top-left': styles.topLeft,
  'top-right': styles.topRight,
  'top-center': styles.topCenter,
  'bottom-left': styles.bottomLeft,
  'bottom-right': styles.bottomRight,
  'bottom-center': styles.bottomCenter,
}

const TYPE: Record<ToastType, string> = {
  default: styles.default,
  success: styles.success,
  error: styles.error,
  warning: styles.warning,
  info: styles.info,
}

const TYPE_ICON: Record<ToastType, LucideIcon> = {
  default: Bell,
  success: CircleCheck,
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
}

export function Toaster({
  position = 'bottom-right',
  children,
}: {
  position?: ToasterPosition
  children?: ReactNode
}) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).slice(2, 9)
      const duration = t.duration ?? 4000
      const toastItem: Toast = { ...t, id, duration }

      setToasts((prev) => [...prev, toastItem])

      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration)
        timers.current.set(id, timer)
      }
      return id
    },
    [dismiss],
  )

  useEffect(() => {
    const timersMap = timers.current
    return () => {
      timersMap.forEach((timer) => clearTimeout(timer))
      timersMap.clear()
    }
  }, [])

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToasterContext.Provider value={value}>
      {children}
      <Portal>
        <div className={cx(styles.viewport, POSITION[position])}>
          {toasts.map((t, index) => {
            const type = t.type ?? 'default'
            const Icon = TYPE_ICON[type]

            return (
              <div
                key={t.id}
                className={cx(styles.toast, TYPE[type])}
                role={type === 'error' ? 'alert' : 'status'}
                aria-live={type === 'error' ? 'assertive' : 'polite'}
                aria-atomic="true"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <span className={styles.typeIcon}>
                  <Icon aria-hidden />
                </span>
                <div className={styles.copy}>
                  {t.title ? <p className={styles.title}>{t.title}</p> : null}
                  {t.description ? (
                    <p className={styles.description}>{t.description}</p>
                  ) : null}
                </div>
                {t.action ? (
                  <button
                    type="button"
                    className={styles.action}
                    onClick={() => {
                      t.action?.onClick()
                      dismiss(t.id)
                    }}
                  >
                    {t.action.label}
                  </button>
                ) : null}
                <button
                  type="button"
                  className={styles.dismiss}
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss notification"
                >
                  <X aria-hidden />
                </button>
              </div>
            )
          })}
        </div>
      </Portal>
    </ToasterContext.Provider>
  )
}

export { Toaster as Sonner }
export { toast, useToast } from './sonner-context'
export type { Toast, ToastType, ToasterContextValue } from './sonner-context'
