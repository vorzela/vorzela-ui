import { BarChart3, Folder, Home, Plus, Settings, Users } from 'lucide-react'

import { AppShell } from '~/components/ui/app-shell'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { ButtonGroup } from '~/components/ui/button-group'
import { Card } from '~/components/ui/card'
import { FloatButton } from '~/components/ui/float-button'
import { Header } from '~/components/ui/header'
import { Container, Flex, Grid, Inline, PageSection, Split, Stack } from '~/components/ui/layout'
import { Sidebar, type SidebarNavGroup } from '~/components/ui/sidebar'
import { Topbar } from '~/components/ui/topbar'

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
      { label: 'Activity', href: '#/layout/activity', icon: <BarChart3 aria-hidden size={16} /> },
      { label: 'Settings', href: '#/layout/settings', icon: <Settings aria-hidden size={16} /> },
    ],
  },
]

function AppShellPreview() {
  return (
    <div style={{ height: '24rem', overflow: 'hidden', borderRadius: 'var(--radius-xl)' }}>
      <AppShell
        title="Dashboard"
        groups={groups}
        brand="Vorzela"
        brandMark="V"
        subtitle="Workspace"
        currentPath="#/overview"
      >
        <Stack gap={3}>
          <Inline justify="between" align="center">
            <h3 className={styles.cardTitle}>Overview</h3>
            <Button size="sm">New project</Button>
          </Inline>
          <Grid min="9rem" gap={3}>
            <Card flat padded>
              <p className={styles.cardText}>Builds</p>
              <p className={styles.statValue}>1,280</p>
            </Card>
            <Card flat padded>
              <p className={styles.cardText}>Seats</p>
              <p className={styles.statValue}>48</p>
            </Card>
          </Grid>
        </Stack>
      </AppShell>
    </div>
  )
}

export const layoutPreviews = {
  'app-shell': <AppShellPreview />,
  'header': (
    <Header
      title="Deployments"
      description="Production · eu-west-1"
      actions={<Button size="sm">New deploy</Button>}
      sticky={false}
    />
  ),
  'topbar': (
    <Topbar
      title="Deployments"
      actions={<Button size="sm" variant="outline">Actions</Button>}
    />
  ),
  'sidebar': (
    <div className={styles.layoutFrame}>
      <Sidebar
        contained
        groups={groups}
        brand="Vorzela"
        brandMark="V"
        subtitle="Workspace"
        version="0.2.0"
        currentPath="#/overview"
      />
    </div>
  ),
  'stack': (
    <Stack gap={3}>
      {['Tokens', 'Surfaces', 'Motion'].map((label) => (
        <Card key={label} flat padded>
          <p className={styles.cardTitle}>{label}</p>
          <p className={styles.cardText}>Vertical rhythm from the token scale.</p>
        </Card>
      ))}
    </Stack>
  ),
  'inline': (
    <Inline gap={2}>
      <Badge variant="soft">Inline</Badge>
      <Badge variant="outline">wraps</Badge>
      <Badge variant="outline">by default</Badge>
    </Inline>
  ),
  'flex': (
    <Flex gap={3} align="center" justify="between">
      <Inline gap={2}>
        <Badge variant="soft">Flex row</Badge>
        <Badge variant="outline">space-between</Badge>
      </Inline>
      <Button size="sm" variant="outline">Action</Button>
    </Flex>
  ),
  'grid': (
    <Grid min="9rem" gap={3}>
      {['Tokens', 'Surfaces', 'Motion'].map((label) => (
        <Card key={label} flat padded>
          <p className={styles.cardTitle}>{label}</p>
          <p className={styles.cardText}>Auto-fit columns.</p>
        </Card>
      ))}
    </Grid>
  ),
  'split': (
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
        <p className={styles.cardText}>Container-aware two-pane layout.</p>
      </Card>
    </Split>
  ),
  'container': (
    <Container size="sm">
      <Card flat padded>
        <p className={styles.cardTitle}>Centered container</p>
        <p className={styles.cardText}>Max width from the container scale.</p>
      </Card>
    </Container>
  ),
  'page-section': (
    <PageSection
      title="Members"
      description="Invite and manage access."
      actions={<Button size="sm">Invite</Button>}
    >
      <Card flat padded>
        <p className={styles.cardText}>Address, phone and renewal date.</p>
      </Card>
    </PageSection>
  ),
  'button-group': (
    <ButtonGroup aria-label="View">
      <Button variant="outline">Day</Button>
      <Button variant="outline">Week</Button>
      <Button variant="outline">Month</Button>
    </ButtonGroup>
  ),
  'float-button': (
    <div style={{ position: 'relative', height: '10rem' }}>
      <FloatButton
        contained
        position="bottom-right"
        icon={<Plus aria-hidden size={18} />}
        label="New project"
        description="Create a project from a template."
      />
    </div>
  ),
}
