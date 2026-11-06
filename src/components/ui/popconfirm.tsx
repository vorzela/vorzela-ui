import type { ReactElement, ReactNode } from 'react'

import { Button } from './button'
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from './popover'
import styles from './popconfirm.module.scss'

export interface PopconfirmProps {
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  children: ReactElement
}

/** Small confirmation popover for destructive or irreversible actions. */
export function Popconfirm({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  children,
}: PopconfirmProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent side="top" ariaLabel={title}>
        <div className={styles.content}>
          <p className={styles.title}>{title}</p>
          {description ? <p className={styles.description}>{description}</p> : null}
          <div className={styles.actions}>
            <PopoverClose>
              <Button size="sm" variant="ghost">
                {cancelLabel}
              </Button>
            </PopoverClose>
            <PopoverClose>
              <Button
                size="sm"
                variant={destructive ? 'destructive' : 'primary'}
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </PopoverClose>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
