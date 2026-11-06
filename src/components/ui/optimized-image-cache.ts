/**
 * Caches and network helpers for <OptimizedImage>.
 * Kept in a component-free module so the component can Fast Refresh.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OptimizedImageSource {
  srcSet: string
  type?: string
  media?: string
  sizes?: string
}

export type AutoDetectFormat = 'avif' | 'webp'
export type CacheVersion = number | string

// ── Caches ────────────────────────────────────────────────────────────────────

const CACHE_LIMITS = {
  loadedImages: 400,
  pendingRequests: 150,
  assetExistenceChecks: 800,
  discoveredSources: 300,
} as const

const loadedImageCache = new Set<string>()
const pendingImageCache = new Map<string, Promise<void>>()
const assetExistenceCache = new Map<string, Promise<boolean>>()
const discoveredSourceCache = new Map<string, Promise<OptimizedImageSource[]>>()
const RASTER_EXTENSIONS = new Set(['avif', 'jpeg', 'jpg', 'png', 'webp'])
export const AUTO_DETECT_FORMATS: AutoDetectFormat[] = ['avif', 'webp']

function trimSetCache(cache: Set<string>, max: number) {
  while (cache.size > max) {
    const k = cache.values().next().value as string | undefined
    if (k === undefined) return
    cache.delete(k)
  }
}

function trimMapCache<K, V>(cache: Map<K, V>, max: number) {
  while (cache.size > max) {
    const k = cache.keys().next().value as K | undefined
    if (k === undefined) return
    cache.delete(k)
  }
}

function lruGet<K, V>(cache: Map<K, V>, key: K): V | undefined {
  const v = cache.get(key)
  if (v === undefined) return undefined
  cache.delete(key)
  cache.set(key, v)
  return v
}

function lruSet<K, V>(cache: Map<K, V>, key: K, value: V, max: number) {
  cache.delete(key)
  cache.set(key, value)
  trimMapCache(cache, max)
}

export function hasLoadedImage(key: string): boolean {
  if (!loadedImageCache.has(key)) return false
  loadedImageCache.delete(key)
  loadedImageCache.add(key)
  return true
}

export function rememberLoadedImage(key: string) {
  loadedImageCache.delete(key)
  loadedImageCache.add(key)
  trimSetCache(loadedImageCache, CACHE_LIMITS.loadedImages)
}

export function withCacheVersion(url: string, v?: CacheVersion): string {
  if (v === undefined || v === null || v === '') return url
  const [noHash, hash = ''] = url.split('#', 2)
  const [path, query = ''] = noHash.split('?', 2)
  const p = new URLSearchParams(query)
  p.set('__imgv', String(v))
  return `${path}?${p}${hash ? `#${hash}` : ''}`
}

export function withCacheVersionInSrcSet(srcSet: string, v?: CacheVersion): string {
  if (!srcSet || v === undefined || v === null || v === '') return srcSet
  return srcSet
    .split(',')
    .map((c) => {
      const t = c.trim()
      if (!t) return ''
      const [url, ...desc] = t.split(/\s+/)
      return [withCacheVersion(url, v), ...desc].join(' ')
    })
    .filter(Boolean)
    .join(', ')
}

function normalizeDetectionUrl(src: string): URL | undefined {
  if (typeof window === 'undefined' || !src) return undefined
  if (src.startsWith('data:') || src.startsWith('blob:')) return undefined
  try {
    const url = new URL(src, window.location.origin)
    if (url.origin !== window.location.origin) return undefined
    return url
  } catch {
    return undefined
  }
}

function getBaseImageParts(src: string) {
  const url = normalizeDetectionUrl(src)
  if (!url) return undefined
  const lastDot = url.pathname.lastIndexOf('.')
  const lastSlash = url.pathname.lastIndexOf('/')
  if (lastDot <= lastSlash) return undefined
  const ext = url.pathname.slice(lastDot + 1).toLowerCase()
  if (!RASTER_EXTENSIONS.has(ext)) return undefined
  return { basePath: url.pathname.slice(0, lastDot), extension: ext, search: url.search, hash: url.hash }
}

function buildVariantUrl(src: string, format: string, width?: number, v?: CacheVersion) {
  const parts = getBaseImageParts(src)
  if (!parts) return undefined
  const widthSuffix = width ? `-${width}` : ''
  return withCacheVersion(
    `${parts.basePath}${widthSuffix}.${format}${parts.search}${parts.hash}`,
    v,
  )
}

export function getDetectedSourceCacheKey(
  src: string,
  formats: AutoDetectFormat[],
  responsiveWidths: number[],
  sizes?: string,
  v?: CacheVersion,
): string {
  return JSON.stringify({ src, formats, responsiveWidths, sizes: sizes ?? '', cacheVersion: v ?? '' })
}

function checkAssetExists(url: string): Promise<boolean> {
  const cached = lruGet(assetExistenceCache, url)
  if (cached) return cached
  const p = fetch(url, { method: 'HEAD', credentials: 'omit' })
    .then((r) => r.ok)
    .catch(() => false)
  lruSet(assetExistenceCache, url, p, CACHE_LIMITS.assetExistenceChecks)
  return p
}

export async function detectAutoSources(
  src: string,
  formats: AutoDetectFormat[],
  responsiveWidths: number[],
  sizes?: string,
  v?: CacheVersion,
): Promise<OptimizedImageSource[]> {
  if (typeof window === 'undefined') return []
  if (!getBaseImageParts(src)) return []
  const key = getDetectedSourceCacheKey(src, formats, responsiveWidths, sizes, v)
  const cached = lruGet(discoveredSourceCache, key)
  if (cached) return cached

  const detection = (async () => {
    const sources: OptimizedImageSource[] = []
    for (const format of formats) {
      if (responsiveWidths.length > 0) {
        const candidates = await Promise.all(
          responsiveWidths.map(async (w) => {
            const url = buildVariantUrl(src, format, w, v)
            if (!url) return undefined
            return (await checkAssetExists(url)) ? `${url} ${w}w` : undefined
          }),
        )
        const srcSet = candidates.filter(Boolean).join(', ')
        if (srcSet) {
          sources.push({ srcSet, type: `image/${format}`, sizes })
          continue
        }
      }
      const url = buildVariantUrl(src, format, undefined, v)
      if (url && (await checkAssetExists(url))) {
        sources.push({ srcSet: url, type: `image/${format}`, sizes })
      }
    }
    return sources
  })().catch((err) => {
    discoveredSourceCache.delete(key)
    throw err
  })

  lruSet(discoveredSourceCache, key, detection, CACHE_LIMITS.discoveredSources)
  return detection
}

export function clearOptimizedImageCache(match?: string | RegExp | ((k: string) => boolean)) {
  const test =
    typeof match === 'function'
      ? match
      : match instanceof RegExp
        ? (k: string) => match.test(k)
        : typeof match === 'string'
          ? (k: string) => k.includes(match)
          : () => true

  for (const k of Array.from(loadedImageCache)) if (test(k)) loadedImageCache.delete(k)
  for (const k of Array.from(pendingImageCache.keys())) if (test(k)) pendingImageCache.delete(k)
  for (const k of Array.from(assetExistenceCache.keys())) if (test(k)) assetExistenceCache.delete(k)
  for (const k of Array.from(discoveredSourceCache.keys())) if (test(k)) discoveredSourceCache.delete(k)
}

export function getImageCacheKey(src: string, srcSet?: string, sizes?: string): string {
  return `${src}::${srcSet ?? ''}::${sizes ?? ''}`
}

export function preloadImage(src: string, srcSet?: string, sizes?: string): Promise<void> {
  if (typeof window === 'undefined' || !src) return Promise.resolve()
  const key = getImageCacheKey(src, srcSet, sizes)
  if (hasLoadedImage(key)) return Promise.resolve()
  const pending = lruGet(pendingImageCache, key)
  if (pending) return pending
  const p = new Promise<void>((resolve, reject) => {
    let done = false
    const img = new window.Image()
    const res = () => { if (done) return; done = true; rememberLoadedImage(key); pendingImageCache.delete(key); resolve() }
    const rej = () => { if (done) return; done = true; pendingImageCache.delete(key); reject(new Error(`Failed to preload: ${src}`)) }
    img.onload = res; img.onerror = rej
    if (srcSet) img.srcset = srcSet
    if (sizes) img.sizes = sizes
    img.decoding = 'async'; img.src = src
    if (img.complete && img.naturalWidth > 0) res()
  })
  lruSet(pendingImageCache, key, p, CACHE_LIMITS.pendingRequests)
  return p
}
