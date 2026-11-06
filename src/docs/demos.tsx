import {
  ArrowRight,
  Bell,
  Check,
  Download,
  Mail,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  User,
} from 'lucide-react'
import { useState } from 'react'

import {
  Alert,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Kbd,
  Label,
  Progress,
  Separator,
  Skeleton,
  Spinner,
  StatusDot,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  initials,
} from '~/components/ui'

import { DemoField, DemoStack } from './showcase'

export function ButtonDemo() {
  return (
    <DemoStack>
      <div className="vz-demo-row">
        <Button>Continue</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">
          <Trash2 aria-hidden />
          Delete
        </Button>
      </div>
      <div className="vz-demo-row">
        <Button size="sm">Small</Button>
        <Button>
          Medium
          <ArrowRight aria-hidden />
        </Button>
        <Button size="lg">Large</Button>
        <Button variant="outline" size="icon" aria-label="Add item">
          <Plus aria-hidden />
        </Button>
        <Button disabled>Disabled</Button>
      </div>
    </DemoStack>
  )
}

export function BadgeDemo() {
  return (
    <div className="vz-demo-row">
      <Badge>New</Badge>
      <Badge variant="secondary">Draft</Badge>
      <Badge variant="outline">v0.1.0</Badge>
      <Badge variant="soft">Beta</Badge>
      <Badge variant="success">Active</Badge>
      <Badge variant="destructive">Failed</Badge>
    </div>
  )
}

export function LabelDemo() {
  return (
    <DemoField>
      <Label htmlFor="demo-email" required hint="We only use this for receipts.">
        Email address
      </Label>
      <Input
        id="demo-email"
        type="email"
        placeholder="you@example.com"
        leading={<Mail aria-hidden />}
      />
    </DemoField>
  )
}

export function InputDemo() {
  return (
    <DemoStack>
      <DemoField>
        <Input label="Email" placeholder="you@example.com" leading={<Mail aria-hidden />} />
      </DemoField>
      <DemoField>
        <Input
          label="Password"
          type="password"
          defaultValue="correct horse battery"
          leading={<ShieldCheck aria-hidden />}
          success="Strong password"
        />
      </DemoField>
      <DemoField>
        <Input
          label="Workspace"
          defaultValue="vorzela"
          error="That workspace name is already taken."
        />
      </DemoField>
      <DemoField>
        <Input label="Search" placeholder="Search components" leading={<Search aria-hidden />} />
      </DemoField>
      <DemoField>
        <Input label="Disabled" defaultValue="Read only" disabled />
      </DemoField>
    </DemoStack>
  )
}

export function TextareaDemo() {
  return (
    <DemoStack>
      <DemoField>
        <Textarea
          label="Message"
          placeholder="Tell us what you are building…"
          hint="Markdown is supported."
          maxLength={240}
          showCount
          rows={4}
        />
      </DemoField>
      <DemoField>
        <Textarea
          label="Release notes"
          defaultValue="Fixed focus rings on Safari."
          error="Release notes must be at least 40 characters."
        />
      </DemoField>
    </DemoStack>
  )
}

