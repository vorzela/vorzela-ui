import { createContext, useContext, type ReactNode } from 'react'

export type Size = 'sm' | 'md' | 'lg'

const SizeContext = createContext<Size>('md')

export function SizeProvider({ size, children }: { size: Size; children: ReactNode }) {
  return <SizeContext.Provider value={size}>{children}</SizeContext.Provider>
}

export function useSize(): Size {
  return useContext(SizeContext)
}
