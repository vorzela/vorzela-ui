import { useState } from 'react'
import {
  ArrowRight,
  Bell,
  FileText,
  Home,
  Search,
  Settings,
  Sparkles,
  Terminal,
  User,
} from 'lucide-react'

import { Accordion } from '~/components/ui/accordion'
import { Badge } from '~/components/ui/badge'
import { Breadcrumb } from '~/components/ui/breadcrumb'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command'
import { CopyButton } from '~/components/ui/copy-button'
import { Grid, Inline, Stack } from '~/components/ui/layout'
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/components/ui/pagination'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '~/components/ui/resizable'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Stepper } from '~/components/ui/stepper'
import { TabBar } from '~/components/ui/tab-bar'
import { VirtualList } from '~/components/ui/virtual-list'
import { Section } from '../showcase'
import styles from '../docs.module.scss'

const sections = [
  {
    id: 'install',
    title: 'Installation',
    content: 'Copy the component and its module into your source tree. No package build step is required.',
  },
  {
    id: 'theme',
    title: 'Theming',
    content: 'Override the semantic CSS variables after the kit stylesheet. Both themes read the same names.',
  },
  {
    id: 'motion',
    title: 'Motion',
    content: 'Non-essential animation is disabled under prefers-reduced-motion. The global guard handles the rest.',
  },
]

const steps = [
  { id: 'account', label: 'Account', description: 'Email and password' },
  { id: 'workspace', label: 'Workspace', description: 'Name and region' },
  { id: 'invite', label: 'Invite', description: 'Optional teammates' },
  { id: 'review', label: 'Review', description: 'Confirm and create' },
]

const rows = Array.from({ length: 500 }, (_, index) => ({
  id: index,
  name: `Record ${String(index + 1).padStart(3, '0')}`,
  owner: ['Ada', 'Grace', 'Alan', 'Katherine'][index % 4],
}))

