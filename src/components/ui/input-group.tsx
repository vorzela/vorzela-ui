import type { ComponentProps, HTMLAttributes, Ref } from 'react'
import * as React from 'react'

import { cx } from '~/lib/cx'

import styles from './input-group.module.scss'
import { BareInput } from './input'

export interface InputGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Stack segments vertically instead of a single connected row. */
  orientation?: 'horizontal' | 'vertical'
}

/**
 * Connected control group — share one border / focus ring across addons and
 * inputs.
 *
 * @example
 * <InputGroup>
 *   <InputGroupAddon>https://</InputGroupAddon>
 *   <Input placeholder="vorzela.com" />
 *   <InputGroupAddon align="end">.app</InputGroupAddon>
 * </InputGroup>
 */
export function InputGroup({
  className,
  orientation = 'horizontal',
  ...props
}: InputGroupProps) {
  return (
    <div
      role="group"
      data-orientation={orientation}
      className={cx(
        styles.group,
        orientation === 'vertical' && styles.vertical,
        className,
      )}
      {...props}
    />
  )
}

export interface InputGroupAddonProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end'
}

export function InputGroupAddon({
  className,
  align = 'start',
  ...props
}: InputGroupAddonProps) {
  return (
    <div
      data-slot="addon"
      data-align={align}
      className={cx(styles.addon, className)}
      {...props}
    />
  )
}

export function InputGroupText({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx(styles.text, className)} {...props} />
}

export const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  ComponentProps<typeof BareInput>
>(function InputGroupInput({ className, ...props }, ref: Ref<HTMLInputElement>) {
  return (
    <span className={styles.inputWrap}>
      <BareInput ref={ref} className={cx(styles.control, className)} {...props} />
    </span>
  )
})
