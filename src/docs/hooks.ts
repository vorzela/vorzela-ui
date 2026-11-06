import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'vz-theme'

function readTheme(): Theme {
  if (typeof window === 'undefined') return 'light'

  // Deep-link a theme for screenshots and QA: ?theme=dark
  const forced = new URLSearchParams(window.location.search).get('theme')
  if (forced === 'light' || forced === 'dark') return forced

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    /* storage blocked */
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/** Light/dark theme persisted in localStorage and applied to `<html>`. */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme

    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#090d15' : '#f6f7f9')

    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* storage blocked */
    }
  }, [theme])

  const toggle = useCallback(() => {
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, setTheme: setThemeState, toggle }
}

export interface Route {
  path: string
  segments: string[]
}

function parseHash(): Route {
  const raw = window.location.hash.replace(/^#\/?/, '')
  const path = raw.split('?')[0] ?? ''
  const segments = path.split('/').filter(Boolean)
  return { path: segments.join('/'), segments }
}

/** Hash-based router. Keeps deep links shareable without a server rewrite. */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parseHash)

  useEffect(() => {
    const onChange = () => setRoute(parseHash())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}

export function navigate(path: string) {
  window.location.hash = `#/${path.replace(/^\/+/, '')}`
}
