import { Eye, EyeOff } from 'lucide-react'
import { useId, useState } from 'react'

import { cx } from '~/lib/cx'

import { Label } from './label'
import styles from './password-input.module.scss'

const STRENGTH = [
  { label: 'Too short', tone: 'destructive' },
  { label: 'Weak', tone: 'destructive' },
  { label: 'Fair', tone: 'warning' },
  { label: 'Good', tone: 'info' },
  { label: 'Strong', tone: 'success' },
] as const

type StrengthTone = (typeof STRENGTH)[number]['tone']

const TONE: Record<StrengthTone, string> = {
  destructive: styles.toneDestructive,
  warning: styles.toneWarning,
  info: styles.toneInfo,
  success: styles.toneSuccess,
}

function scorePassword(value: string): number {
  if (!value) return 0
  let score = 0
  if (value.length >= 8) score += 1
  if (value.length >= 12) score += 1
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1
  return Math.min(4, score)
}

export interface PasswordStrengthInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  hint?: string
  error?: string
  disabled?: boolean
  autoComplete?: string
  showStrength?: boolean
  className?: string
  id?: string
}

export function PasswordStrengthInput({
  value,
  onChange,
  label = 'Password',
  hint,
  error,
  disabled = false,
  autoComplete = 'current-password',
  showStrength = true,
  className,
  id,
}: PasswordStrengthInputProps) {
  const [visible, setVisible] = useState(false)
  const generatedId = useId()
  const inputId = id ?? generatedId
  const strengthId = `${inputId}-strength`
  const score = scorePassword(value)
  const strength = STRENGTH[score]

  return (
    <div className={cx(styles.root, className)}>
      <Label htmlFor={inputId}>{label}</Label>

      <div className={cx(styles.shell, error && styles.invalid)}>
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [
              error ? `${inputId}-error` : null,
              hint ? `${inputId}-hint` : null,
              showStrength ? strengthId : null,
            ]
              .filter(Boolean)
              .join(' ') || undefined
          }
          className={styles.input}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className={styles.toggle}
        >
          {visible ? (
            <EyeOff aria-hidden className={styles.toggleIcon} />
          ) : (
            <Eye aria-hidden className={styles.toggleIcon} />
          )}
        </button>
      </div>

      {showStrength && value ? (
        <div id={strengthId} aria-live="polite" className={styles.strength}>
          <div className={styles.bars} aria-hidden>
            {[0, 1, 2, 3].map((index) => (
              <span
                key={index}
                className={cx(
                  styles.bar,
                  index < Math.max(1, score) && TONE[strength.tone],
                )}
              />
            ))}
          </div>
          <p className={styles.strengthText}>
            Password strength:{' '}
            <span className={styles.strengthValue}>{strength.label}</span>
          </p>
        </div>
      ) : null}

      {hint && !error ? (
        <p id={`${inputId}-hint`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${inputId}-error`} role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