export function NavigationPage() {
  const [step, setStep] = useState(1)
  const [tab, setTab] = useState('home')

  return (
    <>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>Navigation</span>
        <h1 className={styles.heroTitle}>Find the next thing.</h1>
        <p className={styles.heroLead}>
          Paths, steps, accordions, palettes and virtual lists. The patterns are
          small, but they decide whether a product feels predictable or
          exhausting.
        </p>
        <div className={styles.chipRow}>
          <span className={styles.chip}>Keyboard first</span>
          <span className={styles.chip}>Roving tabindex</span>
          <span className={styles.chip}>Virtualized lists</span>
        </div>
      </header>

      <Section title="Wayfinding" lead="Breadcrumbs show where you are; a stepper shows how far is left. Neither should be the only way to navigate.">
        <div className={styles.demoStack}>
          <Breadcrumb
            items={[
              { label: 'Home', href: '#/overview' },
              { label: 'Components', href: '#/components' },
              { label: 'Navigation', current: true },
            ]}
          />
          <Stepper steps={steps} current={step} onStepChange={setStep} />
          <div className="vz-demo-row">
            <Button size="sm" variant="outline" onClick={() => setStep((value) => Math.max(0, value - 1))}>
              Back
            </Button>
            <Button size="sm" onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))}>
              Next step
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Disclosure" lead="Accordions keep long help content out of the first read. Single mode for FAQs, multiple for settings.">
        <div className={styles.demoGrid}>
          <Accordion items={sections} type="single" defaultValue="install" />
          <Accordion items={sections} type="multiple" defaultValue={['install', 'theme']} />
        </div>
      </Section>

      <Section title="Command palette" lead="Type to filter, arrow keys to move, Enter to select. The item text is the default search value.">
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
      </Section>

      <Section title="Pagination" lead="Use page numbers for known result sets. For infinite content, use a load-more button instead.">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>12</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <div className="vz-demo-row">
          <CopyButton value="npm install @tanstack/react-table" />
          <Badge variant="soft">Clipboard feedback</Badge>
        </div>
      </Section>

      <Section title="Menu header" lead="A navigation menu opens on hover or click, supports arrows and Escape, and closes on outside press.">
        <NavigationMenu aria-label="Product">
          <NavigationMenuList>
            <NavigationMenuItem value="product">
              <NavigationMenuTrigger>Product</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="#/components">
                  Components <ArrowRight aria-hidden size={13} />
                </NavigationMenuLink>
                <NavigationMenuLink href="#/charts">
                  Charts <ArrowRight aria-hidden size={13} />
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem value="resources">
              <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="#/foundations">Foundations</NavigationMenuLink>
                <NavigationMenuLink href="#/accessibility">Accessibility</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </Section>

      <Section title="Panels and long lists" lead="Resizable splits two panes; ScrollArea adds a themed scrollbar; VirtualList renders 500 rows without 500 DOM nodes.">
        <div className={styles.demoGrid}>
          <ResizablePanelGroup style={{ height: '11rem' }}>
            <ResizablePanel defaultSize={45} minSize={25}>
              <div className={styles.pane}>Sidebar</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={55} minSize={25}>
              <div className={styles.pane}>Content</div>
            </ResizablePanel>
          </ResizablePanelGroup>
          <ScrollArea maxHeight="11rem" aria-label="Release notes">
            <div className={styles.demoStack}>
              {Array.from({ length: 12 }, (_, index) => (
                <p key={index} className={styles.cardText}>
                  <strong>v0.{12 - index}</strong> — tighter focus rings, faster tables and a calmer dark palette.
                </p>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Card flat padded>
          <VirtualList
            items={rows}
            itemHeight={36}
            height={220}
            getKey={(item) => item.id}
            label="Virtualized records"
            renderItem={(item) => (
              <div className={styles.virtualRow}>
                <span>{item.name}</span>
                <span className={styles.cardText}>{item.owner}</span>
              </div>
            )}
          />
        </Card>
      </Section>

      <Section
        title="Layout primitives"
        lead="Stack, Inline and Grid share the token spacing scale. Use them to keep page rhythm consistent without one-off margins."
      >
        <Stack gap={4}>
          <Inline gap={2}>
            <Badge variant="soft">Stack</Badge>
            <Badge variant="outline">Inline</Badge>
            <Badge variant="outline">Grid</Badge>
          </Inline>
          <Grid min="9rem" gap={3}>
            {['Tokens', 'Surfaces', 'Motion'].map((label) => (
              <Card key={label} flat padded>
                <p className={styles.cardTitle}>{label}</p>
                <p className={styles.cardText}>One row, three columns, no custom CSS.</p>
              </Card>
            ))}
          </Grid>
        </Stack>
      </Section>

      <Section
        title="Menubar"
        lead="A horizontal application menu. Each menu reuses the viewport-aware dropdown, so it flips near edges."
      >
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
            {
              label: 'View',
              items: [
                { key: 'compact', label: 'Compact' },
                { key: 'comfortable', label: 'Comfortable' },
              ],
            },
          ]}
        />
      </Section>

      <Section
        title="Bottom tab bar"
        lead="A compact Material-style bottom bar with a glass surface, one tab stop and roving arrow-key focus. Pin it with position 'fixed' on small screens."
      >
        <div className={styles.demoStack}>
          <TabBar
            items={[
              { value: 'home', label: 'Home', icon: <Home aria-hidden /> },
              { value: 'search', label: 'Search', icon: <Search aria-hidden /> },
              { value: 'alerts', label: 'Alerts', icon: <Bell aria-hidden />, badge: '3' },
              { value: 'profile', label: 'Profile', icon: <User aria-hidden /> },
            ]}
            value={tab}
            onChange={setTab}
            label="App sections"
          />
          <p className={styles.cardText}>Active section: {tab}</p>
        </div>
      </Section>
    </>
  )
}
