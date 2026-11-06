/**
 * Flag + dial-code country selector with local number input.
 * Outputs full E.164 format: "+254712345678"
 */
import { ChevronDown, CircleAlert } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

import { cx } from '~/lib/cx'
import type { PhoneCountry } from '~/lib/phone-countries'
import {
  flagUrl,
  parsePhoneNumber,
  PHONE_COUNTRIES,
} from '~/lib/phone-countries'

import { Label } from './label'
import styles from './phone-input.module.scss'

const DEFAULT_ISO2 = 'KE'

function defaultCountry(): PhoneCountry {
  return PHONE_COUNTRIES.find((c) => c.iso2 === DEFAULT_ISO2)!
}

export interface PhoneInputProps {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  /** Full E.164 value, e.g. "+254712345678" or "" */
  value?: string | null
  onChange?: (full: string) => void
  onBlur?: () => void
  disabled?: boolean
  wrapClass?: string
}

export function PhoneInput({
  label,
  hint,
  error,
  required,
  value,
  onChange,
  onBlur,
  disabled,
  wrapClass,
}: PhoneInputProps) {
  const external = value ?? ''
  const initialParsed = parsePhoneNumber(external)

  const [state, setState] = useState(() => ({
    external,
    country: initialParsed?.country ?? defaultCountry(),
    local: initialParsed?.local ?? '',
  }))
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const wrapRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const id = useId()
  const listboxId = `${id}-listbox`

  // Derive the controls from the latest external value during render, so a
  // form reset updates the UI without a setState-in-effect round trip.
  let country = state.country
  let local = state.local
  if (state.external !== external) {
    const parsed = parsePhoneNumber(external)
    country = parsed?.country ?? defaultCountry()
    local = parsed?.local ?? ''
  }
  const setCountry = (next: PhoneCountry) => setState({ external, country: next, local })
  const setLocal = (next: string) => setState({ external, country, local: next })

  const filteredCountries = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return PHONE_COUNTRIES
    return PHONE_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.iso2.toLowerCase().includes(q),
    )
  }, [search])

  function emit(c: PhoneCountry, l: string) {
    const digits = l.replace(/\D/g, '')
    const full = digits ? `+${c.dialCode}${digits}` : ''
    onChange?.(full)
  }

  function handleLocalInput(event: ChangeEvent<HTMLInputElement>) {
    const digits = event.currentTarget.value.replace(/[^0-9]/g, '')
    setLocal(digits)
    emit(country, digits)
  }

  function selectCountry(c: PhoneCountry) {
    setCountry(c)
    setOpen(false)
    setSearch('')
    emit(c, local)
  }

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDocClick, true)
    return () => document.removeEventListener('click', onDocClick, true)
  }, [])

  useEffect(() => {
    if (!open) return
    queueMicrotask(() => searchRef.current?.focus({ preventScroll: true }))
  }, [open])

  const hasError = Boolean(error)

  return (
    <div className={cx(styles.root, wrapClass)} ref={wrapRef}>
      {label ? (
        <Label htmlFor={id} required={required} hint={hint} hintId={`${id}-hint`}>
          {label}
        </Label>
      ) : null}

      <div className={styles.field}>
        <div
          className={cx(
            styles.row,
            hasError && styles.invalid,
            disabled && styles.disabled,
          )}
        >
          <button
            type="button"
            className={styles.countryButton}
            onClick={() => setOpen((v) => !v)}
            aria-label={`Country code: ${country.name} +${country.dialCode}. Change country`}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? listboxId : undefined}
          >
            <img
              src={flagUrl(country.iso2)}
              alt=""
              width={24}
              height={18}
              className={styles.flag}
              loading="lazy"
            />
            <span className={styles.dialCode}>+{country.dialCode}</span>
            <ChevronDown
              aria-hidden
              className={cx(styles.chevron, open && styles.chevronOpen)}
            />
          </button>

          <input
            id={id}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder={country.placeholder}
            disabled={disabled}
            value={local}
            aria-invalid={hasError || undefined}
            aria-describedby={
              hasError ? `${id}-error` : hint ? `${id}-hint` : undefined
            }
            onChange={handleLocalInput}
            onBlur={onBlur}
            className={styles.input}
          />

          {hasError ? (
            <span className={styles.errorIcon}>
              <CircleAlert size={16} aria-hidden />
            </span>
          ) : null}
        </div>

        {open ? (
          <div
            id={listboxId}
            role="listbox"
            aria-label="Countries"
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.stopPropagation()
                setOpen(false)
              }
            }}
            className={styles.dropdown}
          >
            <div className={styles.searchWrap}>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search country or code…"
                aria-label="Search countries"
                autoComplete="off"
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.list}>
              {filteredCountries.length > 0 ? (
                filteredCountries.map((c) => (
                  <button
                    key={c.iso2}
                    type="button"
                    role="option"
                    aria-selected={country.iso2 === c.iso2}
                    className={cx(
                      styles.option,
                      country.iso2 === c.iso2 && styles.optionSelected,
                    )}
                    onClick={() => selectCountry(c)}
                  >
                    <img
                      src={flagUrl(c.iso2)}
                      alt=""
                      width={24}
                      height={18}
                      className={styles.flag}
                      loading="lazy"
                    />
                    <span className={styles.optionName}>{c.name}</span>
                    <span className={styles.optionCode}>+{c.dialCode}</span>
                  </button>
                ))
              ) : (
                <p className={styles.empty}>No countries found</p>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <p id={`${id}-error`} role="alert" className={cx(styles.message, styles.errorText)}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
