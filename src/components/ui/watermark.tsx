import type { CSSProperties, ReactNode } from 'react'

import { cx } from '~/lib/cx'

import styles from './watermark.module.scss'

export interface WatermarkProps {
  /** Text repeated across the surface. */
  content: string | string[]
  children?: ReactNode
  opacity?: number
  fontSize?: number
  /** Angle in degrees. */
  rotate?: number
  /** Tile size in pixels. */
  gap?: number
  color?: string
  zIndex?: number
  className?: string
  overlayClassName?: string
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

/** Repeats a text watermark behind or over arbitrary content. */
export function Watermark({
  content,
  children,
  opacity = 0.08,
  fontSize = 14,
  rotate = -20,
  gap = 180,
  color = 'currentColor',
  zIndex = 1,
  className,
  overlayClassName,
}: WatermarkProps) {
  const text = Array.isArray(content) ? content.join(' · ') : content
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${gap}" height="${gap}" viewBox="0 0 ${gap} ${gap}"><text x="50%" y="50%" fill="${color}" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="${fontSize}" font-weight="600" text-anchor="middle" dominant-baseline="middle" transform="rotate(${rotate} ${gap / 2} ${gap / 2})">${escapeXml(text)}</text></svg>`
  const backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  const style: CSSProperties = {
    backgroundImage,
    backgroundRepeat: 'repeat',
    backgroundSize: `${gap}px ${gap}px`,
    opacity,
    zIndex,
  }

  return (
    <div className={cx(styles.root, className)}>
      {children}
      <div
        aria-hidden
        className={cx(styles.overlay, overlayClassName)}
        style={style}
      />
    </div>
  )
}
