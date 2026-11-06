import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { VisuallyHidden } from '~/components/primitives/visually-hidden'
import { cx } from '~/lib/cx'
import { Button, type ButtonSize, type ButtonVariant } from './button'
import styles from './pagination.module.scss'

export interface PaginationProps extends React.ComponentProps<'nav'> {
  className?: string
}

export function Pagination({ className, ...props }: PaginationProps) {
  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cx(styles.root, className)}
      {...props}
    />
  )
}

Pagination.displayName = 'Pagination'

export const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(function PaginationContent({ className, ...props }, ref) {
  return (
    <ul ref={ref} className={cx(styles.content, className)} {...props} />
  )
})

PaginationContent.displayName = 'PaginationContent'

export const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(function PaginationItem({ className, ...props }, ref) {
  return <li ref={ref} className={cx(styles.item, className)} {...props} />
})

PaginationItem.displayName = 'PaginationItem'

export type PaginationLinkSize = ButtonSize | 'default'

export interface PaginationLinkProps
  extends React.ComponentProps<'button'> {
  isActive?: boolean
  variant?: ButtonVariant
  size?: PaginationLinkSize
}

export const PaginationLink = React.forwardRef<
  HTMLButtonElement,
  PaginationLinkProps
>(function PaginationLink(
  { className, isActive, variant, size = 'icon', ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      type="button"
      variant={variant ?? (isActive ? 'outline' : 'ghost')}
      size={size === 'default' ? 'md' : size}
      aria-current={isActive ? 'page' : undefined}
      className={cx(styles.link, className)}
      {...props}
    />
  )
})

PaginationLink.displayName = 'PaginationLink'

export const PaginationPrevious = React.forwardRef<
  HTMLButtonElement,
  PaginationLinkProps
>(function PaginationPrevious({ className, ...props }, ref) {
  return (
    <PaginationLink
      ref={ref}
      aria-label="Go to previous page"
      size="md"
      className={cx(styles.previous, className)}
      {...props}
    >
      <ChevronLeft aria-hidden />
      <span>Previous</span>
    </PaginationLink>
  )
})

PaginationPrevious.displayName = 'PaginationPrevious'

export const PaginationNext = React.forwardRef<
  HTMLButtonElement,
  PaginationLinkProps
>(function PaginationNext({ className, ...props }, ref) {
  return (
    <PaginationLink
      ref={ref}
      aria-label="Go to next page"
      size="md"
      className={cx(styles.next, className)}
      {...props}
    >
      <span>Next</span>
      <ChevronRight aria-hidden />
    </PaginationLink>
  )
})

PaginationNext.displayName = 'PaginationNext'

export interface PaginationEllipsisProps
  extends React.ComponentProps<'span'> {
  label?: string
}

export function PaginationEllipsis({
  className,
  label = 'More pages',
  ...props
}: PaginationEllipsisProps) {
  return (
    <span className={cx(styles.ellipsis, className)} {...props}>
      <MoreHorizontal aria-hidden />
      <VisuallyHidden>{label}</VisuallyHidden>
    </span>
  )
}

PaginationEllipsis.displayName = 'PaginationEllipsis'
