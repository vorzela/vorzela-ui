import { useEffect, useRef } from 'react'

export type Hotkey = {
  key: string
  meta?: boolean
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  )
}

/**
 * Global hotkeys. Ignores editable targets unless `allowInInputs`.
 * Listener is removed on unmount.
 */
export function useHotkeys(
  hotkeys: Array<Hotkey & { handler: (event: KeyboardEvent) => void }>,
  options: { allowInInputs?: boolean; enabled?: boolean } = {},
) {
  const ref = useRef(hotkeys)
  useEffect(() => {
    ref.current = hotkeys
  }, [hotkeys])

  useEffect(() => {
    if (options.enabled === false) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (!options.allowInInputs && isEditable(event.target)) return
      for (const hotkey of ref.current) {
        if (event.key.toLowerCase() !== hotkey.key.toLowerCase()) continue
        if (!!hotkey.meta !== event.metaKey) continue
        if (!!hotkey.ctrl !== event.ctrlKey) continue
        if (!!hotkey.alt !== event.altKey) continue
        if (!!hotkey.shift !== event.shiftKey) continue
        event.preventDefault()
        hotkey.handler(event)
        break
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [options.allowInInputs, options.enabled])
}
