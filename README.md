# Vorzela UI · React + SCSS

A source-owned React UI kit with an Apple-inspired product language: layered
neutral surfaces, SF-first typography, flat solid controls, continuous corners
and one accent. Styles are plain **SCSS Modules** — no Tailwind, no `clsx`, no
`tailwind-merge`, no CVA and no runtime style engine.

```
React 19 · TypeScript · Vite 8 · SCSS Modules · lucide-react
TanStack Table v9 · TanStack Form · d3 + d3-sankey · sugar-high
```

## Quick start

```bash
cd react_scss
npm install
npm run dev
```

The docs app is a working reference with live demos, code snippets, API tables,
theme switching, keyboard checks and 100/100 Lighthouse accessibility on every
page.

```bash
npm run build          # typecheck + production build
npm run preview        # serve the production build
npm run lint           # oxlint + stylelint
npm run typecheck      # tsc -b
npm run sass:check     # compile global.scss
npm run registry:build # regenerate registry/*.json from src/
npm run cli -- ...     # run the vorzela-ui CLI from this repo
```

## Install components into an app

The registry ships each component as source, so an app installs only the
components it uses. The CLI reads `vorzela.json`, resolves registry
dependencies, rewrites `~` imports to your aliases and stores a snapshot for
safe updates.

```bash
vorzela-ui init
vorzela-ui add button input card
```

The default registry is `https://ui.vorzela.dev`; a future deployment will live
at `https://ui.vorzelacloud.com`. For local development, set `registry` to the
generated folder (absolute, relative, or `file://`); the CLI accepts an HTTP
URL or a directory.

```jsonc
// vorzela.json
{
  "registry": "https://ui.vorzela.dev",
  "version": "0.2.0",
  "aliases": {
    "base": "~",
    "components": "~/components/ui",
    "lib": "~/lib",
    "hooks": "~/hooks",
    "styles": "~/styles"
  },
  "paths": {
    "base": "app",
    "components": "app/components/ui",
    "lib": "app/lib",
    "hooks": "app/hooks",
    "styles": "app/styles"
  },
  "css": "app/styles/global.scss"
}
```

Import the installed stylesheet once, then use the source directly:

```tsx
import '~/styles/global.scss'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Input } from '~/components/ui/input'

export function SignIn() {
  return (
    <Card>
      <CardContent>
        <Input label="Email" type="email" placeholder="you@example.com" />
        <Button>Continue</Button>
      </CardContent>
    </Card>
  )
}
```

### CLI commands

| Command | What it does |
| --- | --- |
| `vorzela-ui init` | Writes `vorzela.json` and creates the configured folders. |
| `vorzela-ui add button input card` | Installs components plus registry and npm dependencies. |
| `vorzela-ui add button --overwrite` | Replaces files that already exist. |
| `vorzela-ui update` | Updates every installed item. |
| `vorzela-ui update button` | Updates selected items only. |
| `vorzela-ui status` | Shows installed vs latest versions and local edit counts. |
| `vorzela-ui diff button` | Diffs local files against the registry. |
| `vorzela-ui doctor` | Checks missing paths, files and snapshots. |

Flags: `--registry <url|path>`, `--cwd <dir>`, `--dry-run`, `--overwrite`,
`--yes` (keep locally modified files) and `--force` (replace them without
prompting). Until the CLI is published, run it from this repo with
`npm run cli -- add button`.

### How updates stay safe

`add` stores three things per file: the installed file, a content hash and a
snapshot under `.vorzela/snapshots/`. On `update`:

1. A local file that still matches its snapshot is replaced automatically.
2. A locally edited file opens a prompt: show diff, keep local, replace with
   registry, skip this component or replace all remaining.
3. Missing files are restored from the registry.

`vorzela-ui update --yes` keeps every edited file, `--force` replaces every
file without prompting, and `--dry-run` only reports what would change.
`status`, `diff` and `doctor` never write.

`.vorzela/manifest.json` records installed items, versions, files, npm
dependencies and snapshot paths. Commit it with the app so every machine and CI
run starts from the same baseline.

## Build and publish the registry

```bash
npm run registry:build
```

The generator reads `src/` and writes `registry/index.json` plus one JSON file
per item (currently 115 items, including 105 UI components). Serve that folder
as static files from `https://ui.vorzela.dev`; the CLI only fetches
`index.json` and `<name>.json`.

