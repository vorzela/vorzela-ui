import { Check } from 'lucide-react'

import { cx } from '~/lib/cx'
import styles from './stepper.module.scss'

export type Step = {
  id: string
  label: string
  description?: string
  optional?: boolean
}

export type StepperOrientation = 'horizontal' | 'vertical'

export interface StepperProps {
  steps: Step[]
  current: number
  onStepChange?: (index: number) => void
  orientation?: StepperOrientation
  className?: string
  'aria-label'?: string
}

type StepState = 'complete' | 'current' | 'upcoming'

const STATE_CLASS: Record<StepState, string> = {
  complete: styles.complete,
  current: styles.current,
  upcoming: styles.upcoming,
}

/** Progress steps. Completed and current steps are clickable when a handler is set. */
export function Stepper({
  steps,
  current,
  onStepChange,
  orientation = 'horizontal',
  className,
  'aria-label': ariaLabel = 'Progress steps',
}: StepperProps) {
  const safeCurrent = Math.max(0, Math.min(current, steps.length - 1))

  return (
    <ol
      aria-label={ariaLabel}
      className={cx(
        styles.root,
        orientation === 'horizontal' && styles.horizontal,
        orientation === 'vertical' && styles.vertical,
        className,
      )}
    >
      {steps.map((step, index) => {
        const state: StepState =
          index < safeCurrent
            ? 'complete'
            : index === safeCurrent
              ? 'current'
              : 'upcoming'
        const interactive = Boolean(onStepChange) && index <= safeCurrent

        const content = (
          <>
            <span
              aria-hidden
              className={cx(styles.indicator, STATE_CLASS[state])}
            >
              {state === 'complete' ? (
                <Check className={styles.check} aria-hidden />
              ) : (
                index + 1
              )}
            </span>
            <span className={styles.text}>
              <span className={styles.label}>
                {step.label}
                {step.optional ? (
                  <span className={styles.optional}>(optional)</span>
                ) : null}
              </span>
              {step.description ? (
                <span className={styles.description}>{step.description}</span>
              ) : null}
            </span>
          </>
        )

        return (
          <li
            key={step.id}
            className={styles.item}
            data-state={state}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            {interactive ? (
              <button
                type="button"
                className={styles.button}
                onClick={() => onStepChange?.(index)}
              >
                {content}
              </button>
            ) : (
              <div className={styles.panel}>{content}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
