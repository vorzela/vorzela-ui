import { Bell, CheckCircle2, FileWarning, Sparkles, WifiOff } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { CookieConsent } from '~/components/ui/cookie-consent'
import { GlassPanel } from '~/components/ui/glass-panel'
import { MasonryGrid, MasonryTile } from '~/components/ui/masonry-grid'
import { NetworkLoader } from '~/components/ui/network-loader'
import {
  finishNetworkLoader,
  startNetworkLoader,
} from '~/components/ui/network-loader-store'
import { NotificationCenter } from '~/components/ui/notification-center'
import { OfflineBanner } from '~/components/ui/offline-banner'
import { OptimizedImage } from '~/components/ui/optimized-image'
import { Toaster, useToast } from '~/components/ui/sonner'
import { DismissableLayer } from '~/components/primitives/dismissable-layer'
import { ErrorBoundary } from '~/components/primitives/error-boundary'
import { FocusTrap } from '~/components/primitives/focus-trap'
import { Portal } from '~/components/primitives/portal'
import { SkipLink } from '~/components/primitives/skip-link'
import { VisuallyHidden } from '~/components/primitives/visually-hidden'

import styles from '../docs.module.scss'

const notifications = [
  {
    id: '1',
    title: 'Deployment succeeded',
    description: 'vorzela-ui · production · 42s',
    time: '2 min ago',
    read: false,
    icon: <CheckCircle2 aria-hidden size={15} />,
  },
  {
    id: '2',
    title: 'Build minutes at 82%',
    description: 'Consider upgrading before the end of the month.',
    time: '1 hour ago',
    read: false,
    icon: <FileWarning aria-hidden size={15} />,
  },
  {
    id: '3',
    title: 'New member joined',
    description: 'Grace accepted your invite.',
    time: 'Yesterday',
    read: true,
    icon: <Bell aria-hidden size={15} />,
  },
]

function ToastPreview() {
  const { toast } = useToast()
  return (
    <div className="vz-demo-row">
      <Button
        onClick={() =>
          toast({ title: 'Project published', description: 'Live in production.', type: 'success' })
        }
      >
        Success toast
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast({ title: 'Upload failed', description: 'The file exceeds 10 MB.', type: 'error' })
        }
      >
        Error toast
      </Button>
    </div>
  )
}

function PortalPreview() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  return (
    <div ref={(element) => setContainer(element)} className={styles.card}>
      <p className={styles.cardText}>Portal target</p>
      {container ? (
        <Portal container={container}>
          <p className={styles.cardTitle}>Rendered through a portal</p>
        </Portal>
      ) : null}
    </div>
  )
}

function CookiePreview() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Show consent</Button>
      {open ? (
        <CookieConsent
          storageKey="vz.docs.preview.consent"
          onAccept={() => setOpen(false)}
          onReject={() => setOpen(false)}
        />
      ) : null}
    </>
  )
}

function NetworkPreview() {
  const [spinner, setSpinner] = useState(false)
  return (
    <div className={styles.demoStack}>
      <NetworkLoader auto={false} position="top" showSpinner={spinner} />
      <div className="vz-demo-row">
        <Button
          size="sm"
          onClick={() => {
            setSpinner(false)
            startNetworkLoader()
            window.setTimeout(finishNetworkLoader, 1800)
          }}
        >
          Bar only
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSpinner(true)
            startNetworkLoader()
            window.setTimeout(finishNetworkLoader, 1800)
          }}
        >
          Bar + spinner
        </Button>
      </div>
    </div>
  )
}

function DismissablePreview() {
  const [visible, setVisible] = useState(true)
  return visible ? (
    <DismissableLayer onDismiss={() => setVisible(false)}>
      <Card flat padded>
        <p className={styles.cardTitle}>Dismissable layer</p>
        <p className={styles.cardText}>Press Escape or click outside to dismiss.</p>
      </Card>
    </DismissableLayer>
  ) : (
    <Button size="sm" variant="outline" onClick={() => setVisible(true)}>Show again</Button>
  )
}

export const mediaPreviews = {
  'optimized-image': (
    <div className={styles.mediaRow}>
      <OptimizedImage src="/favicon.svg" alt="Vorzela UI mark" width={96} height={96} priority />
      <OptimizedImage
        src="/favicon.svg"
        alt="Vorzela UI mark, lazy"
        width={96}
        height={96}
        loadingStrategy="lazy"
      />
    </div>
  ),
  'masonry-grid': (
    <MasonryGrid columns={3} gap={12} aria-label="Gallery">
      {[180, 240, 140, 220, 160, 200].map((height, index) => (
        <MasonryTile
          key={height}
          title={`Study ${index + 1}`}
          meta={`${180 + ((index * 37) % 120)}px`}
          imageAspectRatio={height / 180}
        >
          <div
            className={styles.masonrySwatch}
            style={{
              background: `hsl(var(--chart-${(index % 8) + 1}) / 0.16)`,
              color: `hsl(var(--chart-${(index % 8) + 1}))`,
            }}
          >
            <Sparkles aria-hidden />
          </div>
        </MasonryTile>
      ))}
    </MasonryGrid>
  ),
  'glass-panel': (
    <GlassPanel blur="lg">
      <h3 className={styles.cardTitle}>Glass panel</h3>
      <p className={styles.cardText}>Translucent surface with an opaque fallback.</p>
    </GlassPanel>
  ),
  'notification-center': (
    <NotificationCenter notifications={notifications} onMarkAllRead={() => {}} />
  ),
  'toaster': (
    <Toaster position="bottom-right">
      <ToastPreview />
    </Toaster>
  ),
  'network-loader': <NetworkPreview />,
  'cookie-consent': <CookiePreview />,
  'offline-banner': (
    <div className={styles.demoStack}>
      <OfflineBanner force onRetry={() => {}} />
      <div className={styles.demoGrid}>
        <Card flat padded>
          <span className={styles.cardIcon}><WifiOff aria-hidden /></span>
          <p className={styles.cardTitle}>Offline state</p>
          <p className={styles.cardText}>The banner appears only when the connection drops.</p>
        </Card>
      </div>
    </div>
  ),
  'error-boundary': (
    <ErrorBoundary fallback={<p className={styles.cardText}>Fallback UI</p>}>
      <Card flat padded>
        <p className={styles.cardTitle}>Healthy section</p>
        <p className={styles.cardText}>A failing child is isolated and replaced by the fallback.</p>
      </Card>
    </ErrorBoundary>
  ),
  'portal': <PortalPreview />,
  'focus-trap': (
    <FocusTrap active={false}>
      <Card flat padded>
        <p className={styles.cardTitle}>Focus trap</p>
        <p className={styles.cardText}>Tab and Shift+Tab stay inside while active.</p>
        <Button size="sm">Focusable control</Button>
      </Card>
    </FocusTrap>
  ),
  'dismissable-layer': <DismissablePreview />,
  'visually-hidden': (
    <div className="vz-demo-row">
      <Button aria-label="Close panel">
        <span aria-hidden>×</span>
        <VisuallyHidden>Close panel</VisuallyHidden>
      </Button>
      <Badge variant="soft">Screen-reader label</Badge>
    </div>
  ),
  'skip-link': (
    <div className={styles.demoStack}>
      <SkipLink href="#main">Skip to content</SkipLink>
      <p className={styles.cardText}>Press Tab to reveal the skip link, the first focus stop on a page.</p>
    </div>
  ),
}
