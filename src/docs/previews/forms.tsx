import { Bold, Italic, List, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useForm } from '@tanstack/react-form'

import { Autocomplete } from '~/components/ui/autocomplete'
import { Calendar } from '~/components/ui/calendar'
import { Checkbox } from '~/components/ui/checkbox'
import { ColorPicker } from '~/components/ui/color-picker'
import { Combobox } from '~/components/ui/combobox'
import { CurrencyInput } from '~/components/ui/currency-input'
import { DatePicker } from '~/components/ui/date-picker'
import { Editable } from '~/components/ui/editable'
import { FileUpload } from '~/components/ui/file-upload'
import { FloatingLabelInput } from '~/components/ui/floating-label-input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input-group'
import { NumberInput } from '~/components/ui/number-input'
import { OtpInput } from '~/components/ui/otp-input'
import { PasswordStrengthInput } from '~/components/ui/password-input'
import { PhoneInput } from '~/components/ui/phone-input'
import { RadioGroup } from '~/components/ui/radio-group'
import { RangeSlider } from '~/components/ui/range-slider'
import { Rating } from '~/components/ui/rating'
import { SearchInput } from '~/components/ui/search-input'
import { SegmentedControl } from '~/components/ui/segmented-control'
import { Select } from '~/components/ui/select'
import { Slider } from '~/components/ui/slider'
import { TagInput } from '~/components/ui/tag-input'
import { TimePicker } from '~/components/ui/time-picker'
import { Toggle } from '~/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'
import { Form, FormInput } from '~/components/reusable/form'
import { FormDatePicker } from '~/components/reusable/form-date-picker'

import styles from '../docs.module.scss'

const plans = [
  { value: 'starter', label: 'Starter', description: 'One project.' },
  { value: 'pro', label: 'Pro', description: 'Unlimited projects.' },
]

const roles = [
  { value: 'owner', label: 'Owner' },
  { value: 'editor', label: 'Editor' },
]

const workspaces = [
  { value: 'vorzela', label: 'Vorzela', description: 'Design system' },
  { value: 'northwind', label: 'Northwind', description: 'Commerce' },
]

function RadioPreview() {
  const [value, setValue] = useState('pro')
  return <RadioGroup label="Plan" options={plans} value={value} onChange={setValue} />
}

function SliderPreview() {
  const [value, setValue] = useState(62)
  return <Slider label="Radius scale" value={value} onChange={setValue} />
}

function SegmentedPreview() {
  const [value, setValue] = useState('comfortable')
  return (
    <SegmentedControl
      label="Density"
      options={[
        { value: 'compact', label: 'Compact' },
        { value: 'comfortable', label: 'Comfortable' },
      ]}
      value={value}
      onChange={setValue}
    />
  )
}

function AutocompletePreview() {
  const [query, setQuery] = useState('Re')
  const items = ['React', 'Vue', 'Svelte', 'Solid'].filter((item) =>
    item.toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <Autocomplete
      query={query}
      onQueryChange={setQuery}
      items={items}
      onSelect={(item) => setQuery(item)}
      itemLabel={(item) => item}
      itemValue={(item) => item}
      label="Framework"
      placeholder="Search frameworks…"
      renderItem={(item) => (
        <span className={styles.autoItem}>
          <Sparkles aria-hidden size={14} />
          {item}
        </span>
      )}
    />
  )
}

function PasswordPreview() {
  const [value, setValue] = useState('correct-horse-battery')
  return (
    <PasswordStrengthInput
      label="Password"
      value={value}
      onChange={setValue}
      hint="At least 12 characters."
    />
  )
}

function PhonePreview() {
  const [value, setValue] = useState('+254712345678')
  return <PhoneInput label="Phone" value={value} onChange={setValue} />
}

function RatingPreview() {
  const [value, setValue] = useState(4.5)
  return <Rating value={value} onChange={setValue} step={0.5} showValue />
}

function CalendarPreview() {
  const [value, setValue] = useState('2026-11-20')
  return <Calendar value={value} onSelect={setValue} />
}

function DatePickerPreview() {
  const [value, setValue] = useState('2026-11-20')
  return <DatePicker label="Renewal date" value={value} onChange={setValue} />
}

