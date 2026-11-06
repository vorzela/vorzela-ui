import { ArrowRight, Bell, FileText, Home, Search, Settings, Sparkles, Terminal, User } from 'lucide-react'
import { useState } from 'react'

import { Accordion } from '~/components/ui/accordion'
import { Badge } from '~/components/ui/badge'
import { Breadcrumb } from '~/components/ui/breadcrumb'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { Carousel } from '~/components/ui/carousel'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command'
import { CopyButton } from '~/components/ui/copy-button'
import { Menubar } from '~/components/ui/menubar'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '~/components/ui/navigation-menu'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '~/components/ui/resizable'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Stepper } from '~/components/ui/stepper'
import { TabBar } from '~/components/ui/tab-bar'
import { VirtualList } from '~/components/ui/virtual-list'

import styles from '../docs.module.scss'

const sections = [
  { id: 'install', title: 'Installation', content: 'Copy the component and its module into your source tree.' },
  { id: 'theme', title: 'Theming', content: 'Override the semantic CSS variables after the kit stylesheet.' },
  { id: 'motion', title: 'Motion', content: 'Non-essential animation is disabled under prefers-reduced-motion.' },
]

const steps = [
  { id: 'account', label: 'Account', description: 'Email and password' },
  { id: 'workspace', label: 'Workspace', description: 'Name and region' },
  { id: 'review', label: 'Review', description: 'Confirm and create' },
]

const rows = Array.from({ length: 100 }, (_, index) => ({
  id: index,
  name: `Record ${String(index + 1).padStart(3, '0')}`,
}))

function StepperPreview() {
  const [step, setStep] = useState(1)
  return (
    <div className={styles.demoStack}>
      <Stepper steps={steps} current={step} onStepChange={setStep} />
      <div className="vz-demo-row">
        <Button size="sm" variant="outline" onClick={() => setStep((value) => Math.max(0, value - 1))}>Back</Button>
        <Button size="sm" onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))}>Next</Button>
      </div>
    </div>
  )
}

function TabBarPreview() {
  const [value, setValue] = useState('home')
  return (
    <TabBar
      items={[
        { value: 'home', label: 'Home', icon: <Home aria-hidden /> },
        { value: 'search', label: 'Search', icon: <Search aria-hidden /> },
        { value: 'alerts', label: 'Alerts', icon: <Bell aria-hidden />, badge: '3' },
        { value: 'profile', label: 'Profile', icon: <User aria-hidden /> },
      ]}
      value={value}
      onChange={setValue}
      label="App sections"
    />
  )
}

const slides = [
  { id: 'one', content: <div className={styles.carouselPanel}>Tokens first</div> },
  { id: 'two', content: <div className={styles.carouselPanel}>One module per component</div> },
  { id: 'three', content: <div className={styles.carouselPanel}>Keyboard complete</div> },
]

export const navigationPreviews = {
  'accordion': <Accordion items={sections} type="single" defaultValue="install" />,
  'collapsible': (
    <Collapsible defaultOpen>
      <CollapsibleTrigger>Project details</CollapsibleTrigger>
      <CollapsibleContent>
        <p className={styles.cardText}>Hidden details expand with a height transition.</p>
      </CollapsibleContent>
    </Collapsible>
  ),
  'breadcrumb': (
    <Breadcrumb
      items={[
        { label: 'Home', href: '#/overview' },
        { label: 'Components', href: '#/components' },
        { label: 'Breadcrumb', current: true },
      ]}
    />
  ),
  'command': (
    <Card flat padded>
      <Command>
        <CommandInput placeholder="Search commands…" />
        <CommandList>
          <CommandEmpty>No commands found.</CommandEmpty>
          <CommandGroup heading="Navigate">
            <CommandItem value="overview home">
              <Home aria-hidden size={15} />
              Go to overview
            </CommandItem>
            <CommandItem value="components library">
              <Sparkles aria-hidden size={15} />
              Browse components
            </CommandItem>
            <CommandItem value="settings preferences">
              <Settings aria-hidden size={15} />
              Open settings
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Developer">
            <CommandItem value="terminal install">
              <Terminal aria-hidden size={15} />
              Install dependencies
            </CommandItem>
            <CommandItem value="docs api">
              <FileText aria-hidden size={15} />
              Read the API
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </Card>
  ),
  'navigation-menu': (
    <NavigationMenu aria-label="Product">
      <NavigationMenuList>
        <NavigationMenuItem value="product">
          <NavigationMenuTrigger>Product</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#/components">
              Components <ArrowRight aria-hidden size={13} />
            </NavigationMenuLink>
            <NavigationMenuLink href="#/charts">Charts</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
  'stepper': <StepperPreview />,
  'scroll-area': (
    <ScrollArea maxHeight="11rem" aria-label="Release notes">
      <div className={styles.demoStack}>
        {Array.from({ length: 12 }, (_, index) => (
          <p key={index} className={styles.cardText}>
            <strong>v0.{12 - index}</strong> — tighter focus rings and a calmer dark palette.
          </p>
        ))}
      </div>
    </ScrollArea>
  ),
  'resizable': (
    <ResizablePanelGroup style={{ height: '11rem' }}>
      <ResizablePanel defaultSize={45} minSize={25}>
        <div className={styles.pane}>Sidebar</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={55} minSize={25}>
        <div className={styles.pane}>Content</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
  'carousel': <Carousel slides={slides} label="Layout examples" />,
  'menubar': (
    <Menubar
      menus={[
        {
          label: 'File',
          items: [
            { key: 'new', label: 'New project' },
            { key: 'open', label: 'Open…' },
            { key: 'export', label: 'Export', divider: true },
          ],
        },
        {
          label: 'Edit',
          items: [
            { key: 'undo', label: 'Undo' },
            { key: 'redo', label: 'Redo' },
            { key: 'delete', label: 'Delete', danger: true, divider: true },
          ],
        },
      ]}
    />
  ),
  'virtual-list': (
    <Card flat padded>
      <VirtualList
        items={rows}
        itemHeight={36}
        height={220}
        getKey={(item) => item.id}
        label="Virtualized records"
        renderItem={(item) => <div className={styles.virtualRow}>{item.name}</div>}
      />
    </Card>
  ),
  'copy-button': (
    <div className="vz-demo-row">
      <CopyButton value="npx vorzela-ui add copy-button" />
      <Badge variant="soft">Clipboard feedback</Badge>
    </div>
  ),
  'tab-bar': <TabBarPreview />,
}