## What is in the box

| Layer | Count | Includes |
| --- | --- | --- |
| Core | 16 | Button, Badge, Label, Input, Textarea, Card, Alert, Spinner, Skeleton, Avatar, Kbd, Separator, Progress, StatusDot, Tabs, Switch |
| Forms | 28 | Checkbox, RadioGroup, Slider, NumberInput, OtpInput, TagInput, SegmentedControl, Toggle, ToggleGroup, Select, Combobox, Autocomplete, PasswordStrengthInput, PhoneInput, FileUpload, FilePicker, CurrencyInput, SearchInput, Rating, InputGroup, FloatingLabelInput, Calendar, DatePicker, Form, FormDatePicker, RangeSlider, TimePicker, ColorPicker, Editable |
| Tables | 4 | SimpleDataTable, DataTable, Table, Pagination |
| Data display | 23 | Stat, StatGroup, DescriptionList, Timeline, TreeView, JsonViewer, DiffViewer, Empty, ErrorState, Banner, Callout, NumberTicker, Marquee, BentoGrid, AspectRatio, Receipt, Invoice, List, Link, Code, Highlight, Heading, Result |
| Overlays | 13 | Modal, Drawer, Sheet, AlertDialog, Dropdown, ActionMenu, ContextMenu, Popover, HoverCard, Tooltip, Toolbar, Popconfirm, CloseButton |
| Navigation | 14 | Accordion, Collapsible, Breadcrumb, Pagination, Command, NavigationMenu, Stepper, ScrollArea, Resizable, Carousel, VirtualList, CopyButton, TabBar, Menubar |
| Layout | 11 | AppShell, Header, Topbar, Sidebar, Stack, Inline, Flex, Grid, Split, Container, PageSection |
| Charts | 18 | Line, Area, Bar, Donut, Scatter, Heatmap, Sparkline, Gauge, Radar, Treemap, Sankey, Funnel, Candlestick, Waterfall, Histogram, RadialBar, Bullet, ChartFrame |
| Media & system | 14 | OptimizedImage, MasonryGrid, GlassPanel, NotificationCenter, Toaster, NetworkLoader, CookieConsent, OfflineBanner, ErrorBoundary, Portal, FocusTrap, DismissableLayer, VisuallyHidden, SkipLink |

Every component owns one `.tsx` file and one `.module.scss` file. There are no
shared component stylesheets, so installing a component means copying exactly
two files (plus any primitive it imports). The registry generator follows those
imports and ships them as dependencies.

```tsx
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
```

## Project layout

```
react_scss/
├── index.html                 # applies ?theme and stored theme before paint
├── packages/cli/              # vorzela-ui CLI (init, add, update, status, diff, doctor)
├── registry/                  # generated shadcn-style registry JSON
├── scripts/build-registry.mjs # regenerate registry from src/
├── src/
│   ├── main.tsx               # imports global.scss once
│   ├── App.tsx                # hash-routed docs shell (lazy pages)
│   ├── components/ui/         # the kit (one .tsx + one .module.scss each)
│   ├── components/primitives/ # portal, focus trap, dismissal, skip link…
│   ├── components/reusable/   # TanStack Form wrappers
│   ├── components/utils/      # For, Show, Switch render helpers
│   ├── charts/                # 18 d3 charts + shared chart module
│   ├── hooks/                 # media query, controllable state, hotkeys…
│   ├── docs/                  # docs pages, inventory, registry, demos
│   ├── lib/                   # cx, table features, overlay, security, phone
│   └── styles/
│       ├── _index.scss        # public Sass API (emits no CSS)
│       ├── global.scss        # the single CSS entry point
│       ├── tokens/            # colour, space, type, radius, shadow, motion, z, breakpoints
│       ├── mixins/            # focus-ring, interaction, surface, truncate, scrollbar, icon, supports, group
│       └── base/              # reset, base, globals
├── vite.config.ts             # CSS Modules camelCaseOnly, Sass + Lightning CSS
```

## Styling model

- **One module per component.** Classes are kebab-case in SCSS and accessed as
  camelCase in TS (`styles.statusError` → `.status-error`). Vite's Lightning CSS
  transformer keeps the dashed export names, so `vite.config.ts` adds camelCase
  aliases after `vite:css-post`; keep that plugin if you change the CSS pipeline.
