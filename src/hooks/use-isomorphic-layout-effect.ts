import { useEffect, useLayoutEffect } from 'react'

/** useLayoutEffect on the client, useEffect on the server. */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect
