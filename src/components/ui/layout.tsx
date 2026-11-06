import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

import { cx } from '~/lib/cx'
import styles from './layout.module.scss'

type Gap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10
type Align = 'start' | 'center' | 'end' | 'stretch'
type Justify = 'start' | 'center' | 'end' | 'between'

const GAP: Record<Gap, string> = {
  0: styles.gap0,
  1: styles.gap1,
  2: styles.gap2,
  3: styles.gap3,
  4: styles.gap4,
  5: styles.gap5,
  6: styles.gap6,
  8: styles.gap8,
  10: styles.gap10,
}

const ALIGN: Record<Align, string> = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
  stretch: styles.alignStretch,
}

const JUSTIFY: Record<Justify, string> = {
  start: styles.justifyStart,
  center: styles.justifyCenter,
  end: styles.justifyEnd,
  between: styles.justifyBetween,
}

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  gap?: Gap
  align?: Align
  justify?: Justify
}

/** Vertical flex stack on the token spacing scale. */
export function Stack({
  gap = 3,
  align = 'stretch',
  justify = 'start',
  className,
  ...props
}: StackProps) {
  return (
    <div
      className={cx(styles.stack, GAP[gap], ALIGN[align], JUSTIFY[justify], className)}
      {...props}
    />
  )
}

export interface InlineProps extends HTMLAttributes<HTMLDivElement> {
  gap?: Gap
  align?: Align
  justify?: Justify
  wrap?: boolean
}

/** Horizontal flex row that wraps by default. */
export function Inline({
  gap = 2,
  align = 'center',
  justify = 'start',
  wrap = true,
  className,
  style,
  ...props
}: InlineProps) {
  return (
    <div
      className={cx(styles.inline, GAP[gap], ALIGN[align], JUSTIFY[justify], className)}
      style={wrap ? style : { flexWrap: 'nowrap', ...style }}
      {...props}
    />
  )
}

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  gap?: Gap
  /** Minimum column width before wrapping. */
  min?: string
  /** Fixed column count; omit for auto-fit columns. */
  columns?: number
}

/** Auto-fit CSS grid with a token gap and a minimum column width. */
export function Grid({
  gap = 4,
  min = '14rem',
  columns,
  className,
  style,
  ...props
}: GridProps) {
  return (
    <div
      className={cx(styles.grid, GAP[gap], className)}
      style={
        {
          '--layout-min': min,
          ...(columns
            ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
            : {}),
          ...style,
        } as CSSProperties
      }
      {...props}
    />
  )
}

export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column'
  wrap?: boolean
  inline?: boolean
  gap?: Gap
  align?: Align
  justify?: Justify
}

/** General flex container for one-off layouts. */
export function Flex({
  direction = 'row',
  wrap = false,
  inline = false,
  gap = 2,
  align = 'stretch',
  justify = 'start',
  className,
  ...props
}: FlexProps) {
  return (
    <div
      className={cx(
        inline ? styles.flexInline : styles.flex,
        direction === 'column' ? styles.flexColumn : styles.flexRow,
        wrap ? styles.flexWrap : styles.flexNowrap,
        GAP[gap],
        ALIGN[align],
        JUSTIFY[justify],
        className,
      )}
      {...props}
    />
  )
}

export interface SplitProps extends HTMLAttributes<HTMLDivElement> {
  /** Secondary pane. */
  side: ReactNode
  children: ReactNode
  sideWidth?: string
  sidePosition?: 'start' | 'end'
}

/** Two-pane layout that collapses to one column when its container is narrow. */
export function Split({
  side,
  children,
  sideWidth = '18rem',
  sidePosition = 'start',
  className,
  style,
  ...props
}: SplitProps) {
  return (
    <div
      className={cx(
        styles.split,
        sidePosition === 'end' && styles.splitEnd,
        className,
      )}
      style={{ '--split-size': sideWidth, ...style } as CSSProperties}
      {...props}
    >
      <div className={styles.splitSide}>{side}</div>
      <div className={styles.splitMain}>{children}</div>
    </div>
  )
}

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

/** Centered page container with a max width. */
export function Container({ size = 'lg', className, ...props }: ContainerProps) {
  const sizes = {
    sm: styles.containerSm,
    md: styles.containerMd,
    lg: styles.containerLg,
    xl: styles.containerXl,
    full: styles.containerFull,
  }

  return <div className={cx(styles.container, sizes[size], className)} {...props} />
}

export interface PageSectionProps
  extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
}

/** Page-level section with an optional heading, description and actions. */
export function PageSection({
  title,
  description,
  actions,
  children,
  className,
  ...props
}: PageSectionProps) {
  return (
    <section className={cx(styles.section, className)} {...props}>
      {title || description || actions ? (
        <div className={styles.sectionHead}>
          <div className={styles.sectionCopy}>
            {title ? <h2 className={styles.sectionTitle}>{title}</h2> : null}
            {description ? (
              <p className={styles.sectionDescription}>{description}</p>
            ) : null}
          </div>
          {actions ? <div className={styles.sectionActions}>{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}