- **Tokens are CSS variables.** Light and dark values are emitted once from
  `src/styles/global.scss`. Toggling `.dark` on `<html>` retunes every component
  without a re-render.
- **Colour tokens are HSL triplets.** This allows alpha without `color-mix()`:

  ```scss
  @use 'styles' as vz;

  .panel {
    background: vz.color('primary', 0.12);
    border: 1px solid vz.color('border');
    border-radius: vz.radius('xl');
    box-shadow: vz.elevation(1);
    transition: background-color vz.duration('base') vz.ease('out');
  }
  ```

- **Accessor functions fail fast.** `vz.color('unknown')`, `vz.space(13)`,
  `vz.radius('huge')` and similar calls stop the Sass build with a message that
  lists the valid keys.
- **Variants are typed records**, not CVA:

  ```tsx
  const VARIANT: Record<ButtonVariant, string> = {
    primary: styles.primary,
    secondary: styles.secondary,
  }
  ```

### Token reference

| Layer | Function | Example |
| --- | --- | --- |
| Colour | `color($name, $alpha: 1)` | `color('primary', 0.9)` |
| Space | `space($step)` | `space(4)` → `1rem` |
| Type | `font-size($name)`, `text($preset)` | `text('title-2')` |
| Radius | `radius($name)` | `radius('xl')` → `var(--radius-xl)` |
| Elevation | `elevation($level)` | `elevation(2)` |
| Motion | `duration($name)`, `ease($name)` | `duration('fast')` |
| Layers | `z($name)` | `z('modal')` |
| Breakpoints | `up()`, `down()`, `between()` | `@include vz.up('lg')` |

Mixins: `focus-ring`, `hover`, `active`, `disabled`, `selected`, `placeholder`,
`surface`, `raised`, `inset`, `truncate`, `line-clamp`, `scrollbar`, `icon`,
`supports`, `motion-safe`, `motion-reduce`, `group-*`, `peer-*`.

## Tables

Two layers on **TanStack Table v9**:

- `SimpleDataTable` — search, sorting and pagination without selection.
- `DataTable` — adds a leading checkbox column, bulk-action bar, column
  visibility panel, manual pagination/sorting/filtering hooks and loading
  skeletons.

Both use the same density variants (`compact`, `comfortable`, `minimal`) and
reserve column widths while loading so nothing jumps.

```tsx
import { DataTable, type AppColumnDef } from '~/components/ui/data-table'
import { Button } from '~/components/ui/button'

const columns: AppColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
]

<DataTable
  data={users}
  columns={columns}
  enableRowSelection
  columnVisibilityToggle
  bulkActions={(rows) => <Button>Remove {rows.length}</Button>}
/>
```

## Forms

`Input`, `Textarea` and the composed fields share one focus shell, one error
pattern and one radius scale. `Form` wrappers for **TanStack Form** live in
`src/components/reusable/form.tsx` (port + `FormInput`, `FormPassword`,
`FormTextarea`, `FormCheckbox`, `FormSelect`).

- Labels are always visible; placeholders are never the label.
- Errors are announced with `role="alert"` and linked through
  `aria-describedby`.
- `Select` and `Combobox` use a portal, focus management and full keyboard
  navigation.
- `OtpInput` distributes a paste across fields; `TagInput` adds on Enter or
  comma; `FileUpload` validates type, size and image dimensions.

## Charts

Eighteen d3 charts share `src/charts/charts.module.scss`: one frame, one
tooltip, one legend and theme-aware `--chart-1…8` variables. `ChartFrame` offers
loading, empty and error states plus an optional data table for assistive tech.

- Deterministic responsive sizing via `useContainerSize`, with a resize
  fallback for embedded browsers.
- Animation settles on the real values even when `requestAnimationFrame` is
  throttled.
- Series colours resolve from CSS variables, so light and dark swap together.

## Overlays and navigation

- `Modal`, `Drawer`, `Sheet`, `AlertDialog` share `lockBodyScroll`, `FocusTrap`
  and `DismissableLayer`; focus returns to the trigger on close.
- `Dropdown`, `ActionMenu`, `ContextMenu`, `Popover`, `HoverCard` and `Tooltip`
  flip and clamp to the viewport.
- `Sidebar` supports a collapsible desktop rail, collapsible groups that
  auto-open around the active route, nested child menus, permission filtering,
  mobile drawer, hover tooltips and body-scroll locking.
