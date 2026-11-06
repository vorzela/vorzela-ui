import qrcode from 'qrcode-generator'
import type { CSSProperties } from 'react'
import { useMemo } from 'react'

import { cx } from '~/lib/cx'

import styles from './qr-code.module.scss'

export type QRCodeLevel = 'L' | 'M' | 'Q' | 'H'

export interface QRCodeProps {
  value: string
  size?: number
  level?: QRCodeLevel
  /** Quiet-zone width in modules. */
  margin?: number
  color?: string
  background?: string
  title?: string
  caption?: string
  className?: string
}

/**
 * Renders a QR code as inline SVG. The generator runs locally; the value is
 * never sent to a third party.
 */
export function QRCode({
  value,
  size = 160,
  level = 'M',
  margin = 2,
  color = '#0b1220',
  background = '#ffffff',
  title,
  caption,
  className,
}: QRCodeProps) {
  const model = useMemo(() => {
    if (!value) return null
    const qr = qrcode(0, level)
    qr.addData(value)
    qr.make()

    const count = qr.getModuleCount()
    const dimension = count + margin * 2
    const path: string[] = []
    for (let row = 0; row < count; row += 1) {
      for (let column = 0; column < count; column += 1) {
        if (qr.isDark(row, column)) {
          path.push(`M${column + margin} ${row + margin}h1v1h-1z`)
        }
      }
    }

    return { dimension, path: path.join('') }
  }, [value, level, margin])

  if (!model) return null

  return (
    <div className={cx(styles.root, className)}>
      <svg
        className={styles.svg}
        width={size}
        height={size}
        viewBox={`0 0 ${model.dimension} ${model.dimension}`}
        role="img"
        aria-label={title ?? 'QR code'}
        shapeRendering="crispEdges"
        style={{ '--qr-background': background } as CSSProperties}
      >
        {title ? <title>{title}</title> : null}
        <rect width={model.dimension} height={model.dimension} fill={background} />
        <path d={model.path} fill={color} />
      </svg>
      {caption ? <p className={styles.caption}>{caption}</p> : null}
    </div>
  )
}
