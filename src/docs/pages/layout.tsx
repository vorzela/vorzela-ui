import {
  Activity,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronDown,
  Folder,
  Home,
  Search,
  Settings,
  Users,
} from 'lucide-react'
import { useState } from 'react'

import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { Carousel } from '~/components/ui/carousel'
import { Dropdown } from '~/components/ui/dropdown'
import { Header } from '~/components/ui/header'
import { Flex, Grid, Inline, Split, Stack } from '~/components/ui/layout'
import { NotificationCenter } from '~/components/ui/notification-center'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Sidebar, type SidebarNavGroup } from '~/components/ui/sidebar'
import { Stat } from '~/components/ui/stat'
import { TabBar } from '~/components/ui/tab-bar'
import { Section } from '../showcase'
import styles from '../docs.module.scss'

const groups: SidebarNavGroup[] = [
  {
    group: 'Workspace',
    collapsible: true,
    items: [
      { label: 'Overview', href: '#/overview', icon: <Home aria-hidden size={16} /> },
      {
        label: 'Projects',
        icon: <Folder aria-hidden size={16} />,
        children: [
          { label: 'All projects', href: '#/layout' },
          { label: 'Archived', href: '#/layout/archived' },
        ],
      },
      { label: 'Members', href: '#/layout/members', icon: <Users aria-hidden size={16} /> },
    ],
  },
  {
    group: 'Insights',
    collapsible: true,
    items: [
      { label: 'Activity', href: '#/layout/activity', icon: <Activity aria-hidden size={16} /> },
      { label: 'Reports', href: '#/layout/reports', icon: <BarChart3 aria-hidden size={16} /> },
    ],
  },
  {
    group: 'Settings',
    collapsible: true,
    defaultOpen: false,
    items: [
      { label: 'Preferences', href: '#/layout/settings', icon: <Settings aria-hidden size={16} /> },
    ],
  },
]

const notifications = [
  {
    id: '1',
    title: 'Deploy succeeded',
    description: 'v0.2.0 · production · 42s',
    time: '2 min ago',
    read: false,
    icon: <CheckCircle2 aria-hidden size={15} />,
  },
  {
    id: '2',
    title: 'Build minutes at 82%',
    description: 'Consider upgrading before month end.',
    time: '1 hour ago',
    read: false,
    icon: <BarChart3 aria-hidden size={15} />,
  },
  {
    id: '3',
    title: 'Invite accepted',
    description: 'Grace joined the workspace.',
    time: 'Yesterday',
    read: true,
    icon: <Users aria-hidden size={15} />,
  },
]

const slides = [
  {
    id: 'one',
    content: (
      <div className={styles.carouselPanel} data-tone="blue">
        <span className={styles.carouselKicker}>01 · Foundation</span>
        <h3 className={styles.carouselTitle}>Tokens first</h3>
        <p className={styles.carouselText}>
          Colour, radius, spacing and motion are variables. Retune the kit once
          and every surface follows.
        </p>
      </div>
    ),
  },
  {
    id: 'two',
    content: (
      <div className={styles.carouselPanel} data-tone="green">
        <span className={styles.carouselKicker}>02 · Ownership</span>
        <h3 className={styles.carouselTitle}>One module per component</h3>
        <p className={styles.carouselText}>
          No utility soup. Copy the component and its stylesheet, then own the
          result.
        </p>
      </div>
    ),
  },
  {
    id: 'three',
    content: (
      <div className={styles.carouselPanel} data-tone="graphite">
        <span className={styles.carouselKicker}>03 · Interaction</span>
        <h3 className={styles.carouselTitle}>Keyboard complete</h3>
        <p className={styles.carouselText}>
          Roving focus, visible rings, escape handling and reduced-motion
          fallbacks are built in.
        </p>
      </div>
    ),
  },
  {
    id: 'four',
    content: (
      <div className={styles.carouselPanel} data-tone="blue">
        <span className={styles.carouselKicker}>04 · Data</span>
        <h3 className={styles.carouselTitle}>Tables that behave</h3>
        <p className={styles.carouselText}>
          Server pagination, selection, column visibility and skeletons share
          the same density system.
        </p>
      </div>
    ),
  },
  {
    id: 'five',
    content: (
      <div className={styles.carouselPanel} data-tone="green">
        <span className={styles.carouselKicker}>05 · Charts</span>
        <h3 className={styles.carouselTitle}>Quiet data</h3>
        <p className={styles.carouselText}>
          d3 charts with one frame, one tooltip and theme-aware series colours.
        </p>
      </div>
    ),
  },
  {
    id: 'six',
    content: (
      <div className={styles.carouselPanel} data-tone="graphite">
        <span className={styles.carouselKicker}>06 · System</span>
        <h3 className={styles.carouselTitle}>Glass and depth</h3>
        <p className={styles.carouselText}>
          Translucent surfaces, restrained shadows and a single accent.
        </p>
      </div>
    ),
  },
]

