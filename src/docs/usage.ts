import { inventory } from './inventory'

const SLUG_EXCEPTIONS: Record<string, string> = {
  PasswordStrengthInput: 'password-input',
  FileUpload: 'file-upload',
  StatGroup: 'stat',
  Dialog: 'modal',
  Receipt: 'receipt',
  Invoice: 'invoice',
}

export function slugFor(name: string): string {
  if (SLUG_EXCEPTIONS[name]) return SLUG_EXCEPTIONS[name]
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

/**
 * Most components live in their own `components/ui/<slug>` module. These are
 * the ones that share a module or live in another layer.
 */
const MODULE_OVERRIDES: Record<string, string> = {
  Form: '~/components/reusable/form',
  FormDatePicker: '~/components/reusable/form-date-picker',
  FilePicker: '~/components/ui/file-picker',
  Code: '~/components/ui/typography',
  Highlight: '~/components/ui/typography',
  Heading: '~/components/ui/typography',
  Stack: '~/components/ui/layout',
  Inline: '~/components/ui/layout',
  Flex: '~/components/ui/layout',
  Grid: '~/components/ui/layout',
  Split: '~/components/ui/layout',
  Container: '~/components/ui/layout',
  PageSection: '~/components/ui/layout',
  LineChart: '~/charts/line-chart',
  AreaChart: '~/charts/line-chart',
  BarChart: '~/charts/bar-chart',
  DonutChart: '~/charts/donut-chart',
  ScatterChart: '~/charts/scatter-chart',
  Heatmap: '~/charts/heatmap',
  Sparkline: '~/charts/sparkline',
  Gauge: '~/charts/gauge',
  RadarChart: '~/charts/radar-chart',
  TreemapChart: '~/charts/treemap-chart',
  SankeyChart: '~/charts/sankey-chart',
  FunnelChart: '~/charts/funnel-chart',
  CandlestickChart: '~/charts/candlestick-chart',
  WaterfallChart: '~/charts/waterfall-chart',
  HistogramChart: '~/charts/histogram-chart',
  RadialBarChart: '~/charts/radial-bar-chart',
  BulletChart: '~/charts/bullet-chart',
  ChartFrame: '~/charts/chart-frame',
  Toaster: '~/components/ui/sonner',
  ErrorBoundary: '~/components/primitives/error-boundary',
  Portal: '~/components/primitives/portal',
  FocusTrap: '~/components/primitives/focus-trap',
  DismissableLayer: '~/components/primitives/dismissable-layer',
  VisuallyHidden: '~/components/primitives/visually-hidden',
  SkipLink: '~/components/primitives/skip-link',
}

const moduleFor = (name: string) =>
  MODULE_OVERRIDES[name] ?? `~/components/ui/${slugFor(name)}`

const generic = (name: string) => `import { ${name} } from '${moduleFor(name)}'

<${name} />`

export interface UsageDoc {
  slug: string
  name: string
  group: string
  description: string
  code: string
  notes: string[]
}

const OVERRIDES: Record<
  string,
  { code: string; description?: string; notes?: string[] }
> = {
  Button: {
    code: `import { Button } from '~/components/ui/button'

<Button>Continue</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline" size="sm">Small</Button>
<Button variant="destructive">Delete</Button>
<Button size="icon" aria-label="Add">+</Button>`,
    notes: ['One primary action per view.', 'Use icon size with an aria-label.'],
  },
  Input: {
    code: `import { Input } from '~/components/ui/input'

<Input label="Email" placeholder="you@example.com" />

<Input label="Filled" appearance="filled" />
<Input label="Outlined" appearance="outlined" />
<Input label="Error" error="That name is taken." />`,
  },
  Textarea: {
    code: `import { Textarea } from '~/components/ui/textarea'

<Textarea
  label="Message"
  hint="Markdown is supported."
  rows={4}
  maxLength={240}
  showCount
/>`,
  },
  Select: {
    code: `import { Select } from '~/components/ui/select'

const options = [
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
]

<Select label="Role" options={options} searchable />
<Select label="Filled" options={options} appearance="filled" />
<Select label="Outlined" options={options} appearance="outlined" />`,
  },
  Combobox: {
    code: `import { Combobox } from '~/components/ui/combobox'

<Combobox
  label="Workspace"
  options={[
    { value: 'vorzela', label: 'Vorzela', description: 'Design system' },
    { value: 'northwind', label: 'Northwind' },
  ]}
  onChange={(value) => console.log(value)}
/>`,
  },
  Autocomplete: {
    code: `import { Autocomplete } from '~/components/ui/autocomplete'

const [query, setQuery] = useState('')
const items = ['React', 'Vue', 'Svelte'].filter((item) =>
  item.toLowerCase().includes(query.toLowerCase()),
)

<Autocomplete
  query={query}
  onQueryChange={setQuery}
  items={items}
  onSelect={(item) => setQuery(item)}
  itemLabel={(item) => item}
  itemValue={(item) => item}
  label="Framework"
  placeholder="Search frameworks…"
/>`,
  },
  SearchInput: {
    code: `import { SearchInput } from '~/components/ui/search-input'

<SearchInput
  label="Search projects"
  placeholder="Search…"
  initialHistory={['charts', 'tables', 'focus ring']}
  onSearch={(query) => console.log(query)}
/>`,
  },
  Checkbox: {
    code: `import { Checkbox } from '~/components/ui/checkbox'

<Checkbox label="Email me updates" defaultChecked />
<Checkbox label="Include beta features" hint="New components first." />
<Checkbox label="Disabled" disabled />`,
  },
  RadioGroup: {
    code: `import { RadioGroup } from '~/components/ui/radio-group'

<RadioGroup
  label="Plan"
  options={[
    { value: 'starter', label: 'Starter' },
    { value: 'pro', label: 'Pro', description: 'Unlimited projects' },
  ]}
  defaultValue="pro"
/>`,
  },
  Switch: {
    code: `import { Switch } from '~/components/ui/switch'

<Switch
  label="Product updates"
  description="A short monthly email."
  defaultChecked
/>`,
  },
  Slider: {
    code: `import { Slider } from '~/components/ui/slider'

<Slider label="Radius" value={62} min={0} max={100} onChange={setValue} />`,
  },
  RangeSlider: {
    code: `import { RangeSlider } from '~/components/ui/range-slider'

<RangeSlider label="Price" defaultValue={[20, 80]} min={0} max={200} />`,
  },
  NumberInput: {
    code: `import { NumberInput } from '~/components/ui/number-input'

<NumberInput label="Seats" defaultValue={12} min={1} max={50} />`,
  },
  CurrencyInput: {
    code: `import { CurrencyInput } from '~/components/ui/currency-input'

<CurrencyInput label="Budget" value={2400} onChange={setBudget} currency="USD" />`,
  },
  OtpInput: {
    code: `import { OtpInput } from '~/components/ui/otp-input'

<OtpInput length={6} label="Verification code" onComplete={setCode} />`,
  },
  TagInput: {
    code: `import { TagInput } from '~/components/ui/tag-input'

<TagInput label="Labels" defaultValue={['design', 'react']} maxTags={8} />`,
  },
  FileUpload: {
    code: `import { FileUpload } from '~/components/ui/file-upload'

<FileUpload
  label="Attach evidence"
  hint="PNG, JPG or PDF up to 10 MB."
  accept={['image/png', 'image/jpeg', '.pdf']}
  maxFiles={3}
/>`,
  },
  FilePicker: {
    code: `import { FilePicker } from '~/components/ui/file-picker'

<FilePicker
  label="Evidence"
  variant="dropzone"
  accept={['image/png', 'image/jpeg', '.pdf']}
  maxBytes={5 * 1024 * 1024}
  maxTotalBytes={12 * 1024 * 1024}
  maxFiles={3}
/>

<FilePicker variant="button" label="Resume" accept={['.pdf']} maxFiles={1} />
<FilePicker variant="compact" label="Attachments" accept={['image/*']} />
<FilePicker variant="avatar" label="Photo" accept={['image/*']} />
<FilePicker variant="tile" label="Gallery" accept={['image/*']} maxFiles={6} />`,
    notes: [
      'Pick the style that matches the task: dropzone for documents, button for a single file, compact for settings, avatar for a profile photo, tile for images.',
      '`maxBytes`, `minBytes`, `maxTotalBytes`, `maxFiles`, `minFiles`, `accept` and image dimension guards are all enforced before `onFiles` fires.',
      'Use `onReject` to surface per-file reasons in your own toast or inline error region.',
    ],
  },
  ImageCropper: {
    code: `import { ImageCropper } from '~/components/ui/image-cropper'

<ImageCropper
  src={preview}
  fileName="avatar.png"
  aspectRatio={1}
  cropShape="round"
  outputFormat="original"
  quality={1}
  maxWidth={1024}
  maxHeight={1024}
  targetSizeBytes={300 * 1024}
  onCrop={({ file, dataUrl }) => {
    setCropped(file)
    setPreview(dataUrl)
  }}
  onCancel={() => setEditing(false)}
/>`,
    notes: [
      'The crop is rendered at the source resolution unless `maxWidth`/`maxHeight` are set.',
      '`quality={1}` and PNG/WebP keeps the pixels; `targetSizeBytes` only compresses when the encoded result exceeds the budget.',
      'Use `aspectRatio` for avatars (1), covers (16 / 9) or cards (4 / 3).',
    ],
  },
  Field: {
    code: `import { Field, FieldGroup } from '~/components/ui/field'
import { Input } from '~/components/ui/input'

<FieldGroup>
  <Field label="Workspace" htmlFor="workspace" hint="Shown in the sidebar.">
    <Input id="workspace" placeholder="Vorzela" />
  </Field>
  <Field
    label="Slug"
    htmlFor="slug"
    error="That slug is already taken."
    required
  >
    <Input id="slug" defaultValue="vorzela" />
  </Field>
</FieldGroup>`,
  },
  NativeSelect: {
    code: `import { NativeSelect } from '~/components/ui/native-select'

<NativeSelect
  label="Region"
  placeholder="Choose a region"
  options={[
    { value: 'eu-west-1', label: 'EU West (Ireland)' },
    { value: 'us-east-1', label: 'US East (Virginia)' },
    { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)' },
  ]}
/>`,
  },
  ButtonGroup: {
    code: `import { ButtonGroup } from '~/components/ui/button-group'
import { Button } from '~/components/ui/button'

<ButtonGroup aria-label="View">
  <Button variant="outline">Day</Button>
  <Button variant="outline">Week</Button>
  <Button variant="outline">Month</Button>
</ButtonGroup>`,
  },
  Anchor: {
    code: `import { Anchor } from '~/components/ui/anchor'

<Anchor
  items={[
    { id: 'install', label: 'Installation' },
    { id: 'theming', label: 'Theming' },
    { id: 'tokens', label: 'Tokens', level: 3 },
    { id: 'components', label: 'Components' },
  ]}
/>`,
    notes: [
      'Give each target heading the same `id` you pass to the anchor item.',
      'The active item follows scroll position; set `offset` to your sticky header height.',
    ],
  },
  FloatButton: {
    code: `import { FloatButton } from '~/components/ui/float-button'

<FloatButton backToTop visibleAfter={400} />
<FloatButton
  position="bottom-right"
  icon={<Plus aria-hidden />}
  label="New project"
  description="Create a project from a template."
/>`,
  },
  Watermark: {
    code: `import { Watermark } from '~/components/ui/watermark'

<Watermark content="Vorzela UI · Confidential" opacity={0.12}>
  <Card padded>Your content stays readable underneath.</Card>
</Watermark>`,
  },
  Transfer: {
    code: `import { Transfer } from '~/components/ui/transfer'

<Transfer
  dataSource={members}
  defaultTargetKeys={['ada', 'grace']}
  titles={['Members', 'Selected']}
  onChange={(keys) => setSelectedMemberIds(keys)}
/>`,
  },
  Mentions: {
    code: `import { Mentions } from '~/components/ui/mentions'

<Mentions
  label="Comment"
  suggestions={[
    { id: 'ada', label: 'Ada Lovelace', description: 'Design systems' },
    { id: 'grace', label: 'Grace Hopper', description: 'Platform' },
  ]}
  placeholder="Type @ to mention a teammate…"
/>`,
  },
  Cascader: {
    code: `import { Cascader } from '~/components/ui/cascader'

<Cascader
  label="Region"
  options={[
    {
      value: 'eu',
      label: 'Europe',
      children: [
        { value: 'ie', label: 'Ireland' },
        { value: 'de', label: 'Germany' },
      ],
    },
    {
      value: 'us',
      label: 'United States',
      children: [{ value: 'va', label: 'Virginia' }],
    },
  ]}
  onChange={(value, selected) => setRegion(value)}
/>`,
  },
  Rating: {
    code: `import { Rating } from '~/components/ui/rating'

<Rating value={4.5} step={0.5} onChange={setValue} showValue />`,
  },
  Calendar: {
    code: `import { Calendar } from '~/components/ui/calendar'

<Calendar value="2026-11-20" onChange={setDate} />`,
  },
  DatePicker: {
    code: `import { DatePicker } from '~/components/ui/date-picker'

<DatePicker label="Renewal date" value={date} onChange={setDate} />`,
  },
  TimePicker: {
    code: `import { TimePicker } from '~/components/ui/time-picker'

<TimePicker label="Start time" value={time} onChange={setTime} />`,
  },
  ColorPicker: {
    code: `import { ColorPicker } from '~/components/ui/color-picker'

<ColorPicker label="Accent" value={color} onChange={setColor} />`,
  },
  Editable: {
    code: `import { Editable } from '~/components/ui/editable'

<Editable label="Workspace name" value={name} onSave={setName} />`,
  },
  SegmentedControl: {
    code: `import { SegmentedControl } from '~/components/ui/segmented-control'

<SegmentedControl
  label="Density"
  options={[
    { value: 'compact', label: 'Compact' },
    { value: 'comfortable', label: 'Comfortable' },
  ]}
  value={value}
  onChange={setValue}
/>`,
  },
  Toggle: {
    code: `import { Toggle } from '~/components/ui/toggle'

<Toggle aria-label="Bold" pressed={bold} onPressedChange={setBold}>B</Toggle>`,
  },
  ToggleGroup: {
    code: `import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'

<ToggleGroup type="single" defaultValue="left">
  <ToggleGroupItem value="left">Left</ToggleGroupItem>
  <ToggleGroupItem value="center">Center</ToggleGroupItem>
</ToggleGroup>`,
  },
  Card: {
    code: `import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Design review</CardTitle>
  </CardHeader>
  <CardContent>Thursday · 10:00</CardContent>
</Card>`,
  },
  Alert: {
    code: `import { Alert } from '~/components/ui/alert'

<Alert variant="info" title="Heads up">
  Two-factor authentication becomes mandatory next month.
</Alert>

<Alert variant="error" title="Payment failed" onDismiss={close}>
  Update the card ending in 4242.
</Alert>`,
  },
  Tabs: {
    code: `import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'

<Tabs defaultValue="overview">
  <TabsList aria-label="Account">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="members">Members</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">…</TabsContent>
  <TabsContent value="members">…</TabsContent>
</Tabs>`,
  },
  MenuBar: {
    code: `import { Menubar } from '~/components/ui/menubar'

<Menubar
  menus={[
    { label: 'File', items: [{ key: 'new', label: 'New project' }] },
    { label: 'Edit', items: [{ key: 'undo', label: 'Undo' }] },
  ]}
/>`,
  },
  Menubar: {
    code: `import { Menubar } from '~/components/ui/menubar'

<Menubar
  menus={[
    { label: 'File', items: [{ key: 'new', label: 'New project' }] },
    { label: 'Edit', items: [{ key: 'undo', label: 'Undo' }] },
  ]}
/>`,
  },
  Modal: {
    code: `import { Modal } from '~/components/ui/modal'

<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Rename project"
  footer={<Button onClick={save}>Save</Button>}
>
  <Input label="Project name" defaultValue="Vorzela UI" />
</Modal>`,
  },
  Drawer: {
    code: `import { Drawer } from '~/components/ui/drawer'

<Drawer open={open} onClose={close} title="Details" side="right">
  <Input label="Name" />
</Drawer>`,
  },
  Dropdown: {
    code: `import { Dropdown } from '~/components/ui/dropdown'

<Dropdown
  trigger={<Button variant="outline">Actions</Button>}
  items={[
    { key: 'edit', label: 'Edit' },
    { key: 'delete', label: 'Delete', danger: true, divider: true },
  ]}
/>`,
  },
  ActionMenu: {
    code: `import { ActionMenu } from '~/components/ui/action-menu'

<ActionMenu
  items={[
    { key: 'edit', label: 'Edit' },
    { key: 'delete', label: 'Delete', danger: true, divider: true },
  ]}
/>`,
  },
  Popover: {
    code: `import { Popover, PopoverTrigger, PopoverContent } from '~/components/ui/popover'

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Share</Button>
  </PopoverTrigger>
  <PopoverContent ariaLabel="Share project">…</PopoverContent>
</Popover>`,
  },
  Tooltip: {
    code: `import { Tooltip } from '~/components/ui/tooltip'

<Tooltip content="Copy the current URL">
  <Button variant="outline">Copy</Button>
</Tooltip>`,
  },
  Popconfirm: {
    code: `import { Popconfirm } from '~/components/ui/popconfirm'

<Popconfirm
  title="Delete this project?"
  description="Deployments and history are removed."
  destructive
  onConfirm={remove}
>
  <Button variant="destructive">Delete</Button>
</Popconfirm>`,
  },
  Sidebar: {
    code: `import { Sidebar } from '~/components/ui/sidebar'

<Sidebar
  groups={[
    {
      group: 'Workspace',
      collapsible: true,
      items: [{ label: 'Overview', href: '/', icon: <Home /> }],
    },
  ]}
  currentPath={pathname}
  mobileOpen={open}
  onMobileClose={close}
/>`,
  },
  Header: {
    code: `import { Header } from '~/components/ui/header'

<Header
  title="Deployments"
  description="Production · eu-west-1"
  onMenuClick={openSidebar}
  actions={<Button>New deploy</Button>}
/>`,
  },
  AppShell: {
    code: `import { AppShell } from '~/components/ui/app-shell'

<AppShell title="Dashboard" groups={navGroups}>
  <Dashboard />
</AppShell>`,
  },
  TabBar: {
    code: `import { TabBar } from '~/components/ui/tab-bar'

<TabBar
  items={[
    { value: 'home', label: 'Home', icon: <Home /> },
    { value: 'search', label: 'Search', icon: <Search /> },
  ]}
  value={tab}
  onChange={setTab}
/>`,
  },
  Carousel: {
    code: `import { Carousel } from '~/components/ui/carousel'

<Carousel
  slides={[
    { id: 'one', content: <div>Tokens first</div> },
    { id: 'two', content: <div>One module per component</div> },
  ]}
/>`,
  },
  Accordion: {
    code: `import { Accordion } from '~/components/ui/accordion'

<Accordion
  defaultValue="install"
  items={[
    { id: 'install', title: 'Installation', content: 'Copy the component.' },
    { id: 'theme', title: 'Theming', content: 'Override CSS variables.' },
  ]}
/>`,
  },
  Breadcrumb: {
    code: `import { Breadcrumb } from '~/components/ui/breadcrumb'

<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Components', href: '/components' },
    { label: 'Breadcrumb', current: true },
  ]}
/>`,
  },
  Pagination: {
    code: `import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '~/components/ui/pagination'

<Pagination>
  <PaginationContent>
    <PaginationItem><PaginationLink>1</PaginationLink></PaginationItem>
    <PaginationItem><PaginationLink>2</PaginationLink></PaginationItem>
  </PaginationContent>
</Pagination>`,
  },
  Command: {
    code: `import { Command, CommandInput, CommandList, CommandItem } from '~/components/ui/command'

<Command>
  <CommandInput placeholder="Search commands…" />
  <CommandList>
    <CommandItem onSelect={goHome}>Go to overview</CommandItem>
    <CommandItem onSelect={openSettings}>Open settings</CommandItem>
  </CommandList>
</Command>`,
  },
  DataTable: {
    code: `import { DataTable } from '~/components/ui/data-table'

<DataTable
  data={rows}
  columns={columns}
  enableRowSelection
  columnVisibilityToggle
  manualPagination
  pageCount={pageCount}
  rowCount={rowCount}
  onPaginationChange={setPagination}
/>`,
  },
  SimpleDataTable: {
    code: `import { SimpleDataTable } from '~/components/ui/simple-data-table'

<SimpleDataTable
  data={rows}
  columns={columns}
  searchable
  initialPageSize={10}
/>`,
  },
  Receipt: {
    code: `import { Receipt } from '~/components/ui/receipt'

<Receipt
  title="Order #1042"
  items={[{ label: 'Design tokens', qty: 1, amount: 48 }]}
  subtotal={48}
  tax={3.84}
  total={51.84}
/>`,
  },
  Invoice: {
    code: `import { Invoice } from '~/components/ui/invoice'

<Invoice
  number="INV-2026-042"
  status="paid"
  issuedAt="1 Nov 2026"
  dueAt="15 Nov 2026"
  from={{ name: 'Vorzela Studio' }}
  to={{ name: 'Northwind Labs' }}
  items={[{ description: 'Design audit', quantity: 1, unitPrice: 1800 }]}
  taxRate={16}
/>`,
  },
  List: {
    code: `import { List, ListItem } from '~/components/ui/list'

<List>
  <ListItem title="Design review" description="Thursday · 10:00" />
  <ListItem title="Members" description="12 seats used" href="/members" />
</List>`,
  },
  Link: {
    code: `import { Link } from '~/components/ui/link'

<Link href="/foundations" variant="standalone">Foundations</Link>
<Link href="https://example.com" external>External reference</Link>`,
  },
  Result: {
    code: `import { Result } from '~/components/ui/result'

<Result
  tone="success"
  title="Deployment complete"
  description="v0.2.0 is live in production."
  actions={<Button>View deployment</Button>}
/>`,
  },
  GlassPanel: {
    code: `import { GlassPanel } from '~/components/ui/glass-panel'

<GlassPanel blur="lg">
  <h3>Glass panel</h3>
  <p>Translucent surface with an opaque fallback.</p>
</GlassPanel>`,
  },
  Toast: {
    code: `import { Toaster, useToast } from '~/components/ui/sonner'

function SaveButton() {
  const { toast } = useToast()
  return (
    <Button onClick={() => toast({ title: 'Saved', type: 'success' })}>
      Save
    </Button>
  )
}

<Toaster><SaveButton /></Toaster>`,
  },
  Toaster: {
    code: `import { Toaster, useToast } from '~/components/ui/sonner'

<Toaster position="bottom-right">
  <App />
</Toaster>`,
  },
  NetworkLoader: {
    code: `import { NetworkLoader } from '~/components/ui/network-loader'

<NetworkLoader auto position="top" showSpinner />`,
  },
  OfflineBanner: {
    code: `import { OfflineBanner } from '~/components/ui/offline-banner'

<OfflineBanner onRetry={reconnect} />`,
  },
  CookieConsent: {
    code: `import { CookieConsent } from '~/components/ui/cookie-consent'

<CookieConsent
  onAccept={enableAnalytics}
  onReject={disableAnalytics}
/>`,
  },
  NotificationCenter: {
    code: `import { NotificationCenter } from '~/components/ui/notification-center'

<NotificationCenter notifications={notifications} onMarkAllRead={markAllRead} />`,
  },
  MasonryGrid: {
    code: `import { MasonryGrid, MasonryTile } from '~/components/ui/masonry-grid'

<MasonryGrid columns={3}>
  <MasonryTile title="Study 1"><img src="/one.jpg" alt="" /></MasonryTile>
  <MasonryTile title="Study 2"><img src="/two.jpg" alt="" /></MasonryTile>
</MasonryGrid>`,
  },
  AspectRatio: {
    code: `import { AspectRatio } from '~/components/ui/aspect-ratio'

<AspectRatio ratio={16 / 9}>
  <img src="/cover.jpg" alt="" />
</AspectRatio>`,
  },
  BentoGrid: {
    code: `import { BentoGrid, BentoItem } from '~/components/ui/bento-grid'

<BentoGrid>
  <BentoItem colSpan={2} rowSpan={2}>Featured</BentoItem>
  <BentoItem>Small tile</BentoItem>
</BentoGrid>`,
  },
  Callout: {
    code: `import { Callout } from '~/components/ui/callout'

<Callout tone="tip" title="Copy, don't depend">
  Components are source-owned. Keep the module next to the component.
</Callout>`,
  },
  Empty: {
    code: `import { Empty } from '~/components/ui/empty'

<Empty
  title="No projects yet"
  description="Create a project to start collecting builds."
  action={{ label: 'New project', onClick: createProject }}
/>`,
  },
  Stat: {
    code: `import { Stat, StatGroup } from '~/components/ui/stat'

<StatGroup>
  <Stat label="Revenue" value="$76.2k" delta="12%" trend="up" />
  <Stat label="Latency" value="184ms" trend="flat" />
</StatGroup>`,
  },
  Timeline: {
    code: `import { Timeline, TimelineItem, TimelineTitle } from '~/components/ui/timeline'

<Timeline pulse>
  <TimelineItem status="done" date="09:41">
    <TimelineTitle>Build completed</TimelineTitle>
  </TimelineItem>
  <TimelineItem status="active" date="10:00">
    <TimelineTitle>Design review</TimelineTitle>
  </TimelineItem>
</Timeline>`,
  },
  TreeView: {
    code: `import { TreeView } from '~/components/ui/tree-view'

<TreeView
  nodes={[
    { id: 'src', label: 'src', children: [{ id: 'main', label: 'main.tsx' }] },
  ]}
  defaultExpanded={['src']}
/>`,
  },
  JsonViewer: {
    code: `import { JsonViewer } from '~/components/ui/json-viewer'

<JsonViewer data={{ ready: true, version: '0.2.0' }} />`,
  },
  DiffViewer: {
    code: `import { DiffViewer } from '~/components/ui/diff-viewer'

<DiffViewer oldValue={oldCode} newValue={newCode} />`,
  },
  NumberTicker: {
    code: `import { NumberTicker } from '~/components/ui/number-ticker'

<NumberTicker value={2481} />`,
  },
  Marquee: {
    code: `import { Marquee } from '~/components/ui/marquee'

<Marquee speed={24}>
  <span>Northwind · Acme · Globex · Initech</span>
</Marquee>`,
  },
  VirtualList: {
    code: `import { VirtualList } from '~/components/ui/virtual-list'

<VirtualList
  items={records}
  itemHeight={36}
  height={320}
  getKey={(item) => item.id}
  renderItem={(item) => <div>{item.name}</div>}
/>`,
  },
  CopyButton: {
    code: `import { CopyButton } from '~/components/ui/copy-button'

<CopyButton value="npx vorzela-ui add copy-button" />`,
  },
  OptimizedImage: {
    code: `import { OptimizedImage } from '~/components/ui/optimized-image'

<OptimizedImage src="/cover.jpg" alt="Cover" width={960} height={540} priority />`,
  },
  InputGroup: {
    code: `import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input-group'

<InputGroup>
  <InputGroupAddon>https://</InputGroupAddon>
  <InputGroupInput placeholder="vorzela.com" aria-label="Domain" />
  <InputGroupAddon align="end">.app</InputGroupAddon>
</InputGroup>`,
  },
  FloatingLabelInput: {
    code: `import { FloatingLabelInput } from '~/components/ui/floating-label-input'

<FloatingLabelInput label="Project name" defaultValue="Vorzela UI" />`,
  },
  PasswordStrengthInput: {
    code: `import { PasswordStrengthInput } from '~/components/ui/password-input'

<PasswordStrengthInput
  label="Password"
  value={password}
  onChange={setPassword}
  hint="At least 12 characters."
/>`,
  },
  Form: {
    code: `import { Form, FormInput } from '~/components/reusable/form'

<Form form={form} onSubmit={save}>
  <FormInput form={form} name="email" label="Email" type="email" />
</Form>`,
  },
  Collapsible: {
    code: `import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '~/components/ui/collapsible'

<Collapsible>
  <CollapsibleTrigger>Details</CollapsibleTrigger>
  <CollapsibleContent>Hidden content</CollapsibleContent>
</Collapsible>`,
  },
  NavigationMenu: {
    code: `import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from '~/components/ui/navigation-menu'

<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem value="product">
      <NavigationMenuTrigger>Product</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="/components">Components</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`,
  },
  Stepper: {
    code: `import { Stepper } from '~/components/ui/stepper'

<Stepper
  steps={[{ id: 'account', label: 'Account' }, { id: 'review', label: 'Review' }]}
  current={0}
  onStepChange={setStep}
/>`,
  },
  Resizable: {
    code: `import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '~/components/ui/resizable'

<ResizablePanelGroup>
  <ResizablePanel defaultSize={40}>Sidebar</ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel>Content</ResizablePanel>
</ResizablePanelGroup>`,
  },
  PageSection: {
    code: `import { PageSection } from '~/components/ui/layout'

<PageSection title="Members" description="Invite and manage access.">
  <MemberList />
</PageSection>`,
  },
  LineChart: {
    code: `import { LineChart } from '~/charts/line-chart'

<LineChart
  data={monthly}
  xKey="month"
  series={[{ key: 'revenue', label: 'Revenue' }]}
  title="Revenue"
/>`,
  },
  BarChart: {
    code: `import { BarChart } from '~/charts/bar-chart'

<BarChart
  data={channels}
  xKey="channel"
  series={[{ key: 'new', label: 'New' }]}
/>`,
  },
  DonutChart: {
    code: `import { DonutChart } from '~/charts/donut-chart'

<DonutChart data={traffic} nameKey="source" valueKey="value" />`,
  },
  Sparkline: {
    code: `import { Sparkline } from '~/charts/sparkline'

<Sparkline data={values} valueKey="value" label="Revenue trend" />`,
  },
  Gauge: {
    code: `import { Gauge } from '~/charts/gauge'

<Gauge value={94} label="Uptime" />`,
  },
  ChartFrame: {
    code: `import { ChartFrame } from '~/charts/chart-frame'

<ChartFrame title="Revenue" height={260}>
  {({ width, height }) => <YourCanvas width={width} height={height} />}
</ChartFrame>`,
  },
}

const docs: UsageDoc[] = []

for (const category of inventory) {
  for (const name of category.items) {
    const slug = slugFor(name)
    if (docs.some((doc) => doc.slug === slug)) continue
    const override = OVERRIDES[name] ?? OVERRIDES[slug]
    docs.push({
      slug,
      name,
      group: category.label,
      description:
        override?.description ??
        `${name} lives in the ${category.label} layer. Copy the source, keep its module, and adjust the copy to your product.`,
      code: override?.code ?? generic(name),
      notes:
        override?.notes ?? [
          'The component is source-owned; copy the TSX and its module.',
          'Import it from the same alias the CLI writes into `vorzela.json`.',
          'Check the category page for a live example and the module name.',
        ],
    })
  }
}

export const usageDocs = docs
export const usageBySlug = new Map(docs.map((doc) => [doc.slug, doc]))
