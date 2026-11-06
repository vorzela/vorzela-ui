import type { ReactNode } from 'react'

import {
  AlertDemo,
  AvatarDemo,
  BadgeDemo,
  ButtonDemo,
  CardDemo,
  InputDemo,
  KbdDemo,
  LabelDemo,
  ProgressDemo,
  SeparatorDemo,
  SkeletonDemo,
  SpinnerDemo,
  StatusDotDemo,
  SwitchDemo,
  TabsDemo,
  TextareaDemo,
} from './demos'
import type { PropRow } from './showcase'

export type ComponentGroup =
  | 'Actions'
  | 'Forms'
  | 'Surfaces'
  | 'Feedback'
  | 'Data display'
  | 'Navigation'

export interface ComponentDoc {
  slug: string
  name: string
  group: ComponentGroup
  description: string
  demo: ReactNode
  code: string
  props: PropRow[]
  usage: string[]
}

export const componentGroups: ComponentGroup[] = [
  'Actions',
  'Forms',
  'Surfaces',
  'Feedback',
  'Data display',
  'Navigation',
]

export const components: ComponentDoc[] = [
  {
    slug: 'button',
    name: 'Button',
    group: 'Actions',
    description:
      'One flat, solid control with six tones and four sizes. The primary tone carries the single accent; everything else stays neutral.',
    demo: <ButtonDemo />,
    code: `import { Button } from '@vorzela/react-scss'

<Button>Continue</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline" size="sm">Small</Button>
<Button variant="destructive">
  <Trash2 aria-hidden />
  Delete
</Button>
<Button disabled>Saving…</Button>`,
    props: [
      { name: 'variant', type: 'primary | secondary | outline | ghost | destructive | link', defaultValue: 'primary', description: 'Visual tone. Use one primary action per view.' },
      { name: 'size', type: 'sm | md | lg | icon', defaultValue: 'md', description: '`icon` is square and expects an accessible label.' },
      { name: 'type', type: 'button | submit | reset', defaultValue: 'button', description: 'Defaults to `button` so it never submits a form by accident.' },
      { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Dims the control and removes it from pointer interaction.' },
    ],
    usage: [
      'Lead with a single primary action; put secondary and destructive actions in outline or ghost.',
      'Use `size="icon"` only with `aria-label` — there is no visible text.',
      'Prefer a link styled by the host page for navigation; a button signals an in-page action.',
    ],
  },
  {
    slug: 'badge',
    name: 'Badge',
    group: 'Data display',
    description:
      'Compact status or metadata. Soft and outline tones stay quiet; success and destructive tones are reserved for meaningful state.',
    demo: <BadgeDemo />,
    code: `import { Badge } from '@vorzela/react-scss'

<Badge>New</Badge>
<Badge variant="secondary">Draft</Badge>
<Badge variant="soft">Beta</Badge>
<Badge variant="success">Active</Badge>`,
    props: [
      { name: 'variant', type: 'primary | secondary | outline | destructive | success | soft', defaultValue: 'primary', description: 'Tone of the badge.' },
      { name: 'size', type: 'sm | md | lg', defaultValue: 'md', description: 'Controls padding and type size.' },
    ],
    usage: [
      'Keep labels to one or two words; badges are scannable, not explanatory.',
      'Use `soft` inside dense tables and cards to avoid a wall of saturation.',
      'Pair colour with text — never rely on tone alone to communicate state.',
    ],
  },
  {
    slug: 'label',
    name: 'Label',
    group: 'Forms',
    description:
      'A form label with a required marker and an optional hint. The hint is wired for `aria-describedby` by the field that owns it.',
    demo: <LabelDemo />,
    code: `import { Input, Label } from '@vorzela/react-scss'

<Label htmlFor="email" required hint="We only use this for receipts.">
  Email address
</Label>
<Input id="email" type="email" placeholder="you@example.com" />`,
    props: [
      { name: 'htmlFor', type: 'string', description: 'Must match the control id. `Input` and `Textarea` generate one for you.' },
      { name: 'required', type: 'boolean', defaultValue: 'false', description: 'Shows a marker and announces “required”.' },
      { name: 'hint', type: 'string', description: 'Helper copy rendered under the label.' },
      { name: 'hintId', type: 'string', description: 'Override the generated id used by `aria-describedby`.' },
    ],
    usage: [
      'Always keep a visible label. Placeholders are not labels.',
      'Put format rules in `hint`, not in an error message — errors are for what went wrong.',
      'Use `required` only when the field truly blocks submission.',
    ],
  },
  {
    slug: 'input',
    name: 'Input',
    group: 'Forms',
    description:
      'A single-line field with optional leading and trailing slots, inline validation and three sizes. Focus is drawn on the shell, not the native input.',
    demo: <InputDemo />,
    code: `import { Input } from '@vorzela/react-scss'

<Input label="Email" placeholder="you@example.com" />

<Input
  label="Workspace"
  defaultValue="vorzela"
  error="That workspace name is already taken."
/>

<Input
  label="Password"
  type="password"
  success="Strong password"
  leading={<ShieldCheck aria-hidden />}
/>`,
    props: [
      { name: 'label', type: 'string', description: 'Renders a linked `Label` above the field.' },
      { name: 'hint', type: 'string', description: 'Helper text, linked with `aria-describedby`.' },
      { name: 'error', type: 'string', description: 'Marks the field invalid and renders an alert message.' },
      { name: 'success', type: 'string', description: 'Confirmation message; suppressed when `error` is set.' },
      { name: 'size', type: 'sm | md | lg', defaultValue: 'md', description: 'Control height and radius.' },
      { name: 'leading / trailing', type: 'ReactNode', description: 'Icons or short affixes inside the shell.' },
      { name: 'wrapClassName', type: 'string', description: 'Class for the outer field wrapper.' },
    ],
    usage: [
      'Use `type` and `inputMode` so mobile keyboards match the expected value.',
      'Validate on blur or submit; do not show errors while the user is still typing the first attempt.',
      'Pair `error` with a specific fix, not “Invalid input”.',
    ],
  },
  {
    slug: 'textarea',
    name: 'Textarea',
    group: 'Forms',
    description:
      'Multi-line input with resize, inline validation and an optional live character counter. The counter turns red at the limit.',
    demo: <TextareaDemo />,
    code: `import { Textarea } from '@vorzela/react-scss'

<Textarea
  label="Message"
  placeholder="Tell us what you are building…"
  hint="Markdown is supported."
  maxLength={240}
  showCount
  rows={4}
/>`,
    props: [
      { name: 'label', type: 'string', description: 'Linked label above the field.' },
      { name: 'error / success', type: 'string', description: 'Inline validation message.' },
      { name: 'showCount', type: 'boolean', defaultValue: 'false', description: 'Shows `count / maxLength` when `maxLength` is set.' },
      { name: 'rows', type: 'number', defaultValue: '4', description: 'Initial visible line count.' },
      { name: 'wrapClassName', type: 'string', description: 'Class for the outer field wrapper.' },
    ],
    usage: [
      'Keep the default resize handle; users often need more room for long text.',
      'Set `maxLength` to a real limit and show the counter before the user hits it.',
      'Prefer a textarea over a one-line input whenever the answer may exceed a few words.',
    ],
  },
  {
    slug: 'card',
    name: 'Card',
    group: 'Surfaces',
    description:
      'A layered surface with header, content and footer slots. Elevation is soft by default; `flat` and `interactive` cover quieter and clickable cards.',
    demo: <CardDemo />,
    code: `import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
} from '@vorzela/react-scss'

<Card>
  <CardHeader>
    <CardTitle>Design review</CardTitle>
    <CardDescription>Thursday, 10:00 — 10:45.</CardDescription>
  </CardHeader>
  <CardContent>Agenda and notes.</CardContent>
  <CardFooter>
    <Button size="sm">Join call</Button>
  </CardFooter>
</Card>`,
    props: [
      { name: 'flat', type: 'boolean', defaultValue: 'false', description: 'Removes the shadow for a quieter bordered surface.' },
      { name: 'interactive', type: 'boolean', defaultValue: 'false', description: 'Adds hover lift. Use only when the whole card is clickable.' },
      { name: 'padded', type: 'boolean', defaultValue: 'false', description: 'Applies shared padding for simple, sectionless cards.' },
    ],
    usage: [
      'Use cards to group related content, not as a page layout wrapper.',
      'One card, one idea. If the footer needs three primary buttons, split it.',
      'Keep the title short; move detail into the description or content.',
    ],
  },
  {
    slug: 'alert',
    name: 'Alert',
    group: 'Feedback',
    description:
      'Inline, page-level feedback in four tones. The error tone is announced as an alert; the others are polite status messages.',
    demo: <AlertDemo />,
    code: `import { Alert } from '@vorzela/react-scss'

<Alert variant="info" title="Heads up">
  Two-factor authentication becomes mandatory next month.
</Alert>

<Alert variant="error" title="Payment failed" onDismiss={() => close()}>
  Update the card ending in 4242 to restore access.
</Alert>`,
    props: [
      { name: 'variant', type: 'info | success | warning | error', defaultValue: 'info', description: 'Tone and icon.' },
      { name: 'title', type: 'ReactNode', description: 'Short, specific headline.' },
      { name: 'hideIcon', type: 'boolean', defaultValue: 'false', description: 'Removes the tone icon.' },
      { name: 'onDismiss', type: '() => void', description: 'Renders a close button; the caller owns visibility.' },
      { name: 'dismissLabel', type: 'string', defaultValue: 'Dismiss', description: 'Accessible name for the close button.' },
    ],
    usage: [
      'Place alerts near the content they affect, not in a distant toast stack.',
      'Say what happened and what to do next. Keep the title under six words.',
      'Do not use an alert for field-level errors — `Input` and `Textarea` already do that.',
    ],
  },
  {
    slug: 'spinner',
    name: 'Spinner',
    group: 'Feedback',
    description:
      'A small rotating ring for work that takes longer than a moment. Pairs with a visible label or an `aria-label`.',
    demo: <SpinnerDemo />,
    code: `import { Spinner } from '@vorzela/react-scss'

<Spinner />
<Spinner size="lg" label="Loading projects" />
<Spinner size="sm" onPrimary label={null} />`,
    props: [
      { name: 'size', type: 'sm | md | lg | xl', defaultValue: 'md', description: 'Ring size.' },
      { name: 'label', type: 'string | null', defaultValue: 'Loading', description: 'Accessible name. Pass `null` when nearby text already explains.' },
      { name: 'onPrimary', type: 'boolean', defaultValue: 'false', description: 'Inverts the ring on solid primary surfaces.' },
      { name: 'pixels', type: 'number', description: 'One-off pixel override.' },
    ],
    usage: [
      'Show a spinner only after ~300 ms; instant responses should not flash a loader.',
      'Use a skeleton when the shape of the result is known.',
      'When the spinner replaces content, reserve the space so the layout does not jump.',
    ],
  },
  {
    slug: 'skeleton',
    name: 'Skeleton',
    group: 'Feedback',
    description:
      'A layout-stable placeholder in four shapes. Skeletons match the final composition, so content does not shift on load.',
    demo: <SkeletonDemo />,
    code: `import { Skeleton } from '@vorzela/react-scss'

<Skeleton variant="circle" width="3rem" height="3rem" />
<Skeleton variant="text" width="60%" />
<Skeleton variant="rect" height="5rem" />`,
    props: [
      { name: 'variant', type: 'block | text | rect | circle', defaultValue: 'block', description: 'Shape and radius.' },
      { name: 'width', type: 'CSSProperties["width"]', description: 'Override the intrinsic width.' },
      { name: 'height', type: 'CSSProperties["height"]', description: 'Override the intrinsic height.' },
    ],
    usage: [
      'Mirror the real layout — same number of lines, same approximate widths.',
      'Announce loading in one live region; the skeleton itself is hidden from assistive tech.',
      'Do not animate forever; replace with content or an empty state.',
    ],
  },
  {
    slug: 'avatar',
    name: 'Avatar',
    group: 'Data display',
    description:
      'Circular or rounded-square identity badge with initials fallback and presence. Five sizes, four presence tones.',
    demo: <AvatarDemo />,
    code: `import { Avatar, AvatarFallback, initials } from '@vorzela/react-scss'

<Avatar size="lg" presence="online">
  <AvatarFallback>{initials('Ada Lovelace')}</AvatarFallback>
</Avatar>

<Avatar square presence="away">
  <AvatarFallback>VZ</AvatarFallback>
</Avatar>`,
    props: [
      { name: 'size', type: 'xs | sm | md | lg | xl', defaultValue: 'md', description: 'Diameter and fallback type size.' },
      { name: 'square', type: 'boolean', defaultValue: 'false', description: 'Rounded square instead of a circle.' },
      { name: 'presence', type: 'online | busy | away | offline', description: 'Adds a labelled status dot.' },
    ],
    usage: [
      'Always provide alt text on an image or initials as fallback; never leave an empty circle.',
      'Use presence dots only for live collaboration status.',
      'Keep the naming consistent — `initials()` returns up to two characters.',
    ],
  },
  {
    slug: 'kbd',
    name: 'Kbd',
    group: 'Data display',
    description:
      'A key cap for documenting shortcuts. Two sizes; wrap a sequence in a `role="group"` with an accessible label.',
    demo: <KbdDemo />,
    code: `import { Kbd } from '@vorzela/react-scss'

<span role="group" aria-label="Search shortcut">
  <Kbd>⌘</Kbd>
  <Kbd>K</Kbd>
</span>`,
    props: [
      { name: 'size', type: 'sm | md', defaultValue: 'md', description: 'Cap height and padding.' },
    ],
    usage: [
      'Use the same modifier glyphs as the platform you are describing.',
      'Always label the group; individual key caps are not self-explanatory to screen readers.',
      'Do not use a key cap as a button — it documents a shortcut, it does not trigger one.',
    ],
  },
  {
    slug: 'separator',
    name: 'Separator',
    group: 'Surfaces',
    description:
      'A one-pixel rule for horizontal or vertical grouping, with an optional centred caption.',
    demo: <SeparatorDemo />,
    code: `import { Separator } from '@vorzela/react-scss'

<Separator />
<Separator label="or continue with" />
<Separator orientation="vertical" />`,
    props: [
      { name: 'orientation', type: 'horizontal | vertical', defaultValue: 'horizontal', description: 'Axis of the rule.' },
      { name: 'label', type: 'string', description: 'Centred caption; horizontal only.' },
    ],
    usage: [
      'Use a separator when spacing alone does not make the grouping clear.',
      'Do not stack a separator directly against a border or another rule.',
      'Vertical separators inherit the height of their flex row.',
    ],
  },
  {
    slug: 'progress',
    name: 'Progress',
    group: 'Feedback',
    description:
      'Determinate and indeterminate progress with three heights and four tones. Values are clamped to 0–100.',
    demo: <ProgressDemo />,
    code: `import { Progress } from '@vorzela/react-scss'

<Progress label="Uploading assets" value={48} />
<Progress label="Warnings" value={82} tone="warning" />
<Progress label="Indeterminate" />`,
    props: [
      { name: 'value', type: 'number', description: '0–100. Omit for indeterminate.' },
      { name: 'size', type: 'sm | md | lg', defaultValue: 'md', description: 'Track height.' },
      { name: 'tone', type: 'primary | success | warning | destructive', defaultValue: 'primary', description: 'Indicator colour.' },
      { name: 'label', type: 'string', description: 'Visible label and accessible name.' },
      { name: 'showValue', type: 'boolean', defaultValue: 'true', description: 'Shows the percentage next to the label.' },
    ],
    usage: [
      'Use determinate progress whenever you can estimate completion.',
      'Keep the label stable; changing it mid-task reads as a new operation.',
      'For short waits, prefer a spinner or an optimistic update.',
    ],
  },
  {
    slug: 'status-dot',
    name: 'StatusDot',
    group: 'Data display',
    description:
      'A tiny state indicator in five tones, with an optional pulse for live states. Decorative unless you pass `label`.',
    demo: <StatusDotDemo />,
    code: `import { StatusDot } from '@vorzela/react-scss'

<span>
  <StatusDot tone="success" pulse label="Operational" />
  Operational
</span>

<StatusDot tone="warning" />
<StatusDot tone="danger" size="sm" />`,
    props: [
      { name: 'tone', type: 'neutral | info | success | warning | danger', defaultValue: 'neutral', description: 'Semantic colour.' },
      { name: 'size', type: 'sm | md | lg', defaultValue: 'md', description: 'Dot diameter.' },
      { name: 'pulse', type: 'boolean', defaultValue: 'false', description: 'Animated halo for live states.' },
      { name: 'label', type: 'string', description: 'Accessible name. Without it the dot is decorative.' },
    ],
    usage: [
      'Always pair the dot with visible text unless the surrounding row already names the state.',
      'Reserve `pulse` for something genuinely changing right now.',
      'Do not encode state in colour alone; add text or an icon.',
    ],
  },
  {
    slug: 'tabs',
    name: 'Tabs',
    group: 'Navigation',
    description:
      'Accessible tab set with roving focus, arrow-key navigation and horizontal or vertical orientation. Content panels are focusable.',
    demo: <TabsDemo />,
    code: `import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '@vorzela/react-scss'

<Tabs defaultValue="overview">
  <TabsList aria-label="Account settings">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="members">Members</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">…</TabsContent>
  <TabsContent value="members">…</TabsContent>
</Tabs>`,
    props: [
      { name: 'value', type: 'string', description: 'Controlled selected value.' },
      { name: 'defaultValue', type: 'string', description: 'Initial value when uncontrolled.' },
      { name: 'onValueChange', type: '(value: string) => void', description: 'Fires on click and arrow-key selection.' },
      { name: 'orientation', type: 'horizontal | vertical', defaultValue: 'horizontal', description: 'Arrow-key axis.' },
    ],
    usage: [
      'Use tabs to switch views in place, not to navigate between pages.',
      'Give every `TabsList` an `aria-label` that names the group.',
      'Keep labels short and noun-like; avoid more than five or six tabs.',
    ],
  },
  {
    slug: 'switch',
    name: 'Switch',
    group: 'Forms',
    description:
      'A binary setting that applies immediately. Controlled or uncontrolled, with label, description, three sizes and reversed layout.',
    demo: <SwitchDemo />,
    code: `import { Switch } from '@vorzela/react-scss'

<Switch
  label="Product updates"
  description="A short monthly email."
  defaultChecked
/>

<Switch
  label="Beta features"
  checked={beta}
  onCheckedChange={setBeta}
/>`,
    props: [
      { name: 'checked', type: 'boolean', description: 'Controlled state.' },
      { name: 'defaultChecked', type: 'boolean', defaultValue: 'false', description: 'Initial state when uncontrolled.' },
      { name: 'onCheckedChange', type: '(checked: boolean) => void', description: 'Fires after the state flips.' },
      { name: 'label / description', type: 'ReactNode / string', description: 'Visible copy, linked to the control.' },
      { name: 'reverse', type: 'boolean', defaultValue: 'false', description: 'Puts the switch after the text.' },
      { name: 'size', type: 'sm | md | lg', defaultValue: 'md', description: 'Track and thumb size.' },
      { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Blocks interaction.' },
    ],
    usage: [
      'Use a switch for settings that save immediately; use a checkbox inside a form that needs a submit step.',
      'Write the label as the state that is on, e.g. “Product updates”, not “Enable product updates”.',
      'Do not use a switch for destructive actions. Use a confirmation dialog.',
    ],
  },
]

export function findComponent(slug: string | undefined): ComponentDoc | undefined {
  return components.find((component) => component.slug === slug)
}
