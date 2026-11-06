import {
  Children,
  Fragment,
  isValidElement,
  type ReactNode,
} from 'react'

/**
 * <For each={items} fallback={<Empty />}>
 *   {(item, index) => <Row key={item.id} item={item} />}
 * </For>
 *
 * Renders children for each element of `each`.
 * Falls back to `fallback` (or null) when the array is empty or nullish.
 * Always assigns a React key (from the child, or the index).
 */
interface ForProps<T> {
  each: T[] | null | undefined
  fallback?: ReactNode
  children: (item: T, index: number) => ReactNode
}

export function For<T>({ each, fallback = null, children }: ForProps<T>) {
  if (!Array.isArray(each) || each.length === 0) return <>{fallback}</>

  return (
    <>
      {each.map((item, i) => {
        const node = children(item, i)
        if (isValidElement(node)) {
          return node.key != null ? node : <Fragment key={i}>{node}</Fragment>
        }
        // Arrays / text / multiple nodes from the render prop
        return <Fragment key={i}>{Children.toArray(node)}</Fragment>
      })}
    </>
  )
}
