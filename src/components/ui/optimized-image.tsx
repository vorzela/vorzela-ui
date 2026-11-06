/**
 * WEB ONLY — browser Image / picture / HEAD fetch. Not for React Native.
 *
 * OptimizedImage with a muted skeleton/fallback. LRU caches are module-scoped
 * and size-capped; clearOptimizedImageCache() for logout / tenant switch.
 * Effects ignore stale resolutions via signature keys.
 */
import { ImageOff } from 'lucide-react'
import type React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { cx } from '~/lib/cx'

import { For } from '~/components/utils/for'
import {
  AUTO_DETECT_FORMATS,
  clearOptimizedImageCache,
  detectAutoSources,
  getDetectedSourceCacheKey,
  getImageCacheKey,
  hasLoadedImage,
  preloadImage,
  rememberLoadedImage,
  withCacheVersion,
  withCacheVersionInSrcSet,
  type AutoDetectFormat,
  type CacheVersion,
  type OptimizedImageSource,
} from './optimized-image-cache'
import styles from './optimized-image.module.scss'

// ── Presentation ──────────────────────────────────────────────────────────────

type ImageFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'

const FIT_CLASS: Record<ImageFit, string> = {
  contain: styles.fitContain,
  cover: styles.fitCover,
  fill: styles.fitFill,
  none: styles.fitNone,
  'scale-down': styles.fitScaleDown,
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface OptimizedImageProps
  extends Omit<
    React.ImgHTMLAttributes<HTMLImageElement>,
    'alt' | 'className' | 'decoding' | 'height' | 'onError' | 'onLoad' | 'src' | 'style' | 'width'
  > {
  src: string
  alt: string
  width?: number
  height?: number
  aspectRatio?: string
  srcSet?: string
  sizes?: string
  sources?: OptimizedImageSource[]
  priority?: boolean
  autoDetectSources?: boolean
  autoDetectFormats?: AutoDetectFormat[]
  responsiveWidths?: number[]
  cacheVersion?: CacheVersion
  loadingStrategy?: 'eager' | 'lazy'
  decodingStrategy?: 'async' | 'auto' | 'sync'
  fetchPriority?: 'auto' | 'high' | 'low'
  fallbackSrc?: string
  fallback?: React.ReactNode
  showSkeleton?: boolean
  fit?: ImageFit
  className?: string
  style?: React.CSSProperties
  imageClassName?: string
  imageStyle?: React.CSSProperties
  skeletonClassName?: string
  fallbackClassName?: string
  onLoad?: (image: HTMLImageElement) => void
  onError?: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  aspectRatio,
  srcSet: srcSetProp,
  sizes,
  sources: sourcesProp,
  priority,
  autoDetectSources,
  autoDetectFormats,
  responsiveWidths,
  cacheVersion,
  loadingStrategy,
  decodingStrategy,
  fetchPriority,
  fallbackSrc,
  fallback,
  showSkeleton = true,
  fit = 'cover',
  className,
  style,
  imageClassName,
  imageStyle,
  skeletonClassName,
  fallbackClassName,
  onLoad: onLoadProp,
  onError: onErrorProp,
  ...imgAttrs
}: OptimizedImageProps) {
  const resolvedSrc = useMemo(() => withCacheVersion(src, cacheVersion), [src, cacheVersion])
  const resolvedFallbackSrc = useMemo(
    () => (fallbackSrc ? withCacheVersion(fallbackSrc, cacheVersion) : undefined),
    [fallbackSrc, cacheVersion],
  )
  const resolvedSrcSet = useMemo(
    () => (srcSetProp ? withCacheVersionInSrcSet(srcSetProp, cacheVersion) : undefined),
    [srcSetProp, cacheVersion],
  )
  const resolvedSources = useMemo(
    () =>
      sourcesProp?.map((s) => ({ ...s, srcSet: withCacheVersionInSrcSet(s.srcSet, cacheVersion) })),
    [sourcesProp, cacheVersion],
  )

  const [detectedSources, setDetectedSources] = useState<OptimizedImageSource[]>([])
  const [activeSrc, setActiveSrc] = useState(resolvedSrc)
  const [loaded, setLoaded] = useState(() =>
    hasLoadedImage(getImageCacheKey(resolvedSrc, resolvedSrcSet, sizes)),
  )
  const [failed, setFailed] = useState(false)
  const [usingFallbackSrc, setUsingFallbackSrc] = useState(false)

  const imageRef = useRef<HTMLImageElement>(null)
  const prevSignatureRef = useRef<string | undefined>(undefined)

  const activeSrcSet = usingFallbackSrc ? undefined : resolvedSrcSet
  const activeSizes = usingFallbackSrc ? undefined : sizes
  const activeCacheKey = getImageCacheKey(activeSrc, activeSrcSet, activeSizes)

  // Reset on src/cacheVersion change
  useEffect(() => {
    let cancelled = false
    const sig = `${src}::${cacheVersion ?? ''}`
    if (prevSignatureRef.current && prevSignatureRef.current !== sig) {
      clearOptimizedImageCache(src)
    }
    prevSignatureRef.current = sig

    const key = getImageCacheKey(resolvedSrc, resolvedSrcSet, sizes)
    const alreadyLoaded = hasLoadedImage(key)
    setActiveSrc(resolvedSrc)
    setLoaded(alreadyLoaded)
    setFailed(false)
    setUsingFallbackSrc(false)

    if (!alreadyLoaded && priority) {
      preloadImage(resolvedSrc, resolvedSrcSet, sizes)
        .then(() => {
          if (cancelled) return
          setLoaded(true)
          setFailed(false)
        })
        .catch(() => undefined)
    }
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, cacheVersion])

  // Auto-detect sources
  useEffect(() => {
    let cancelled = false
    if (resolvedSources?.length || !autoDetectSources) {
      setDetectedSources([])
      return
    }
    const fmts = (
      autoDetectFormats?.length ? [...new Set(autoDetectFormats)] : AUTO_DETECT_FORMATS
    ) as AutoDetectFormat[]
    const widths = [...(responsiveWidths ?? [])].sort((a, b) => a - b)
    const key = getDetectedSourceCacheKey(src, fmts, widths, sizes, cacheVersion)

    detectAutoSources(src, fmts, widths, sizes, cacheVersion)
      .then((detected) => {
        if (cancelled) return
        if (key === getDetectedSourceCacheKey(src, fmts, widths, sizes, cacheVersion)) {
          setDetectedSources(detected)
        }
      })
      .catch(() => {
        if (cancelled) return
        if (key === getDetectedSourceCacheKey(src, fmts, widths, sizes, cacheVersion)) {
          setDetectedSources([])
        }
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, sizes, cacheVersion, autoDetectSources, autoDetectFormats, responsiveWidths])

  const discoveredSources = resolvedSources?.length ? resolvedSources : detectedSources
  const ratio = aspectRatio ?? (width && height ? `${width} / ${height}` : undefined)

  const mediaStyle: React.CSSProperties = {
    ...(ratio ? { aspectRatio: ratio } : {}),
    ...style,
    ...imageStyle,
  }

  const fitClass = FIT_CLASS[fit]
  const shouldShowSkeleton = showSkeleton && !loaded && !failed
  const shouldUsePicture = !usingFallbackSrc && Boolean(discoveredSources?.length)

  const mediaClass = cx(
    styles.image,
    fitClass,
    shouldShowSkeleton && styles.skeleton,
    shouldShowSkeleton && skeletonClassName,
    className,
    imageClassName,
  )

  function syncLoaded(img?: HTMLImageElement | null) {
    if (!img || failed) return
    if (img.complete && img.naturalWidth > 0) {
      rememberLoadedImage(activeCacheKey)
      setLoaded(true)
      setFailed(false)
    }
  }

  function handleLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget
    const finalize = () => {
      rememberLoadedImage(activeCacheKey)
      setLoaded(true)
      setFailed(false)
      onLoadProp?.(img)
    }
    const decode = img.decode?.()
    if (decode) {
      decode.catch(() => undefined).finally(finalize)
    } else {
      finalize()
    }
  }

  function handleError() {
    onErrorProp?.()
    if (!usingFallbackSrc && resolvedFallbackSrc && resolvedFallbackSrc !== activeSrc) {
      setUsingFallbackSrc(true)
      setActiveSrc(resolvedFallbackSrc)
      setLoaded(hasLoadedImage(getImageCacheKey(resolvedFallbackSrc)))
      setFailed(false)
      return
    }
    setFailed(true)
  }

  const imgNode = (
    <img
      {...imgAttrs}
      ref={(el) => {
        ;(imageRef as React.MutableRefObject<HTMLImageElement | null>).current = el
        syncLoaded(el)
      }}
      src={activeSrc}
      alt={alt}
      width={width}
      height={height}
      srcSet={usingFallbackSrc ? undefined : resolvedSrcSet}
      sizes={usingFallbackSrc ? undefined : sizes}
      loading={priority ? 'eager' : (loadingStrategy ?? 'lazy')}
      decoding={priority ? 'sync' : (decodingStrategy ?? 'async')}
      fetchPriority={fetchPriority ?? (priority ? 'high' : undefined)}
      onLoad={handleLoad}
      onError={handleError}
      className={mediaClass}
      style={mediaStyle}
    />
  )

  if (failed) {
    if (fallback) {
      return (
        <span className={cx(styles.fallback, className, fallbackClassName)} style={mediaStyle}>
          {fallback}
        </span>
      )
    }
    if (alt === '') return null
    return (
      <span
        role="img"
        aria-label={alt}
        className={cx(styles.fallback, styles.fallbackPlaceholder, className, fallbackClassName)}
        style={mediaStyle}
      >
        <ImageOff aria-hidden size={20} />
      </span>
    )
  }

  if (shouldUsePicture) {
    return (
      <picture>
        <For each={discoveredSources}>
          {(source) => (
            <source
              key={source.srcSet}
              srcSet={source.srcSet}
              type={source.type}
              media={source.media}
              sizes={source.sizes}
            />
          )}
        </For>
        {imgNode}
      </picture>
    )
  }

  return imgNode
}
