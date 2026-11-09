import { useEffect, useState } from 'react'

const FALLBACK_VERSION = '1.0.3'
const CACHE_KEY = 'vorzela-ui:latest-tag'
const CACHE_TTL_MS = 60 * 60 * 1000

type CachedTag = {
  tag: string
  at: number
}

let pending: Promise<string> | null = null

function parseVersion(value: string): number[] {
  return value.split('.').map((part) => Number.parseInt(part, 10) || 0)
}

function compareVersions(a: string, b: string): number {
  const left = parseVersion(a)
  const right = parseVersion(b)
  const length = Math.max(left.length, right.length)

  for (let index = 0; index < length; index += 1) {
    const diff = (left[index] ?? 0) - (right[index] ?? 0)
    if (diff !== 0) return diff
  }

  return 0
}

function readCachedTag(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const value = JSON.parse(raw) as CachedTag
    if (typeof value.tag !== 'string') return null
    if (Date.now() - value.at > CACHE_TTL_MS) return null
    return value.tag
  } catch {
    return null
  }
}

function writeCachedTag(tag: string) {
  if (typeof window === 'undefined') return

  try {
    window.sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ tag, at: Date.now() } satisfies CachedTag),
    )
  } catch {
    // Storage can be unavailable.
  }
}

function fetchLatestTag(): Promise<string> {
  if (pending) return pending

  pending = fetch(
    'https://api.github.com/repos/vorzela/vorzela-ui/tags?per_page=100',
    {
      headers: {
        Accept: 'application/vnd.github+json',
      },
    },
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`GitHub tags request failed: ${response.status}`)
      }
      return response.json() as Promise<Array<{ name?: string }>>
    })
    .then((tags) => {
      const versions = (Array.isArray(tags) ? tags : [])
        .map((tag) => String(tag.name ?? '').replace(/^v/, ''))
        .filter((value) => /^\d+\.\d+\.\d+$/.test(value))
        .sort(compareVersions)

      const latest = versions.at(-1)
      if (!latest) throw new Error('No version tags found')
      writeCachedTag(latest)
      return latest
    })
    .catch(() => FALLBACK_VERSION)
    .finally(() => {
      pending = null
    })

  return pending
}

/** Latest `vorzela/vorzela-ui` tag, cached for an hour. */
export function useLatestTag(): string {
  const [tag, setTag] = useState(FALLBACK_VERSION)

  useEffect(() => {
    let active = true
    const cached = readCachedTag()
    if (cached) setTag(cached)

    void fetchLatestTag().then((value) => {
      if (active) setTag(value)
    })

    return () => {
      active = false
    }
  }, [])

  return tag
}