- `TabBar` is a compact bottom navigation with a glass surface, one tab stop and
  roving Arrow/Home/End focus.
- `Command` filters items and supports Arrow/Home/End/Enter.
- `VirtualList` windows large lists; `MasonryGrid` packs columns and can
  virtualize a feed.
- `GlassPanel` adds a translucent, blurred surface with an opaque fallback when
  `backdrop-filter` is unavailable.

## Code highlighting

The docs code block uses **sugar-high** with a theme-aware surface:

- Light mode: white card, dark measured text, high-contrast syntax tokens.
- Dark mode: deep slate surface with a light token palette.
- `lang()` normalises `tsx`, `bash`, `css`, `ts`, etc.
- Copy-to-clipboard feedback is announced without a layout shift.
- Component pages expose three compact tabs: **Usage**, **package.json** and
  **SCSS**, so the snippet, the required dependencies and the style wiring travel
  together.

## Theming

Override variables after the kit stylesheet. Keep the names; change the values.

```css
:root {
  --primary: 262 83% 58%;
  --radius-lg: 14px;
  --radius-xl: 18px;
  --radius-2xl: 22px;
}

.dark {
  --primary: 262 91% 72%;
}
```

Switch themes by toggling the class — not by swapping stylesheets:

```ts
document.documentElement.classList.toggle('dark', isDark)
document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
```

The docs app persists the choice in `localStorage` under `vz-theme` and falls
back to `prefers-color-scheme` on first visit. `/?theme=dark#/tables` deep-links
a theme for screenshots or QA.

## Accessibility

- Visible `:focus-visible` outlines on every control; focus is never removed.
- `useId` links labels, hints and error messages through `aria-describedby`.
- Field errors use `role="alert"`; informational alerts use `role="status"`.
- `Tabs` implements roving tabindex, Arrow/Home/End navigation and focusable
  panels. `Switch` uses `role="switch"` + `aria-checked`.
- `TreeView`, `Command`, `Accordion`, `NavigationMenu`, `Carousel` and
  `Resizable` have keyboard paths.
- Decorative dots, skeletons and icons are hidden from assistive tech; status
  dots accept a `label` when they carry meaning.
- `prefers-reduced-motion` disables decorative animation globally and inside
  each module.
- Status is never communicated by colour alone.
- Every docs page scores **100** for Accessibility in Lighthouse.

## Security notes

- No component uses `dangerouslySetInnerHTML` with untrusted input.
- `sugar-high` output is generated from local code strings in the docs.
- `lib/security.ts` provides `safeHref`, `escapeHtml`, `validateFile`, CSV
  escaping, safe JSON parsing and `sanitizeHtml`. `sanitizeHtml` lazy-loads
  **dompurify** only when a host app needs to render untrusted HTML; the kit
  itself does not.
- `JsonViewer` renders spans, `DiffViewer` renders plain text.

## Browser support

`browserslist`: Safari 16.4+, Chrome/Edge 111+, Firefox 128+, not dead.

Lightning CSS transforms and minifies against the same `browserslist` matrix in
`vite.config.ts` (no PostCSS), and
`stylelint-no-unsupported-browser-features` flags CSS outside the matrix.
Cascade layers, nesting and `text-size-adjust` are intentionally allowed because
they are processed or non-critical. `css-autofill` is allowed as a progressive
enhancement.

## Motion

The kit stays quiet but not static: ring spinner, skeleton shimmer, switch thumb
spring, tab panel fade, alert entrance, input status pop, avatar presence pop,
status ping, progress width transition, chart draw-in, carousel snapping, and a
docs page transition that no longer hides content when animations are throttled.
Every non-essential animation is disabled by `prefers-reduced-motion`.

## Design rules

- Neutral layered surfaces; the accent is used once per view.
- Flat solid primary controls. No gradients on buttons or badges.
- Continuous radii; full rounding only for avatars, dots and pills.
- Three soft elevations; dark mode uses deeper black shadows.
- Copy is specific and calm. Errors say what to fix.

## Notes

- This package is `private: true` and intended to be copied or vendored. There
  is no build step for the library itself; consume the source with your own
  bundler.
- `lucide-react` is the icon set; there is no second icon library.
- The legacy Tailwind kit in `../reactjs` is reference only and is not imported
  here.
