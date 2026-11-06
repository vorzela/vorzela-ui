import { inventory } from './inventory'

const SLUG_EXCEPTIONS: Record<string, string> = {
  PasswordStrengthInput: 'password-input',
  FilePicker: 'file-upload',
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

const generic = (name: string) => `import { ${name} } from '@vorzela/react-scss'

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
    code: `import { Button } from '@vorzela/react-scss'

<Button>Continue</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline" size="sm">Small</Button>
<Button variant="destructive">Delete</Button>
<Button size="icon" aria-label="Add">+</Button>`,
    notes: ['One primary action per view.', 'Use icon size with an aria-label.'],
  },
  Input: {
    code: `import { Input } from '@vorzela/react-scss'

<Input label="Email" placeholder="you@example.com" />

<Input label="Filled" appearance="filled" />
<Input label="Outlined" appearance="outlined" />
<Input label="Error" error="That name is taken." />`,
  },
  Textarea: {
    code: `import { Textarea } from '@vorzela/react-scss'

<Textarea
  label="Message"
  hint="Markdown is supported."
  rows={4}
  maxLength={240}
  showCount
/>`,
  },
  Select: {
    code: `import { Select } from '@vorzela/react-scss'

const options = [
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
]

<Select label="Role" options={options} searchable />
<Select label="Filled" options={options} appearance="filled" />
<Select label="Outlined" options={options} appearance="outlined" />`,
  },
  Combobox: {
    code: `import { Combobox } from '@vorzela/react-scss'

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
    code: `import { Autocomplete } from '@vorzela/react-scss'

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
    code: `import { SearchInput } from '@vorzela/react-scss'

<SearchInput
  label="Search projects"
  placeholder="Search…"
  initialHistory={['charts', 'tables', 'focus ring']}
  onSearch={(query) => console.log(query)}
/>`,
  },
  Checkbox: {
    code: `import { Checkbox } from '@vorzela/react-scss'

<Checkbox label="Email me updates" defaultChecked />
<Checkbox label="Include beta features" hint="New components first." />
<Checkbox label="Disabled" disabled />`,
  },
  RadioGroup: {
    code: `import { RadioGroup } from '@vorzela/react-scss'

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
    code: `import { Switch } from '@vorzela/react-scss'

<Switch
  label="Product updates"
  description="A short monthly email."
  defaultChecked
/>`,
  },
  Slider: {
    code: `import { Slider } from '@vorzela/react-scss'

<Slider label="Radius" value={62} min={0} max={100} onChange={setValue} />`,
  },
  RangeSlider: {
    code: `import { RangeSlider } from '@vorzela/react-scss'

<RangeSlider label="Price" defaultValue={[20, 80]} min={0} max={200} />`,
  },
  NumberInput: {
    code: `import { NumberInput } from '@vorzela/react-scss'

<NumberInput label="Seats" defaultValue={12} min={1} max={50} />`,
  },
  CurrencyInput: {
    code: `import { CurrencyInput } from '@vorzela/react-scss'

<CurrencyInput label="Budget" value={2400} onChange={setBudget} currency="USD" />`,
  },
  OtpInput: {
    code: `import { OtpInput } from '@vorzela/react-scss'

<OtpInput length={6} label="Verification code" onComplete={setCode} />`,
  },
  TagInput: {
    code: `import { TagInput } from '@vorzela/react-scss'

<TagInput label="Labels" defaultValue={['design', 'react']} maxTags={8} />`,
  },
  FileUpload: {
    code: `import { FileUpload } from '@vorzela/react-scss'

<FileUpload
  label="Attach evidence"
  hint="PNG, JPG or PDF up to 10 MB."
  accept={['image/png', 'image/jpeg', '.pdf']}
  maxFiles={3}
/>`,
  },
  Rating: {
    code: `import { Rating } from '@vorzela/react-scss'

<Rating value={4.5} step={0.5} onChange={setValue} showValue />`,
  },
  Calendar: {
    code: `import { Calendar } from '@vorzela/react-scss'

<Calendar value="2026-11-20" onChange={setDate} />`,
  },
  DatePicker: {
    code: `import { DatePicker } from '@vorzela/react-scss'

<DatePicker label="Renewal date" value={date} onChange={setDate} />`,
  },
  TimePicker: {
    code: `import { TimePicker } from '@vorzela/react-scss'

<TimePicker label="Start time" value={time} onChange={setTime} />`,
  },
  ColorPicker: {
    code: `import { ColorPicker } from '@vorzela/react-scss'

<ColorPicker label="Accent" value={color} onChange={setColor} />`,
  },
  Editable: {
    code: `import { Editable } from '@vorzela/react-scss'

<Editable label="Workspace name" value={name} onSave={setName} />`,
  },
  SegmentedControl: {
    code: `import { SegmentedControl } from '@vorzela/react-scss'

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
    code: `import { Toggle } from '@vorzela/react-scss'

<Toggle aria-label="Bold" pressed={bold} onPressedChange={setBold}>B</Toggle>`,
  },
  ToggleGroup: {
    code: `import { ToggleGroup, ToggleGroupItem } from '@vorzela/react-scss'

<ToggleGroup type="single" defaultValue="left">
  <ToggleGroupItem value="left">Left</ToggleGroupItem>
  <ToggleGroupItem value="center">Center</ToggleGroupItem>
</ToggleGroup>`,
  },
  Card: {
    code: `import { Card, CardHeader, CardTitle, CardContent } from '@vorzela/react-scss'

<Card>
  <CardHeader>
    <CardTitle>Design review</CardTitle>
  </CardHeader>
  <CardContent>Thursday · 10:00</CardContent>
</Card>`,
  },
  Alert: {
    code: `import { Alert } from '@vorzela/react-scss'

<Alert variant="info" title="Heads up">
  Two-factor authentication becomes mandatory next month.
</Alert>

<Alert variant="error" title="Payment failed" onDismiss={close}>
  Update the card ending in 4242.
</Alert>`,
  },
  Tabs: {
    code: `import { Tabs, TabsList, TabsTrigger, TabsContent } from '@vorzela/react-scss'

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
    code: `import { Menubar } from '@vorzela/react-scss'

<Menubar
  menus={[
    { label: 'File', items: [{ key: 'new', label: 'New project' }] },
    { label: 'Edit', items: [{ key: 'undo', label: 'Undo' }] },
  ]}
/>`,
  },
  Menubar: {
    code: `import { Menubar } from '@vorzela/react-scss'

<Menubar
  menus={[
    { label: 'File', items: [{ key: 'new', label: 'New project' }] },
    { label: 'Edit', items: [{ key: 'undo', label: 'Undo' }] },
  ]}
/>`,
  },
  Modal: {
    code: `import { Modal } from '@vorzela/react-scss'

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
    code: `import { Drawer } from '@vorzela/react-scss'

<Drawer open={open} onClose={close} title="Details" side="right">
  <Input label="Name" />
</Drawer>`,
  },
  Dropdown: {
    code: `import { Dropdown } from '@vorzela/react-scss'

<Dropdown
  trigger={<Button variant="outline">Actions</Button>}
  items={[
    { key: 'edit', label: 'Edit' },
    { key: 'delete', label: 'Delete', danger: true, divider: true },
  ]}
/>`,
  },
  ActionMenu: {
    code: `import { ActionMenu } from '@vorzela/react-scss'

<ActionMenu
  items={[
    { key: 'edit', label: 'Edit' },
    { key: 'delete', label: 'Delete', danger: true, divider: true },
  ]}
/>`,
  },
  Popover: {
    code: `import { Popover, PopoverTrigger, PopoverContent } from '@vorzela/react-scss'

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Share</Button>
  </PopoverTrigger>
  <PopoverContent ariaLabel="Share project">…</PopoverContent>
</Popover>`,
  },
  Tooltip: {
    code: `import { Tooltip } from '@vorzela/react-scss'

<Tooltip content="Copy the current URL">
  <Button variant="outline">Copy</Button>
</Tooltip>`,
  },
  Popconfirm: {
    code: `import { Popconfirm } from '@vorzela/react-scss'

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
    code: `import { Sidebar } from '@vorzela/react-scss'

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
    code: `import { Header } from '@vorzela/react-scss'

<Header
  title="Deployments"
  description="Production · eu-west-1"
  onMenuClick={openSidebar}
  actions={<Button>New deploy</Button>}
/>`,
  },
  AppShell: {
    code: `import { AppShell } from '@vorzela/react-scss'

<AppShell title="Dashboard" groups={navGroups}>
  <Dashboard />
</AppShell>`,
  },
  TabBar: {
    code: `import { TabBar } from '@vorzela/react-scss'

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
    code: `import { Carousel } from '@vorzela/react-scss'

<Carousel
  slides={[
    { id: 'one', content: <div>Tokens first</div> },
    { id: 'two', content: <div>One module per component</div> },
  ]}
/>`,
  },
  Accordion: {
    code: `import { Accordion } from '@vorzela/react-scss'

<Accordion
  defaultValue="install"
  items={[
    { id: 'install', title: 'Installation', content: 'Copy the component.' },
    { id: 'theme', title: 'Theming', content: 'Override CSS variables.' },
  ]}
/>`,
  },
  Breadcrumb: {
    code: `import { Breadcrumb } from '@vorzela/react-scss'

<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Components', href: '/components' },
    { label: 'Breadcrumb', current: true },
  ]}
/>`,
  },
  Pagination: {
    code: `import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@vorzela/react-scss'

<Pagination>
  <PaginationContent>
    <PaginationItem><PaginationLink>1</PaginationLink></PaginationItem>
    <PaginationItem><PaginationLink>2</PaginationLink></PaginationItem>
  </PaginationContent>
</Pagination>`,
  },
  Command: {
    code: `import { Command, CommandInput, CommandList, CommandItem } from '@vorzela/react-scss'

<Command>
  <CommandInput placeholder="Search commands…" />
  <CommandList>
    <CommandItem onSelect={goHome}>Go to overview</CommandItem>
    <CommandItem onSelect={openSettings}>Open settings</CommandItem>
  </CommandList>
</Command>`,
  },
  DataTable: {
    code: `import { DataTable } from '@vorzela/react-scss'

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
    code: `import { SimpleDataTable } from '@vorzela/react-scss'

<SimpleDataTable
  data={rows}
  columns={columns}
  searchable
  initialPageSize={10}
/>`,
  },
  Receipt: {
    code: `import { Receipt } from '@vorzela/react-scss'

<Receipt
  title="Order #1042"
  items={[{ label: 'Design tokens', qty: 1, amount: 48 }]}
  subtotal={48}
  tax={3.84}
  total={51.84}
/>`,
  },
  Invoice: {
    code: `import { Invoice } from '@vorzela/react-scss'

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
    code: `import { List, ListItem } from '@vorzela/react-scss'

<List>
  <ListItem title="Design review" description="Thursday · 10:00" />
  <ListItem title="Members" description="12 seats used" href="/members" />
</List>`,
  },
  Link: {
    code: `import { Link } from '@vorzela/react-scss'

<Link href="/foundations" variant="standalone">Foundations</Link>
<Link href="https://example.com" external>External reference</Link>`,
  },
  Result: {
    code: `import { Result } from '@vorzela/react-scss'

<Result
  tone="success"
  title="Deployment complete"
  description="v0.2.0 is live in production."
  actions={<Button>View deployment</Button>}
/>`,
  },
  GlassPanel: {
    code: `import { GlassPanel } from '@vorzela/react-scss'

<GlassPanel blur="lg">
  <h3>Glass panel</h3>
  <p>Translucent surface with an opaque fallback.</p>
</GlassPanel>`,
  },
  Toast: {
    code: `import { Toaster, useToast } from '@vorzela/react-scss'

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
    code: `import { Toaster, useToast } from '@vorzela/react-scss'

<Toaster position="bottom-right">
  <App />
</Toaster>`,
  },
  NetworkLoader: {
    code: `import { NetworkLoader } from '@vorzela/react-scss'

<NetworkLoader auto position="top" showSpinner />`,
  },
  OfflineBanner: {
    code: `import { OfflineBanner } from '@vorzela/react-scss'

<OfflineBanner onRetry={reconnect} />`,
  },
  CookieConsent: {
    code: `import { CookieConsent } from '@vorzela/react-scss'

<CookieConsent
  onAccept={enableAnalytics}
  onReject={disableAnalytics}
/>`,
  },
  NotificationCenter: {
    code: `import { NotificationCenter } from '@vorzela/react-scss'

<NotificationCenter notifications={notifications} onMarkAllRead={markAllRead} />`,
  },
  MasonryGrid: {
    code: `import { MasonryGrid, MasonryTile } from '@vorzela/react-scss'

<MasonryGrid columns={3}>
  <MasonryTile title="Study 1"><img src="/one.jpg" alt="" /></MasonryTile>
  <MasonryTile title="Study 2"><img src="/two.jpg" alt="" /></MasonryTile>
</MasonryGrid>`,
  },
  AspectRatio: {
    code: `import { AspectRatio } from '@vorzela/react-scss'

<AspectRatio ratio={16 / 9}>
  <img src="/cover.jpg" alt="" />
</AspectRatio>`,
  },
  BentoGrid: {
    code: `import { BentoGrid, BentoItem } from '@vorzela/react-scss'

<BentoGrid>
  <BentoItem colSpan={2} rowSpan={2}>Featured</BentoItem>
  <BentoItem>Small tile</BentoItem>
</BentoGrid>`,
  },
  Callout: {
    code: `import { Callout } from '@vorzela/react-scss'

<Callout tone="tip" title="Copy, don't depend">
  Components are source-owned. Keep the module next to the component.
</Callout>`,
  },
  Empty: {
    code: `import { Empty } from '@vorzela/react-scss'

<Empty
  title="No projects yet"
  description="Create a project to start collecting builds."
  action={{ label: 'New project', onClick: createProject }}
/>`,
  },
  Stat: {
    code: `import { Stat, StatGroup } from '@vorzela/react-scss'

<StatGroup>
  <Stat label="Revenue" value="$76.2k" delta="12%" trend="up" />
  <Stat label="Latency" value="184ms" trend="flat" />
</StatGroup>`,
  },
  Timeline: {
    code: `import { Timeline, TimelineItem, TimelineTitle } from '@vorzela/react-scss'

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
    code: `import { TreeView } from '@vorzela/react-scss'

<TreeView
  nodes={[
    { id: 'src', label: 'src', children: [{ id: 'main', label: 'main.tsx' }] },
  ]}
  defaultExpanded={['src']}
/>`,
  },
  JsonViewer: {
    code: `import { JsonViewer } from '@vorzela/react-scss'

<JsonViewer data={{ ready: true, version: '0.2.0' }} />`,
  },
  DiffViewer: {
    code: `import { DiffViewer } from '@vorzela/react-scss'

<DiffViewer oldValue={oldCode} newValue={newCode} />`,
  },
  NumberTicker: {
    code: `import { NumberTicker } from '@vorzela/react-scss'

<NumberTicker value={2481} />`,
  },
  Marquee: {
    code: `import { Marquee } from '@vorzela/react-scss'

<Marquee speed={24}>
  <span>Northwind · Acme · Globex · Initech</span>
</Marquee>`,
  },
  VirtualList: {
    code: `import { VirtualList } from '@vorzela/react-scss'

<VirtualList
  items={records}
  itemHeight={36}
  height={320}
  getKey={(item) => item.id}
  renderItem={(item) => <div>{item.name}</div>}
/>`,
  },
  CopyButton: {
    code: `import { CopyButton } from '@vorzela/react-scss'

<CopyButton value="npm install @vorzela/react-scss" />`,
  },
  OptimizedImage: {
    code: `import { OptimizedImage } from '@vorzela/react-scss'

<OptimizedImage src="/cover.jpg" alt="Cover" width={960} height={540} priority />`,
  },
  InputGroup: {
    code: `import { InputGroup, InputGroupAddon, InputGroupInput } from '@vorzela/react-scss'

<InputGroup>
  <InputGroupAddon>https://</InputGroupAddon>
  <InputGroupInput placeholder="vorzela.com" aria-label="Domain" />
  <InputGroupAddon align="end">.app</InputGroupAddon>
</InputGroup>`,
  },
  FloatingLabelInput: {
    code: `import { FloatingLabelInput } from '@vorzela/react-scss'

<FloatingLabelInput label="Project name" defaultValue="Vorzela UI" />`,
  },
  PasswordStrengthInput: {
    code: `import { PasswordStrengthInput } from '@vorzela/react-scss'

<PasswordStrengthInput
  label="Password"
  value={password}
  onChange={setPassword}
  hint="At least 12 characters."
/>`,
  },
  Form: {
    code: `import { Form, FormInput } from '@vorzela/react-scss'

<Form form={form} onSubmit={save}>
  <FormInput form={form} name="email" label="Email" type="email" />
</Form>`,
  },
  Collapsible: {
    code: `import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@vorzela/react-scss'

<Collapsible>
  <CollapsibleTrigger>Details</CollapsibleTrigger>
  <CollapsibleContent>Hidden content</CollapsibleContent>
</Collapsible>`,
  },
  NavigationMenu: {
    code: `import {
  NavigationMenu, NavigationMenuList, NavigationMenuItem,
  NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink,
} from '@vorzela/react-scss'

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
    code: `import { Stepper } from '@vorzela/react-scss'

<Stepper
  steps={[{ id: 'account', label: 'Account' }, { id: 'review', label: 'Review' }]}
  current={0}
  onStepChange={setStep}
/>`,
  },
  Resizable: {
    code: `import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@vorzela/react-scss'

<ResizablePanelGroup>
  <ResizablePanel defaultSize={40}>Sidebar</ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel>Content</ResizablePanel>
</ResizablePanelGroup>`,
  },
  PageSection: {
    code: `import { PageSection } from '@vorzela/react-scss'

<PageSection title="Members" description="Invite and manage access.">
  <MemberList />
</PageSection>`,
  },
  LineChart: {
    code: `import { LineChart } from '@vorzela/react-scss'

<LineChart
  data={monthly}
  xKey="month"
  series={[{ key: 'revenue', label: 'Revenue' }]}
  title="Revenue"
/>`,
  },
  BarChart: {
    code: `import { BarChart } from '@vorzela/react-scss'

<BarChart
  data={channels}
  xKey="channel"
  series={[{ key: 'new', label: 'New' }]}
/>`,
  },
  DonutChart: {
    code: `import { DonutChart } from '@vorzela/react-scss'

<DonutChart data={traffic} nameKey="source" valueKey="value" />`,
  },
  Sparkline: {
    code: `import { Sparkline } from '@vorzela/react-scss'

<Sparkline data={values} valueKey="value" label="Revenue trend" />`,
  },
  Gauge: {
    code: `import { Gauge } from '@vorzela/react-scss'

<Gauge value={94} label="Uptime" />`,
  },
  ChartFrame: {
    code: `import { ChartFrame } from '@vorzela/react-scss'

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
          `Import the public API from '@vorzela/react-scss'.`,
          'Check the category page for a live example and the module name.',
        ],
    })
  }
}

export const usageDocs = docs
export const usageBySlug = new Map(docs.map((doc) => [doc.slug, doc]))
