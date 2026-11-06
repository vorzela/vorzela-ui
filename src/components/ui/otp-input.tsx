import * as React from 'react'

import { useControllableState } from '~/hooks/use-controllable-state'
import { cx } from '~/lib/cx'
import styles from './otp-input.module.scss'

export interface OtpInputProps {
  length?: number
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  autoFocus?: boolean
  label?: string
  className?: string
}

export function OtpInput({
  length = 6,
  value,
  defaultValue = '',
  onChange,
  onComplete,
  disabled = false,
  autoFocus = false,
  label = 'One-time code',
  className,
}: OtpInputProps) {
  const [code, setCode] = useControllableState({
    value,
    defaultValue,
    onChange,
  })
  const inputs = React.useRef<Array<HTMLInputElement | null>>([])

  const commit = (next: string) => {
    setCode(next)
    if (next.length === length) onComplete?.(next)
  }

  const focusAt = (index: number) => {
    const bounded = Math.max(0, Math.min(index, length - 1))
    inputs.current[bounded]?.focus()
    inputs.current[bounded]?.select()
  }

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (!digits) return

    const chars = (code.padEnd(length, ' ').split('') as string[]).slice(
      0,
      length,
    )

    if (digits.length > 1) {
      for (let i = 0; i < digits.length && index + i < length; i += 1) {
        chars[index + i] = digits[i]
      }
      const next = chars.join('').replaceAll(' ', '').slice(0, length)
      commit(next)
      focusAt(Math.min(index + digits.length, length - 1))
      return
    }

    chars[index] = digits
    commit(chars.join('').replaceAll(' ', '').slice(0, length))
    if (index < length - 1) focusAt(index + 1)
  }

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Backspace') {
      event.preventDefault()
      const chars = code.split('')

      if (chars[index]) {
        chars[index] = ''
        commit(chars.join(''))
      } else if (index > 0) {
        chars[index - 1] = ''
        commit(chars.join(''))
        focusAt(index - 1)
      }
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusAt(index - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusAt(index + 1)
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const digits = event.clipboardData.getData('text').replace(/\D/g, '')
    if (!digits) return
    commit(digits.slice(0, length))
    focusAt(Math.min(digits.length, length - 1))
  }

  return (
    <div
      role="group"
      aria-label={label}
      className={cx(styles.root, className)}
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(node) => {
            inputs.current[index] = node
          }}
          value={code[index] ?? ''}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          aria-label={`Digit ${index + 1} of ${length}`}
          className={styles.control}
        />
      ))}
    </div>
  )
}