export function CardDemo() {
  return (
    <div className="vz-demo-cards">
      <Card>
        <CardHeader>
          <CardTitle>Design review</CardTitle>
          <CardDescription>
            Thursday, 10:00 — 10:45. Bring the latest component library build.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="vz-demo-row">
            <Badge variant="soft">Calendar</Badge>
            <Badge variant="outline">45 min</Badge>
          </div>
        </CardContent>
        <CardFooter>
          <Button size="sm">Join call</Button>
          <Button size="sm" variant="ghost">
            Reschedule
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storage</CardTitle>
          <CardDescription>12.4 GB of 20 GB used across your workspaces.</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={62} showValue={false} />
        </CardContent>
        <CardFooter>
          <Button size="sm" variant="outline">
            Manage plan
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export function AlertDemo() {
  const [visible, setVisible] = useState(true)

  return (
    <DemoStack>
      <Alert variant="info" title="Heads up">
        Two-factor authentication will be required for all members next month.
      </Alert>
      <Alert variant="success" title="Saved">
        Your design tokens were published to the shared library.
      </Alert>
      <Alert variant="warning" title="Destructive action">
        Deleting this project also removes its deployment history.
      </Alert>
      {visible ? (
        <Alert
          variant="error"
          title="Payment failed"
          onDismiss={() => setVisible(false)}
        >
          We could not charge the card ending in 4242. Update it to restore access.
        </Alert>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setVisible(true)}>
          Show dismissed alert
        </Button>
      )}
    </DemoStack>
  )
}

export function SpinnerDemo() {
  return (
    <div className="vz-demo-row">
      <Spinner size="sm" label="Loading small" />
      <Spinner label="Loading" />
      <Spinner size="lg" label="Loading large" />
      <Spinner size="xl" label="Loading extra large" />
      <Button disabled>
        <Spinner size="sm" onPrimary label={null} />
        Saving
      </Button>
    </div>
  )
}

export function SkeletonDemo() {
  return (
    <div className="vz-skeleton-card">
      <div className="vz-skeleton-row">
        <Skeleton variant="circle" width="3rem" height="3rem" />
        <div className="vz-skeleton-lines">
          <Skeleton variant="text" width="55%" />
          <Skeleton variant="text" width="35%" />
        </div>
      </div>
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="88%" />
      <Skeleton variant="rect" width="100%" height="5rem" />
    </div>
  )
}

export function AvatarDemo() {
  const people = [
    { name: 'Ada Lovelace', presence: 'online' as const },
    { name: 'Grace Hopper', presence: 'busy' as const },
    { name: 'Alan Turing', presence: 'away' as const },
    { name: 'Katherine Johnson', presence: 'offline' as const },
  ]

  return (
    <div className="vz-demo-row">
      {people.map((person) => (
        <div key={person.name} className="vz-avatar-item">
          <Avatar size="lg" presence={person.presence}>
            <AvatarFallback>{initials(person.name)}</AvatarFallback>
          </Avatar>
          <span>{person.name}</span>
        </div>
      ))}
      <Separator orientation="vertical" />
      <Avatar size="sm" presence="online">
        <AvatarFallback>GR</AvatarFallback>
      </Avatar>
      <Avatar square presence="away">
        <AvatarFallback>VZ</AvatarFallback>
      </Avatar>
    </div>
  )
}

export function KbdDemo() {
  return (
    <div className="vz-demo-row">
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
      <span className="vz-demo-muted">to search</span>
      <Separator orientation="vertical" />
      <Kbd size="sm">Esc</Kbd>
      <Kbd size="sm">Enter</Kbd>
      <Kbd size="sm">⇧</Kbd>
    </div>
  )
}

export function SeparatorDemo() {
  return (
    <div className="vz-separator-demo">
      <div>
        <p className="vz-demo-muted">Above the rule</p>
        <Separator />
        <p className="vz-demo-muted">Below the rule</p>
      </div>
      <Separator label="or continue with" />
      <div className="vz-demo-row">
        <Button variant="outline" size="sm">
          Email
        </Button>
        <Separator orientation="vertical" />
        <Button variant="outline" size="sm">
          Passkey
        </Button>
      </div>
    </div>
  )
}

export function ProgressDemo() {
  const [value, setValue] = useState(48)

  return (
    <DemoStack>
      <Progress label="Uploading assets" value={value} />
      <Progress label="Warnings" value={82} tone="warning" />
      <Progress label="Indeterminate" />
      <div className="vz-demo-row">
        <Button size="sm" variant="outline" onClick={() => setValue((v) => Math.max(0, v - 10))}>
          −10
        </Button>
        <Button size="sm" onClick={() => setValue((v) => Math.min(100, v + 10))}>
          +10
        </Button>
        <span className="vz-demo-muted">Controlled value: {value}%</span>
      </div>
    </DemoStack>
  )
}

export function StatusDotDemo() {
  return (
    <div className="vz-demo-row">
      <span className="vz-status-item">
        <StatusDot tone="neutral" /> Idle
      </span>
      <span className="vz-status-item">
        <StatusDot tone="info" pulse /> Syncing
      </span>
      <span className="vz-status-item">
        <StatusDot tone="success" pulse /> Operational
      </span>
      <span className="vz-status-item">
        <StatusDot tone="warning" /> Degraded
      </span>
      <span className="vz-status-item">
        <StatusDot tone="danger" /> Outage
      </span>
    </div>
  )
}

export function TabsDemo() {
  return (
    <Tabs defaultValue="overview">
      <TabsList aria-label="Account settings">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="vz-demo-muted">
          Use arrow keys to move between tabs. The panel is focusable so keyboard
          users can reach long content.
        </p>
      </TabsContent>
      <TabsContent value="members">
        <div className="vz-demo-row">
          <Avatar size="sm">
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
          <span>Ada Lovelace</span>
          <Badge variant="soft">Owner</Badge>
        </div>
      </TabsContent>
      <TabsContent value="billing">
        <p className="vz-demo-muted">Pro plan · renews on 1 December.</p>
      </TabsContent>
    </Tabs>
  )
}

export function SwitchDemo() {
  const [notifications, setNotifications] = useState(true)
  const [beta, setBeta] = useState(false)

  return (
    <DemoStack>
      <Switch
        label="Product updates"
        description="A short monthly email. No spam, unsubscribe any time."
        checked={notifications}
        onCheckedChange={setNotifications}
      />
      <Switch
        label="Beta features"
        description="Get new components before they ship."
        checked={beta}
        onCheckedChange={setBeta}
        size="sm"
      />
      <Switch
        label="Disabled preference"
        description="Managed by your workspace owner."
        disabled
      />
      <Switch
        label="Reverse layout"
        description="Good for dense settings rows."
        reverse
        defaultChecked
      />
    </DemoStack>
  )
}

export function IconRowDemo() {
  return (
    <div className="vz-demo-row">
      <Badge variant="soft">
        <Bell aria-hidden />
        Alerts
      </Badge>
      <Badge variant="soft">
        <Check aria-hidden />
        Verified
      </Badge>
      <Badge variant="soft">
        <User aria-hidden />
        Profile
      </Badge>
      <Badge variant="soft">
        <Download aria-hidden />
        Export
      </Badge>
    </div>
  )
}
