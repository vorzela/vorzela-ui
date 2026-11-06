/**
 * Security helpers. Treat every prop as untrusted.
 * These are intentionally conservative and unit-testable.
 */

const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])

/** True when the string contains ASCII control characters. */
function hasControlChars(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    if (code <= 0x1f || code === 0x7f) return true
  }
  return false
}
const SAFE_DATA_IMAGE = /^data:image\/(png|jpe?g|gif|webp|avif);base64,[a-z0-9+/=\s]+$/i
const SAFE_RELATIVE = /^(\/(?!\/)|#|\?)/

export type SafeHrefOptions = {
  /** Allow blob: URLs (downloads / object URLs). Default false. */
  allowBlob?: boolean
  /** Allow data:image/* URLs. Default false. */
  allowDataImage?: boolean
}

/**
 * Returns a safe href or undefined. Blocks javascript:, vbscript:, data:,
 * protocol-relative URLs, and control characters.
 */
export function safeHref(
  href: string | null | undefined,
  options: SafeHrefOptions = {},
): string | undefined {
  if (!href) return undefined
  const value = href.trim()
  if (!value) return undefined
  // Reject control characters and whitespace-obfuscated schemes.
  if (hasControlChars(value)) return undefined

  if (SAFE_RELATIVE.test(value)) return value

  if (options.allowDataImage && SAFE_DATA_IMAGE.test(value)) return value
  if (options.allowBlob && value.startsWith('blob:')) return value

  try {
    const url = new URL(value, 'https://vorzela.invalid')
    if (!SAFE_PROTOCOLS.has(url.protocol)) return undefined
    return value
  } catch {
    return undefined
  }
}

/** Props for a safe external link. */
export function safeExternalLinkProps(href: string | null | undefined) {
  const safe = safeHref(href)
  return {
    href: safe,
    rel: 'noopener noreferrer',
    referrerPolicy: 'strict-origin-when-cross-origin' as const,
  }
}

/** Escape text for interpolation into HTML. */
export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

/** Remove tags without rendering HTML. */
export function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '')
}

/**
 * Sanitize untrusted HTML. Requires the optional `dompurify` dependency.
 * Components must not use `dangerouslySetInnerHTML` without this.
 */
export async function sanitizeHtml(dirty: string): Promise<string> {
  const mod = await import('dompurify')
  const DOMPurify = mod.default
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick'],
  })
}

/** Escape a CSV cell and neutralize formula injection. */
export function escapeCsvCell(value: unknown): string {
  const raw = value == null ? '' : String(value)
  const neutralized = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw
  return `"${neutralized.replaceAll('"', '""')}"`
}

export function toCsv(rows: Array<Array<unknown>>): string {
  return rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n')
}

export type FileValidationOptions = {
  /** MIME types or extensions, e.g. ["image/png", ".pdf"]. */
  accept?: string[]
  maxBytes?: number
  /** Reject files smaller than this. Useful for avoiding empty placeholders. */
  minBytes?: number
  /** Optional image dimension guard. */
  maxImageDimension?: number
  /** Reject images smaller than this on either axis. */
  minImageDimension?: number
}

export type FileValidationResult =
  | { ok: true }
  | {
      ok: false
      reason:
        | 'type'
        | 'size'
        | 'min-size'
        | 'dimensions'
        | 'min-dimensions'
        | 'empty'
    }

export async function validateFile(
  file: File,
  options: FileValidationOptions = {},
): Promise<FileValidationResult> {
  if (!file || file.size === 0) return { ok: false, reason: 'empty' }
  if (options.maxBytes != null && file.size > options.maxBytes) {
    return { ok: false, reason: 'size' }
  }
  if (options.minBytes != null && file.size < options.minBytes) {
    return { ok: false, reason: 'min-size' }
  }
  if (options.accept?.length) {
    const name = file.name.toLowerCase()
    const type = file.type.toLowerCase()
    const accepted = options.accept.some((rule) => {
      const normalized = rule.toLowerCase()
      return normalized.startsWith('.')
        ? name.endsWith(normalized)
        : type === normalized || type.startsWith(`${normalized}/`)
    })
    if (!accepted) return { ok: false, reason: 'type' }
  }
  if (
    (options.maxImageDimension != null ||
      options.minImageDimension != null) &&
    file.type.startsWith('image/') &&
    typeof createImageBitmap === 'function'
  ) {
    try {
      const bitmap = await createImageBitmap(file)
      const tooLarge =
        options.maxImageDimension != null &&
        (bitmap.width > options.maxImageDimension ||
          bitmap.height > options.maxImageDimension)
      const tooSmall =
        options.minImageDimension != null &&
        (bitmap.width < options.minImageDimension ||
          bitmap.height < options.minImageDimension)
      bitmap.close()
      if (tooLarge) return { ok: false, reason: 'dimensions' }
      if (tooSmall) return { ok: false, reason: 'min-dimensions' }
    } catch {
      return { ok: false, reason: 'type' }
    }
  }
  return { ok: true }
}

/** Check postMessage origin against an allowlist. */
export function isTrustedOrigin(
  origin: string,
  allowlist: readonly string[],
): boolean {
  return allowlist.includes(origin)
}

/** Reject prototype-pollution keys before merging untrusted objects. */
export function hasUnsafeKeys(value: unknown): boolean {
  if (value == null || typeof value !== 'object') return false
  return Object.keys(value).some((key) =>
    ['__proto__', 'constructor', 'prototype'].includes(key),
  )
}

/** Safe JSON parse with a fallback. */
export function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    const parsed: unknown = JSON.parse(raw)
    return hasUnsafeKeys(parsed) ? fallback : (parsed as T)
  } catch {
    return fallback
  }
}

/** Redact common PII before logging/telemetry. */
export function redactPii(value: string): string {
  return value
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]')
    .replace(/\b(?:\+?\d[\d\s-]{7,}\d)\b/g, '[phone]')
    .replace(/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, '[card]')
}

/** Prevent path traversal and header injection in generated filenames. */
export function safeFileName(name: string, fallback = 'download'): string {
  const cleaned = Array.from(
    name.replace(/[/\\?%*:|"<>]/g, '-'),
    (char) => {
      const code = char.charCodeAt(0)
      return code <= 0x1f || code === 0x7f ? '' : char
    },
  )
    .join('')
    .replace(/^[.-]+/, '')
    .trim()
  return cleaned || fallback
}
