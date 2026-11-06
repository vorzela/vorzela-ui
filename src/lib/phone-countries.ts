/**
 * Phone country list + E.164 helpers for PhoneInput.
 * Flags: https://flagcdn.com/{iso2}.png
 */

export type PhoneCountry = {
  iso2: string
  name: string
  dialCode: string
  /** National number placeholder (digits only hint) */
  placeholder: string
}

/** Common markets first; Kenya is the product default. */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso2: 'KE', name: 'Kenya', dialCode: '254', placeholder: '712345678' },
  { iso2: 'UG', name: 'Uganda', dialCode: '256', placeholder: '712345678' },
  { iso2: 'TZ', name: 'Tanzania', dialCode: '255', placeholder: '712345678' },
  { iso2: 'RW', name: 'Rwanda', dialCode: '250', placeholder: '788123456' },
  { iso2: 'ET', name: 'Ethiopia', dialCode: '251', placeholder: '911234567' },
  { iso2: 'SS', name: 'South Sudan', dialCode: '211', placeholder: '912345678' },
  { iso2: 'SO', name: 'Somalia', dialCode: '252', placeholder: '612345678' },
  { iso2: 'DJ', name: 'Djibouti', dialCode: '253', placeholder: '77123456' },
  { iso2: 'BI', name: 'Burundi', dialCode: '257', placeholder: '79123456' },
  { iso2: 'CD', name: 'DR Congo', dialCode: '243', placeholder: '812345678' },
  { iso2: 'ZA', name: 'South Africa', dialCode: '27', placeholder: '821234567' },
  { iso2: 'NG', name: 'Nigeria', dialCode: '234', placeholder: '8012345678' },
  { iso2: 'GH', name: 'Ghana', dialCode: '233', placeholder: '241234567' },
  { iso2: 'AE', name: 'United Arab Emirates', dialCode: '971', placeholder: '501234567' },
  { iso2: 'GB', name: 'United Kingdom', dialCode: '44', placeholder: '7400123456' },
  { iso2: 'US', name: 'United States', dialCode: '1', placeholder: '2025550123' },
  { iso2: 'IN', name: 'India', dialCode: '91', placeholder: '9876543210' },
  { iso2: 'CN', name: 'China', dialCode: '86', placeholder: '13800138000' },
]

/** Sorted longest dial code first so parse matches e.g. 254 before 27. */
const BY_DIAL = [...PHONE_COUNTRIES].sort(
  (a, b) => b.dialCode.length - a.dialCode.length,
)

export function flagUrl(iso2: string): string {
  return `https://flagcdn.com/w40/${iso2.toLowerCase()}.png`
}

export function parsePhoneNumber(
  value: string,
): { country: PhoneCountry; local: string } | null {
  const digits = value.replace(/\D/g, '')
  if (!digits) return null

  for (const c of BY_DIAL) {
    if (digits.startsWith(c.dialCode)) {
      return { country: c, local: digits.slice(c.dialCode.length) }
    }
  }
  return null
}
