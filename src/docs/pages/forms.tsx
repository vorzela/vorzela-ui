import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  List,
  Mail,
  Search,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { ColorPicker } from '~/components/ui/color-picker'
import { Combobox } from '~/components/ui/combobox'
import { Autocomplete } from '~/components/ui/autocomplete'
import { CurrencyInput } from '~/components/ui/currency-input'
import { DatePicker } from '~/components/ui/date-picker'
import { Editable } from '~/components/ui/editable'
import { FileUpload } from '~/components/ui/file-upload'
import { FloatingLabelInput } from '~/components/ui/floating-label-input'
import { Input } from '~/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input-group'
import { NumberInput } from '~/components/ui/number-input'
import { OtpInput } from '~/components/ui/otp-input'
import { PasswordStrengthInput } from '~/components/ui/password-input'
import { PhoneInput } from '~/components/ui/phone-input'
import { RadioGroup } from '~/components/ui/radio-group'
import { RangeSlider } from '~/components/ui/range-slider'
import { Rating } from '~/components/ui/rating'
import { SegmentedControl } from '~/components/ui/segmented-control'
import { SearchInput } from '~/components/ui/search-input'
import { Select } from '~/components/ui/select'
import { Slider } from '~/components/ui/slider'
import { Switch } from '~/components/ui/switch'
import { TagInput } from '~/components/ui/tag-input'
import { Textarea } from '~/components/ui/textarea'
import { TimePicker } from '~/components/ui/time-picker'
import { Toggle } from '~/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'
import { Demo, Section } from '../showcase'
import styles from '../docs.module.scss'

const plans = [
  { value: 'starter', label: 'Starter', description: 'One project, community support.' },
  { value: 'pro', label: 'Pro', description: 'Unlimited projects and priority support.' },
  { value: 'team', label: 'Team', description: 'Shared workspaces and audit logs.' },
]

const roles = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
]

const workspaces = [
  { value: 'vorzela', label: 'Vorzela', description: 'Design system' },
  { value: 'northwind', label: 'Northwind', description: 'Commerce' },
  { value: 'globex', label: 'Globex', description: 'Internal tools' },
]