export function LayoutPage() {
  const [tab, setTab] = useState('home')

  return (
    <>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>Layout</span>
        <h1 className={styles.heroTitle}>Frames, builders, real screens.</h1>
        <p className={styles.heroLead}>
          The shell components and layout primitives that hold a product
          together: header, sidebar, tab bar, stack, flex, grid, split and a
          carousel for the last piece of storytelling.
        </p>
        <div className={styles.chipRow}>
          <span className={styles.chip}>Token spacing</span>
          <span className={styles.chip}>Container-aware</span>
          <span className={styles.chip}>Responsive by default</span>
        </div>
      </header>

      <Section
        title="Header"
        lead="The page header is 3.75rem, the same height as the sidebar header. It can carry a menu trigger, title, description and trailing actions."
      >
        <div className={styles.headerFrame}>
          <Header
            title="Deployments"
            description="Production · eu-west-1"
            leading={
              <Button size="sm" variant="outline">
                Menu
              </Button>
            }
            actions={
              <Inline gap={2}>
                <Badge variant="success">Healthy</Badge>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="icon" variant="ghost" aria-label="Notifications">
                      <span className={styles.notificationButton}>
                        <Bell aria-hidden />
                        <span className={styles.notificationDot} aria-hidden />
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" align="end" ariaLabel="Notifications">
                    <div className={styles.headerPanel}>
                      <NotificationCenter
                        notifications={notifications}
                        onMarkAllRead={() => {}}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <Dropdown
                  align="right"
                  items={[
                    { key: 'profile', label: 'Profile' },
                    { key: 'settings', label: 'Settings' },
                    { key: 'signout', label: 'Sign out', danger: true, divider: true },
                  ]}
                  trigger={
                    <button type="button" className={styles.avatarTrigger}>
                      <Avatar size="sm">
                        <AvatarFallback>AL</AvatarFallback>
                      </Avatar>
                      <span className={styles.avatarName}>Ada</span>
                      <ChevronDown aria-hidden size={14} />
                      <span className="vz-sr-only">account menu</span>
                    </button>
                  }
                />
                <Button size="sm">New deploy</Button>
              </Inline>
            }
            sticky={false}
          />
        </div>
      </Section>

      <Section
        title="Sidebar"
        lead="Collapsible groups, nested items, icon rail and hover labels. This preview is rendered in-flow with `contained`."
      >
        <div className={styles.layoutFrame}>
          <Sidebar
            contained
            groups={groups}
            brand="Vorzela"
            brandMark="V"
            subtitle="Workspace"
            version="0.2.0"
            currentPath="#/layout"
          />
          <div className={styles.layoutPreview}>
            <Inline justify="between" align="center">
              <div>
                <h3 className={styles.cardTitle}>Projects</h3>
                <p className={styles.cardText}>12 active · 3 archived</p>
              </div>
              <Button size="sm">New project</Button>
            </Inline>
            <Grid min="10rem" gap={3}>
              <Card flat padded>
                <p className={styles.cardText}>Builds</p>
                <p className={styles.statValue}>1,280</p>
              </Card>
              <Card flat padded>
                <p className={styles.cardText}>Seats</p>
                <p className={styles.statValue}>48</p>
              </Card>
              <Card flat padded>
                <p className={styles.cardText}>Uptime</p>
                <p className={styles.statValue}>99.98%</p>
              </Card>
            </Grid>
          </div>
        </div>
      </Section>

      <Section
        title="Tab bar"
        lead="A bottom navigation for small screens. One tab stop, roving arrow keys, glass surface and fixed mode with safe-area support."
      >
        <div className={styles.layoutBarFrame}>
          <TabBar
            items={[
              { value: 'home', label: 'Home', icon: <Home aria-hidden /> },
              { value: 'search', label: 'Search', icon: <Search aria-hidden /> },
              { value: 'activity', label: 'Activity', icon: <Activity aria-hidden />, badge: '2' },
              { value: 'settings', label: 'Settings', icon: <Settings aria-hidden /> },
            ]}
            value={tab}
            onChange={setTab}
            label="Preview sections"
          />
        </div>
      </Section>

      <Section
        title="Builders"
        lead="Stack for vertical rhythm, Inline for wrapped rows, Flex for one-off direction, Grid for responsive columns and Split for two-pane screens."
      >
        <Stack gap={4}>
          <Grid columns={3} gap={3}>
            {['Stack', 'Inline', 'Flex'].map((label) => (
              <Card key={label} flat padded>
                <p className={styles.cardTitle}>{label}</p>
                <p className={styles.cardText}>Token gap, no margin resets.</p>
              </Card>
            ))}
          </Grid>

          <Flex gap={3} align="center" justify="between">
            <Inline gap={2}>
              <Badge variant="soft">Flex row</Badge>
              <Badge variant="outline">space-between</Badge>
            </Inline>
            <Button size="sm" variant="outline">
              Action
            </Button>
          </Flex>

          <Split
            sideWidth="12rem"
            side={
              <Card flat padded>
                <p className={styles.cardTitle}>Sidebar pane</p>
                <p className={styles.cardText}>Collapses under 38rem.</p>
              </Card>
            }
          >
            <Card flat padded>
              <p className={styles.cardTitle}>Main pane</p>
              <p className={styles.cardText}>
                A container query handles the collapse, so the same layout works
                inside a card, drawer or full page.
              </p>
            </Card>
          </Split>
        </Stack>
      </Section>

      <Section
        title="Carousel"
        lead="The /modern carousel is here: scroll-snap slides, arrows, dots, autoplay that pauses on hover/focus, and reduced-motion support."
      >
        <Carousel slides={slides} label="Layout examples" />
      </Section>

      <Section
        title="Complex dashboard"
        lead="Compose Stack, Grid and Split into a real screen. No page-specific CSS is required."
      >
        <div className={styles.dashboard}>
          <Inline justify="between" align="center">
            <div>
              <h3 className={styles.cardTitle}>Release health</h3>
              <p className={styles.cardText}>Last 30 days · all environments</p>
            </div>
            <Badge variant="success">Operational</Badge>
          </Inline>
          <Grid min="10rem" gap={3}>
            <Stat label="Deploys" value="248" delta="12%" trend="up" />
            <Stat label="Failure rate" value="0.8%" delta="0.2%" trend="down" invertTrend />
            <Stat label="p95 latency" value="184ms" delta="6ms" trend="flat" />
          </Grid>
          <Split
            sideWidth="14rem"
            side={
              <Stack gap={2}>
                <p className={styles.cardTitle}>Filters</p>
                <Badge variant="soft">Production</Badge>
                <Badge variant="outline">Last 30 days</Badge>
                <Badge variant="outline">Web</Badge>
              </Stack>
            }
          >
            <Card flat padded>
              <p className={styles.cardTitle}>Recent deploys</p>
              <Stack gap={2}>
                {['v0.2.0 · 42s', 'v0.1.9 · 38s', 'v0.1.8 · 51s'].map((item) => (
                  <Inline key={item} justify="between">
                    <span className={styles.cardText}>{item}</span>
                    <Badge variant="success">Passed</Badge>
                  </Inline>
                ))}
              </Stack>
            </Card>
          </Split>
        </div>
      </Section>
    </>
  )
}
