import { useEffect, useRef, useState } from 'react'

export type ContainerSize = {
  width: number
  height: number
}

/**
 * Observe a container’s size. Prefer this over window resize for components.
 * The observer is disconnected on unmount.
 */
export function useContainerSize<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null)
  const [size, setSize] = useState<ContainerSize>({ width: 0, height: 0 })

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const measure = () => {
      const rect = node.getBoundingClientRect()
      setSize((prev) =>
        prev.width === rect.width && prev.height === rect.height
          ? prev
          : { width: rect.width, height: rect.height },
      )
    }

    // Measure once immediately. ResizeObserver is not guaranteed to deliver an
    // initial entry in every embedded browser, and charts need a width to draw.
    measure()

    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver((entries) => {
            const entry = entries[0]
            if (!entry) return
            const box = entry.contentRect
            setSize((prev) =>
              prev.width === box.width && prev.height === box.height
                ? prev
                : { width: box.width, height: box.height },
            )
          })

    observer?.observe(node)
    window.addEventListener('resize', measure)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  return { ref, ...size }
}

/** Container-query helper: true when the observed width is at least `px`. */
export function useContainerQuery(px: number) {
  const { ref, width } = useContainerSize()
  return { ref, width, matches: width >= px }
}