export function FormsPage() {
  const [plan, setPlan] = useState('pro')
  const [radius, setRadius] = useState(62)
  const [tags, setTags] = useState(['design', 'react', 'scss'])
  const [view, setView] = useState('comfortable')
  const [align, setAlign] = useState<string | string[]>(['left'])
  const [marketing, setMarketing] = useState(true)
  const [updates, setUpdates] = useState(false)
  const [role, setRole] = useState('editor')
  const [workspace, setWorkspace] = useState('vorzela')
  const [password, setPassword] = useState('correct-horse-battery')
  const [phone, setPhone] = useState('+254712345678')
  const [rating, setRating] = useState(4.5)
  const [date, setDate] = useState('2026-11-20')
  const [budget, setBudget] = useState(2400)
  const [search, setSearch] = useState('')
  const [framework, setFramework] = useState('React')
  const [frameworkQuery, setFrameworkQuery] = useState('')
  const [range, setRange] = useState<[number, number]>([20, 80])
  const [time, setTime] = useState('10:30')
  const [color, setColor] = useState('#0a84ff')
  const [editable, setEditable] = useState('Vorzela UI')

  return (
    <>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>Forms</span>
        <h1 className={styles.heroTitle}>Inputs that stay out of the way.</h1>
        <p className={styles.heroLead}>
          Text fields, selection, numeric controls and specialised inputs share
          one focus treatment, one error pattern and one radius scale. Labels are
          always visible; placeholders are never the label.
        </p>
        <div className={styles.chipRow}>
          <span className={styles.chip}>Controlled or uncontrolled</span>
          <span className={styles.chip}>Native semantics</span>
          <span className={styles.chip}>Keyboard complete</span>
        </div>
      </header>

      <Section title="Text fields" lead="Validation appears after blur or submit. The shell draws focus; the native control keeps its caret and autofill.">
        <Demo title="Inputs" note="Three sizes">
          <div className={styles.demoGrid}>
            <Input label="Email" placeholder="you@example.com" leading={<Mail aria-hidden />} />
            <Input label="Search" placeholder="Search components" leading={<Search aria-hidden />} size="sm" />
            <Input label="Workspace" defaultValue="vorzela" error="That workspace name is already taken." />
            <Input
              label="Outlined"
              placeholder="Outlined input"
              appearance="outlined"
              leading={<Search aria-hidden />}
            />
            <Input
              label="Filled"
              placeholder="Filled input"
              appearance="filled"
              leading={<Mail aria-hidden />}
            />
            <Input label="Password" type="password" defaultValue="correct horse battery" success="Strong password" />
          </div>
        </Demo>
        <Demo title="Textarea" note="Live counter">
          <div className={styles.demoFieldFull}>
            <Textarea
              label="Message"
              placeholder="Tell us what you are building…"
              hint="Markdown is supported."
              maxLength={240}
              showCount
            />
          </div>
        </Demo>
      </Section>

      <Section title="Selection" lead="Checkboxes for independent choices, radios for one of a few, switches for settings that apply immediately.">
        <div className={styles.demoGrid}>
          <div className={styles.card}>
            <Checkbox label="Email me product updates" defaultChecked={false} onChange={() => {}} />
            <Checkbox label="Include beta features" hint="New components before they ship." />
            <Checkbox label="Disabled option" disabled indeterminate />
          </div>
          <div className={styles.card}>
            <RadioGroup label="Plan" options={plans} value={plan} onChange={setPlan} />
          </div>
        </div>

        <Demo title="Switches" note="Immediate settings">
          <div className={styles.demoStack}>
            <Switch
              label="Marketing email"
              description="A short monthly note. Unsubscribe any time."
              checked={marketing}
              onCheckedChange={setMarketing}
            />
            <Switch
              label="Beta features"
              description="Opt into pre-release components."
              checked={updates}
              onCheckedChange={setUpdates}
              reverse
            />
          </div>
        </Demo>

        <Demo title="Segmented and toggles" note="Compact choices">
          <div className={styles.demoStack}>
            <SegmentedControl
              label="Table density"
              options={[
                { value: 'compact', label: 'Compact' },
                { value: 'comfortable', label: 'Comfortable' },
                { value: 'minimal', label: 'Minimal' },
              ]}
              value={view}
              onChange={setView}
            />
            <ToggleGroup type="single" value={align} onValueChange={setAlign} aria-label="Text alignment">
              <ToggleGroupItem value="left" aria-label="Align left">
                <AlignLeft aria-hidden size={16} />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Align center">
                <AlignCenter aria-hidden size={16} />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Align right">
                <AlignRight aria-hidden size={16} />
              </ToggleGroupItem>
            </ToggleGroup>
            <div className="vz-demo-row">
              <Toggle aria-label="Bold">
                <Bold aria-hidden size={16} />
              </Toggle>
              <Toggle aria-label="Italic">
                <Italic aria-hidden size={16} />
              </Toggle>
              <Toggle aria-label="Bulleted list">
                <List aria-hidden size={16} />
              </Toggle>
            </div>
          </div>
        </Demo>
      </Section>

      <Section title="Numbers and codes" lead="Steppers keep precision; sliders show the value live; OTP fields distribute a paste.">
        <div className={styles.demoGrid}>
          <NumberInput label="Seats" defaultValue={12} min={1} max={50} suffix="seats" />
          <NumberInput label="Budget" defaultValue={2400} step={100} precision={0} suffix="USD" />
          <Slider label="Radius scale" value={radius} onChange={setRadius} min={0} max={100} />
          <OtpInput label="Verification code" length={6} />
        </div>
        <Demo title="Tags" note="Enter or comma to add">
          <TagInput label="Labels" value={tags} onChange={setTags} maxTags={8} />
        </Demo>
      </Section>

      <Section title="Advanced fields" lead="Searchable selects, composed fields and validation feedback for the harder inputs.">
        <div className={styles.demoGrid}>
          <Select
            label="Role"
            options={roles}
            value={role}
            onChange={setRole}
            searchable
          />
          <Select
            label="Role (outlined)"
            options={roles}
            defaultValue="editor"
            appearance="outlined"
            searchable
          />
          <Select
            label="Role (filled)"
            options={roles}
            defaultValue="admin"
            appearance="filled"
            searchable
          />
          <Combobox
            label="Workspace"
            options={workspaces}
            value={workspace}
            onChange={setWorkspace}
            searchPlaceholder="Find a workspace…"
          />
          <Autocomplete
            query={frameworkQuery}
            onQueryChange={setFrameworkQuery}
            items={['React', 'Vue', 'Svelte', 'Solid', 'Angular', 'Preact'].filter((item) =>
              item.toLowerCase().includes(frameworkQuery.toLowerCase()),
            )}
            onSelect={(item) => {
              setFramework(item)
              setFrameworkQuery(item)
            }}
            itemLabel={(item) => item}
            itemValue={(item) => item}
            label="Framework"
            placeholder="Search frameworks…"
            hint="Arrow keys move, Enter selects."
            renderItem={(item) => (
              <span className={styles.autoItem}>
                <Sparkles aria-hidden size={14} />
                {item}
              </span>
            )}
          />
          <PasswordStrengthInput
            label="Password"
            value={password}
            onChange={setPassword}
            hint="At least 12 characters."
          />
          <PhoneInput
            label="Phone"
            value={phone}
            onChange={setPhone}
            hint="Used for security alerts only."
          />
          <DatePicker label="Renewal date" value={date} onChange={setDate} />
          <div>
            <p className={styles.cardText}>Satisfaction (half stars)</p>
            <Rating value={rating} onChange={setRating} step={0.5} showValue />
          </div>
        </div>
        <p className={styles.cardText}>Selected framework: {framework}</p>

        <div className={styles.demoGrid}>
          <FloatingLabelInput
            label="Project name"
            defaultValue="Vorzela UI"
            hint="Shown in the sidebar and invites."
          />
          <InputGroup>
            <InputGroupAddon>https://</InputGroupAddon>
            <InputGroupInput placeholder="vorzela.com" aria-label="Domain" />
            <InputGroupAddon align="end">.app</InputGroupAddon>
          </InputGroup>
        </div>

        <FileUpload
          label="Attach evidence"
          hint="PNG, JPG or PDF up to 10 MB."
          accept={['image/png', 'image/jpeg', '.pdf']}
          maxFiles={3}
        />
      </Section>

      <Section
        title="Search history and currency"
        lead="SearchInput stores recent queries and reveals them on focus. CurrencyInput formats on blur and edits as a plain decimal while focused."
      >
        <div className={styles.demoGrid}>
          <SearchInput
            label="Search projects"
            placeholder="Try “tokens” or “charts”…"
            value={search}
            onChange={setSearch}
            historyKey="vz.docs.search"
            initialHistory={['accessibility', 'data table', 'charts', 'focus ring']}
            onSearch={() => {}}
          />
          <CurrencyInput
            label="Monthly budget"
            value={budget}
            onChange={setBudget}
            currency="USD"
            hint="Formatted with Intl.NumberFormat."
          />
        </div>
      </Section>

      <Section
        title="Intervals, time and colour"
        lead="Dual-thumb ranges, native time input, colour swatches and click-to-edit text."
      >
        <div className={styles.demoGrid}>
          <RangeSlider label="Price range" value={range} onChange={setRange} min={0} max={200} />
          <TimePicker label="Start time" value={time} onChange={setTime} hint="24-hour clock." />
          <ColorPicker label="Accent" value={color} onChange={setColor} />
          <Editable
            label="Workspace name"
            value={editable}
            onSave={setEditable}
            placeholder="Click to rename"
          />
        </div>
      </Section>

      <Section title="Form anatomy" lead="A predictable order keeps long forms scannable.">
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>1 · Label</h3>
            <p className={styles.cardText}>Short, visible and linked. Mark required only when it blocks submission.</p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>2 · Control</h3>
            <p className={styles.cardText}>One input, one job. Use the right `type` and `inputMode` for the keyboard.</p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>3 · Guidance</h3>
            <p className={styles.cardText}>Hints before submission, specific errors after. Never both at once.</p>
          </div>
        </div>
        <div className="vz-demo-row">
          <Button>Create project</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </Section>
    </>
  )
}
