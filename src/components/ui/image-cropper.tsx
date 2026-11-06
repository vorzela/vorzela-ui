import { Crop, RotateCcw } from 'lucide-react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { cx } from '~/lib/cx'

import { Button } from './button'
import styles from './image-cropper.module.scss'

export type CropShape = 'rect' | 'round'
export type CropOutputFormat = 'original' | 'image/png' | 'image/jpeg' | 'image/webp'

export type CropResult = {
  blob: Blob
  dataUrl: string
  file: File
  width: number
  height: number
}

export interface ImageCropperProps {
  /** Image URL, data URL or blob URL. */
  src: string
  /** Used to preserve the image type for `outputFormat="original"`. */
  fileName?: string
  /** Width / height. Defaults to 1 (square). */
  aspectRatio?: number
  cropShape?: CropShape
  outputFormat?: CropOutputFormat
  /** 0–1. PNG ignores it; lossy formats default to 1 (maximum quality). */
  quality?: number
  maxWidth?: number
  maxHeight?: number
  /** Compress only when the encoded blob exceeds this size. */
  targetSizeBytes?: number
  minZoom?: number
  maxZoom?: number
  title?: string
  description?: string
  applyLabel?: string
  cancelLabel?: string
  disabled?: boolean
  className?: string
  onCrop?: (result: CropResult) => void
  onCancel?: () => void
  onError?: (message: string) => void
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function baseName(name: string): string {
  return name.replace(/\.[^.]+$/, '') || 'image'
}

function formatFor(src: string, fileName: string | undefined, format: CropOutputFormat): string {
  if (format !== 'original') return format
  const name = (fileName ?? src).toLowerCase()
  if (name.endsWith('.png')) return 'image/png'
  if (name.endsWith('.webp')) return 'image/webp'
  if (name.endsWith('.avif')) return 'image/avif'
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg'
  return 'image/webp'
}

export function ImageCropper({
  src,
  fileName,
  aspectRatio = 1,
  cropShape = 'rect',
  outputFormat = 'original',
  quality = 1,
  maxWidth,
  maxHeight,
  targetSizeBytes,
  minZoom = 1,
  maxZoom = 4,
  title = 'Crop image',
  description = 'Drag to reposition, then zoom to frame the crop.',
  applyLabel = 'Apply crop',
  cancelLabel = 'Cancel',
  disabled = false,
  className,
  onCrop,
  onCancel,
  onError,
}: ImageCropperProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const onErrorRef = useRef(onError)
  const drag = useRef<{
    pointerId: number
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [natural, setNatural] = useState({ width: 0, height: 0 })
  const [frame, setFrame] = useState({ width: 0, height: 0 })
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    setStatus('')
    setImage(null)
    setNatural({ width: 0, height: 0 })
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    if (!src) return

    let cancelled = false
    const element = new Image()
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      element.crossOrigin = 'anonymous'
    }
    element.onload = () => {
      if (cancelled) return
      setImage(element)
      setNatural({ width: element.naturalWidth, height: element.naturalHeight })
    }
    element.onerror = () => {
      if (cancelled) return
      const message = 'Could not load this image.'
      setStatus(message)
      onErrorRef.current?.(message)
    }
    element.src = src
    return () => {
      cancelled = true
      element.onload = null
      element.onerror = null
    }
  }, [src])

  useEffect(() => {
    const element = stageRef.current
    if (!element) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      setFrame({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const element = stageRef.current
    if (!element) return
    const handleWheel = (event: WheelEvent) => {
      if (disabled) return
      event.preventDefault()
      setZoom((current) =>
        clamp(current * (event.deltaY < 0 ? 1.08 : 0.92), minZoom, maxZoom),
      )
    }
    element.addEventListener('wheel', handleWheel, { passive: false })
    return () => element.removeEventListener('wheel', handleWheel)
  }, [disabled, minZoom, maxZoom])

  const ratio = Math.max(0.1, aspectRatio)
  const padding = 20
  const availableWidth = Math.max(1, frame.width - padding * 2)
  const availableHeight = Math.max(1, frame.height - padding * 2)
  const cropWidth = Math.min(availableWidth, availableHeight * ratio)
  const cropHeight = cropWidth / ratio
  const baseScale =
    natural.width > 0 && cropWidth > 0
      ? Math.max(cropWidth / natural.width, cropHeight / natural.height)
      : 1
  const scale = baseScale * zoom
  const imageWidth = natural.width * scale
  const imageHeight = natural.height * scale
  const maxX = Math.max(0, (imageWidth - cropWidth) / 2)
  const maxY = Math.max(0, (imageHeight - cropHeight) / 2)
  const safeOffset = {
    x: clamp(offset.x, -maxX, maxX),
    y: clamp(offset.y, -maxY, maxY),
  }
  const imageLeft = (frame.width - imageWidth) / 2 + safeOffset.x
  const imageTop = (frame.height - imageHeight) / 2 + safeOffset.y
  const cropLeft = (frame.width - cropWidth) / 2
  const cropTop = (frame.height - cropHeight) / 2

  const canCrop = Boolean(image && natural.width && frame.width && !disabled && !busy)
  const hint = useMemo(
    () =>
      [
        `${Math.round(natural.width)} × ${Math.round(natural.height)} source`,
        targetSizeBytes ? `target ${formatBytes(targetSizeBytes)}` : null,
        outputFormat === 'image/png' ? 'lossless PNG' : `${Math.round(quality * 100)}% quality`,
      ]
        .filter(Boolean)
        .join(' · '),
    [natural.width, natural.height, targetSizeBytes, outputFormat, quality],
  )

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canCrop) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: safeOffset.x,
      originY: safeOffset.y,
    }
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = drag.current
    if (!current || current.pointerId !== event.pointerId) return
    setOffset({
      x: clamp(current.originX + event.clientX - current.startX, -maxX, maxX),
      y: clamp(current.originY + event.clientY - current.startY, -maxY, maxY),
    })
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId === event.pointerId) drag.current = null
  }

  const apply = async () => {
    if (!canCrop || !image) return
    setBusy(true)
    setStatus('')

    try {
      const sourceX = clamp((cropLeft - imageLeft) / scale, 0, natural.width)
      const sourceY = clamp((cropTop - imageTop) / scale, 0, natural.height)
      const sourceWidth = clamp(cropWidth / scale, 1, natural.width - sourceX)
      const sourceHeight = clamp(cropHeight / scale, 1, natural.height - sourceY)

      let width = sourceWidth
      let height = sourceHeight
      if (maxWidth != null && width > maxWidth) {
        width = maxWidth
        height = width / ratio
      }
      if (maxHeight != null && height > maxHeight) {
        height = maxHeight
        width = height * ratio
      }
      width = Math.max(1, Math.round(width))
      height = Math.max(1, Math.round(height))

      const mime = formatFor(src, fileName, outputFormat)
      const initialQuality = mime === 'image/png' ? undefined : clamp(quality, 0.1, 1)
      const canvas = document.createElement('canvas')

      const render = (w: number, h: number, q: number | undefined) =>
        new Promise<Blob>((resolve, reject) => {
          canvas.width = w
          canvas.height = h
          const context = canvas.getContext('2d')
          if (!context) {
            reject(new Error('Canvas is not available.'))
            return
          }
          context.imageSmoothingEnabled = true
          context.imageSmoothingQuality = 'high'
          context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, w, h)
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob)
              else reject(new Error('Could not encode the cropped image.'))
            },
            mime,
            q,
          )
        })

      let blob = await render(width, height, initialQuality)

      if (targetSizeBytes != null && blob.size > targetSizeBytes) {
        if (mime !== 'image/png') {
          let nextQuality = initialQuality ?? 0.92
          while (blob.size > targetSizeBytes && nextQuality > 0.35) {
            nextQuality = Math.max(0.35, nextQuality - 0.12)
            blob = await render(width, height, nextQuality)
          }
        }
        let scaleFactor = 0.9
        while (blob.size > targetSizeBytes && scaleFactor >= 0.3) {
          width = Math.max(1, Math.round(width * scaleFactor))
          height = Math.max(1, Math.round(height * scaleFactor))
          blob = await render(
            width,
            height,
            mime === 'image/png' ? undefined : (initialQuality ?? 0.92),
          )
          scaleFactor *= 0.9
        }
      }

      const dataUrl = canvas.toDataURL(
        mime,
        mime === 'image/png' ? undefined : (initialQuality ?? 0.92),
      )
      const extension = mime === 'image/jpeg' ? 'jpg' : mime.split('/')[1]
      const file = new File([blob], `cropped-${baseName(fileName ?? 'image')}.${extension}`, {
        type: mime,
        lastModified: Date.now(),
      })

      onCrop?.({ blob, dataUrl, file, width, height })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not crop this image.'
      setStatus(message)
      onErrorRef.current?.(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={cx(styles.root, className)} aria-label={title}>
      <header className={styles.header}>
        <div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
        </div>
        <Crop aria-hidden size={18} />
      </header>

      <div className={styles.stageWrap}>
        <div
          ref={stageRef}
          className={cx(styles.stage, (disabled || !image) && styles.stageDisabled)}
          style={{ touchAction: 'none' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {image && natural.width > 0 ? (
            <>
              <img
                src={src}
                alt=""
                className={styles.image}
                draggable={false}
                style={{
                  width: imageWidth,
                  height: imageHeight,
                  left: imageLeft,
                  top: imageTop,
                }}
              />
              <div
                className={cx(styles.crop, cropShape === 'round' && styles.cropRound)}
                style={{
                  left: cropLeft,
                  top: cropTop,
                  width: cropWidth,
                  height: cropHeight,
                }}
              >
                <div className={styles.grid} />
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <Crop aria-hidden size={26} />
              <span>{status || 'Choose an image to crop.'}</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.zoom}>
          <span className={styles.zoomLabel}>Zoom</span>
          <input
            className={styles.range}
            type="range"
            min={minZoom}
            max={maxZoom}
            step={0.01}
            value={zoom}
            disabled={disabled || !image}
            aria-label="Zoom"
            onChange={(event) => setZoom(Number(event.target.value))}
          />
          <span className={styles.zoomLabel}>{zoom.toFixed(2)}×</span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled || !image}
          onClick={() => {
            setZoom(1)
            setOffset({ x: 0, y: 0 })
          }}
        >
          <RotateCcw aria-hidden size={14} />
          Reset
        </Button>
      </div>

      <p className={styles.hint}>{hint}</p>

      {status && image ? <p className={styles.status}>{status}</p> : null}

      <div className={styles.actions}>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
        ) : null}
        <Button type="button" onClick={() => void apply()} disabled={!canCrop}>
          {busy ? 'Cropping…' : applyLabel}
        </Button>
      </div>
    </section>
  )
}
