/**
 * components/ui/masonry-grid.tsx
 *
 * Staggered masonry (shortest-column packing).
 *
 * Modes:
 *  - children — small lists (demos)
 *  - itemCount + renderItem — large feeds with viewport virtualization
 *
 * Virtualization keeps DOM light: only items intersecting the scrollport
 * (+ overscan) are mounted. Heights are cached; images call `reflow` on load.
 */
import {
  Children,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'

import { cx } from '~/lib/cx'
import styles from './masonry-grid.module.scss'

export interface MasonryGridHandle {
  /** Live scroll container (always current). */
  getScrollElement: () => HTMLDivElement | null
  /** Force remeasure + pack (e.g. after external size changes). */
  reflow: () => void
  smoothScrollTo: (options: ScrollToOptions) => void
  smoothScrollBy: (options: ScrollToOptions) => void
}

export interface MasonryGridProps {
  /** Small lists — prefer `itemCount`/`renderItem` for large feeds. */
  children?: ReactNode
  /** Large-feed API (virtualized). */
  itemCount?: number
  renderItem?: (index: number) => ReactNode
  getItemKey?: (index: number) => string | number
  /** Initial height guess before measure (px). Improves first paint. */
  estimatedItemHeight?: number
  /** Extra pixels above/below viewport to keep mounted (default 600). */
  overscanPixels?: number
  columns?: number
  gap?: number
  scrollable?: boolean
  maxHeight?: string | number
  className?: string
  style?: CSSProperties
  'aria-label'?: string
}

type ItemPos = { x: number; y: number; w: number; h: number }

function pack(
  count: number,
  heights: number[],
  width: number,
  columns: number,
  gap: number,
): { positions: ItemPos[]; gridHeight: number } {
  const cols = Math.max(1, columns)
  const colW = (width - gap * (cols - 1)) / cols
  const colHeights = Array.from({ length: cols }, () => 0)
  const positions: ItemPos[] = []

  for (let i = 0; i < count; i++) {
    const h = Math.max(0, heights[i] ?? 0)
    let shortest = 0
    for (let c = 1; c < cols; c++) {
      if (colHeights[c]! < colHeights[shortest]!) shortest = c
    }
    positions.push({
      x: shortest * (colW + gap),
      y: colHeights[shortest]!,
      w: colW,
      h,
    })
    colHeights[shortest]! += h + gap
  }

  const tallest = Math.max(0, ...colHeights)
  return {
    positions,
    gridHeight: tallest > 0 ? tallest - gap : 0,
  }
}

export const MasonryGrid = forwardRef<MasonryGridHandle, MasonryGridProps>(
  function MasonryGrid(
    {
      children,
      itemCount: itemCountProp,
      renderItem,
      getItemKey,
      estimatedItemHeight = 280,
      overscanPixels = 600,
      columns = 2,
      gap = 12,
      scrollable = true,
      maxHeight = '70vh',
      className,
      style,
      'aria-label': ariaLabel = 'Masonry grid',
    },
    ref,
  ) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)
    const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map())
    const heightCache = useRef<Map<number, number>>(new Map())

    const childArray = useMemo(
      () => (renderItem ? [] : Children.toArray(children)),
      [children, renderItem],
    )
    const itemCount = renderItem
      ? (itemCountProp ?? 0)
      : childArray.length
    const virtualized = Boolean(renderItem)

    const [width, setWidth] = useState(0)
    const [scrollTop, setScrollTop] = useState(0)
    const [viewportH, setViewportH] = useState(0)
    const [version, setVersion] = useState(0)

    const heights = useMemo(() => {
      const list: number[] = []
      for (let i = 0; i < itemCount; i++) {
        list.push(heightCache.current.get(i) ?? estimatedItemHeight)
      }
      return list
      // eslint-disable-next-line react-hooks/exhaustive-deps -- version busts cache reads
    }, [itemCount, estimatedItemHeight, version])

    const { positions, gridHeight } = useMemo(() => {
      if (width <= 0 || itemCount === 0) {
        return { positions: [] as ItemPos[], gridHeight: 0 }
      }
      return pack(itemCount, heights, width, columns, gap)
    }, [width, itemCount, heights, columns, gap])

    const visibleRange = useMemo(() => {
      if (!virtualized || positions.length === 0) {
        return { start: 0, end: itemCount }
      }
      const top = scrollTop - overscanPixels
      const bottom = scrollTop + viewportH + overscanPixels
      let start = 0
      let end = itemCount
      for (let i = 0; i < positions.length; i++) {
        const p = positions[i]!
        if (p.y + p.h < top) start = i + 1
        if (p.y > bottom) {
          end = i
          break
        }
      }
      return { start: Math.max(0, start), end: Math.min(itemCount, Math.max(start, end)) }
    }, [virtualized, positions, scrollTop, viewportH, overscanPixels, itemCount])

    const reflow = useCallback(() => {
      const host = gridRef.current
      if (!host) return
      const w = host.clientWidth
      if (w > 0) setWidth(w)

      let changed = false
      itemRefs.current.forEach((el, index) => {
        const h = el.offsetHeight
        if (h > 0 && heightCache.current.get(index) !== h) {
          heightCache.current.set(index, h)
          changed = true
        }
      })
      if (changed) setVersion((v) => v + 1)
    }, [])

    useLayoutEffect(() => {
      reflow()
    }, [reflow, itemCount, columns, gap])

    useEffect(() => {
      const host = gridRef.current
      if (!host || typeof ResizeObserver === 'undefined') return
      const ro = new ResizeObserver(() => reflow())
      ro.observe(host)
      itemRefs.current.forEach((el) => ro.observe(el))
      return () => ro.disconnect()
    }, [reflow, visibleRange.start, visibleRange.end, version])

    useEffect(() => {
      const scroller = scrollRef.current
      if (!scroller || !scrollable) return

      const onScroll = () => {
        setScrollTop(scroller.scrollTop)
        setViewportH(scroller.clientHeight)
      }
      onScroll()
      scroller.addEventListener('scroll', onScroll, { passive: true })

      const ro = typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(onScroll)
        : null
      ro?.observe(scroller)

      return () => {
        scroller.removeEventListener('scroll', onScroll)
        ro?.disconnect()
      }
    }, [scrollable])

    // Images / async content — remeasure when media finishes loading
    useEffect(() => {
      const host = gridRef.current
      if (!host) return
      const onLoad = (e: Event) => {
        if ((e.target as HTMLElement)?.tagName === 'IMG') reflow()
      }
      host.addEventListener('load', onLoad, true)
      return () => host.removeEventListener('load', onLoad, true)
    }, [reflow])

    const smoothScrollTo = useCallback((options: ScrollToOptions) => {
      const el = scrollRef.current
      if (!el) return
      try {
        el.scrollTo({ ...options, behavior: 'smooth' })
      } catch {
        el.scrollTo(options.left ?? el.scrollLeft, options.top ?? el.scrollTop)
      }
    }, [])

    const smoothScrollBy = useCallback((options: ScrollToOptions) => {
      const el = scrollRef.current
      if (!el) return
      try {
        el.scrollBy({ ...options, behavior: 'smooth' })
      } catch {
        el.scrollBy(options.left ?? 0, options.top ?? 0)
      }
    }, [])

    useImperativeHandle(
      ref,
      () => ({
        getScrollElement: () => scrollRef.current,
        reflow,
        smoothScrollTo,
        smoothScrollBy,
      }),
      [reflow, smoothScrollBy, smoothScrollTo],
    )

    const indices: number[] = []
    for (let i = visibleRange.start; i < visibleRange.end; i++) indices.push(i)

    const grid = (
      <div
        ref={gridRef}
        className={cx(styles.grid, !scrollable && className)}
        style={{
          height: gridHeight || undefined,
          ...(!scrollable ? style : undefined),
        }}
      >
        {indices.map((i) => {
          const pos = positions[i]
          const key = getItemKey?.(i) ?? (virtualized ? i : childArray[i] && typeof childArray[i] === 'object' && childArray[i] !== null && 'key' in (childArray[i] as object) && (childArray[i] as { key?: unknown }).key != null
            ? String((childArray[i] as { key: unknown }).key)
            : i)
          const node = virtualized ? renderItem!(i) : childArray[i]
          return (
            <div
              key={key}
              ref={(el) => {
                if (el) itemRefs.current.set(i, el)
                else itemRefs.current.delete(i)
              }}
              className={styles.item}
              style={
                pos
                  ? {
                      width: pos.w,
                      transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
                    }
                  : {
                      width:
                        width > 0
                          ? (width - gap * (columns - 1)) / columns
                          : `calc((100% - ${(columns - 1) * gap}px) / ${columns})`,
                      visibility: 'hidden',
                    }
              }
            >
              {node}
            </div>
          )
        })}
      </div>
    )

    if (!scrollable) return grid

    return (
      <div
        ref={scrollRef}
        role="region"
        aria-label={ariaLabel}
        aria-busy={width === 0}
        className={cx(styles.scroll, className)}
        style={{
          maxHeight,
          WebkitOverflowScrolling: 'touch',
          ...style,
        }}
      >
        {grid}
      </div>
    )
  },
)

export interface MasonryTileProps {
  children: ReactNode
  price?: string
  title?: string
  meta?: string
  onClick?: () => void
  className?: string
  imageAspectRatio?: number
}

export function MasonryTile({
  children,
  price,
  title,
  meta,
  onClick,
  className,
  imageAspectRatio = 1,
}: MasonryTileProps) {
  const Comp = onClick ? 'button' : 'div'
  const a11yName = [price, title, meta].filter(Boolean).join(', ')
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={onClick ? a11yName || undefined : undefined}
      className={cx(styles.tile, onClick && styles.tileInteractive, className)}
    >
      <div
        className={styles.media}
        style={{ aspectRatio: String(imageAspectRatio) }}
        aria-hidden={onClick ? true : undefined}
      >
        {children}
      </div>
      {price ? <p className={styles.price}>{price}</p> : null}
      {title ? <p className={styles.tileTitle}>{title}</p> : null}
      {meta ? <p className={styles.meta}>{meta}</p> : null}
    </Comp>
  )
}