function RangePreview() {
  const [value, setValue] = useState<[number, number]>([20, 80])
  return <RangeSlider label="Price range" value={value} onChange={setValue} max={200} />
}

function TimePreview() {
  const [value, setValue] = useState('10:30')
  return <TimePicker label="Start time" value={value} onChange={setValue} />
}

function ColorPreview() {
  const [value, setValue] = useState('#0a84ff')
  return <ColorPicker label="Accent" value={value} onChange={setValue} />
}

function EditablePreview() {
  const [value, setValue] = useState('Vorzela UI')
  return <Editable label="Workspace name" value={value} onSave={setValue} />
}

function FormPreview() {
  const form = useForm({
    defaultValues: { email: '' },
    onSubmit: async () => {},
  })

  return (
    <Form form={form} onSubmit={form.handleSubmit} className={styles.demoStack}>
      <FormInput form={form} name="email" label="Email" type="email" />
    </Form>
  )
}

function FormDatePickerPreview() {
  const form = useForm({
    defaultValues: { date: '2026-11-20' },
    onSubmit: async () => {},
  })

  return <FormDatePicker form={form} name="date" label="Start date" />
}

export const formsPreviews = {
  'checkbox': (
    <div className={styles.demoStack}>
      <Checkbox label="Email me updates" defaultChecked />
      <Checkbox label="Include beta features" hint="New components first." />
    </div>
  ),
  'radio-group': <RadioPreview />,
  'slider': <SliderPreview />,
  'number-input': <NumberInput label="Seats" defaultValue={12} min={1} max={50} suffix="seats" />,
  'otp-input': <OtpInput label="Verification code" length={6} />,
  'tag-input': (
    <TagInput label="Labels" defaultValue={['design', 'react']} maxTags={8} />
  ),
  'segmented-control': <SegmentedPreview />,
  'toggle': (
    <div className="vz-demo-row">
      <Toggle aria-label="Bold" defaultPressed>
        <Bold aria-hidden size={16} />
      </Toggle>
      <Toggle aria-label="Italic">
        <Italic aria-hidden size={16} />
      </Toggle>
      <Toggle aria-label="Bulleted list">
        <List aria-hidden size={16} />
      </Toggle>
    </div>
  ),
  'toggle-group': (
    <ToggleGroup type="single" defaultValue="left" aria-label="Text alignment">
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="center">Center</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>
  ),
  'select': <Select label="Role" options={roles} defaultValue="editor" searchable />,
  'combobox': (
    <Combobox
      label="Workspace"
      options={workspaces}
      defaultValue="vorzela"
      searchPlaceholder="Find a workspace…"
    />
  ),
  'autocomplete': <AutocompletePreview />,
  'password-input': <PasswordPreview />,
  'phone-input': <PhonePreview />,
  'file-upload': (
    <FileUpload
      label="Attach evidence"
      hint="PNG, JPG or PDF up to 10 MB."
      accept={['image/png', 'image/jpeg', '.pdf']}
      maxFiles={3}
    />
  ),
  'currency-input': (
    <CurrencyInput label="Monthly budget" defaultValue={2400} currency="USD" />
  ),
  'search-input': (
    <SearchInput
      label="Search projects"
      placeholder="Search…"
      initialHistory={['accessibility', 'data table', 'charts']}
    />
  ),
  'rating': <RatingPreview />,
  'input-group': (
    <InputGroup>
      <InputGroupAddon>https://</InputGroupAddon>
      <InputGroupInput placeholder="vorzela.com" aria-label="Domain" />
      <InputGroupAddon align="end">.app</InputGroupAddon>
    </InputGroup>
  ),
  'floating-label-input': (
    <FloatingLabelInput label="Project name" defaultValue="Vorzela UI" />
  ),
  'calendar': <CalendarPreview />,
  'date-picker': <DatePickerPreview />,
  'form': <FormPreview />,
  'form-date-picker': <FormDatePickerPreview />,
  'range-slider': <RangePreview />,
  'time-picker': <TimePreview />,
  'color-picker': <ColorPreview />,
  'editable': <EditablePreview />,
}
