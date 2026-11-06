import { Bell, CheckCircle2, FileWarning, Sparkles, WifiOff } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { CookieConsent } from '~/components/ui/cookie-consent'
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
import { Section } from '../showcase'
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

function ToastDemo() {
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
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            title: 'New deployment ready',
            description: 'Production · 42s',
            type: 'info',
            action: { label: 'View', onClick: () => {} },
          })
        }
      >
        With action
      </Button>
    </div>
  )
}

export function MediaPage() {
  const [consent, setConsent] = useState(false)
  const [offline, setOffline] = useState(false)
  const [spinner, setSpinner] = useState(false)

  return (
    <>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>Media & system</span>
        <h1 className={styles.heroTitle}>The edges of the app.</h1>
        <p className={styles.heroLead}>
          Images, masonry feeds, toasts, connectivity and consent. These surfaces
          are easy to forget, which is exactly why they need the same tokens and
          the same restraint as the rest of the kit.
        </p>
        <div className={styles.chipRow}>
          <span className={styles.chip}>Lazy images</span>
          <span className={styles.chip}>Virtualized masonry</span>
          <span className={styles.chip}>Online / offline aware</span>
        </div>
      </header>

      <Section title="Images" lead="OptimizedImage keeps layout stable with width/height and aspect ratio, then defers decode until the image is near the viewport.">
        <div className={styles.mediaRow}>
          <OptimizedImage
            src="/favicon.svg"
            alt="Vorzela UI mark"
            width={96}
            height={96}
            priority
          />
          <OptimizedImage
            src="/favicon.svg"
            alt="Vorzela UI mark, lazy"
            width={96}
            height={96}
            loadingStrategy="lazy"
          />
          <Card flat padded className={styles.mediaCard}>
            <p className={styles.cardTitle}>Stable by construction</p>
            <p className={styles.cardText}>
              Width, height and aspect ratio are applied before the image loads,
              so the surrounding layout never shifts.
            </p>
          </Card>
        </div>
      </Section>

      <Section title="Masonry" lead="Shortest-column packing with optional virtualization. Use the children API for a gallery and itemCount for a large feed.">
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
      </Section>

      <Section title="Notifications" lead="A list with an unread count and a mark-all-read action. Pair it with a bell trigger in the header.">
        <NotificationCenter
          notifications={notifications}
          onMarkAllRead={() => {}}
        />
      </Section>

      <Section title="Toasts" lead="Short confirmations that do not block the page. Toaster provides useToast() to its subtree.">
        <Toaster position="bottom-right">
          <ToastDemo />
        </Toaster>
      </Section>

      <Section title="Connectivity and consent" lead="NetworkLoader tracks fetch while mounted; OfflineBanner appears only when navigator.onLine is false; consent persists in localStorage.">
        <NetworkLoader auto={false} position="top" showSpinner={spinner} />
        <div className={styles.demoGrid}>
          <Card flat padded>
            <div className={styles.cardHeaderRow}>
              <div>
                <h3 className={styles.cardTitle}>Network progress</h3>
                <p className={styles.cardText}>
                  A 3px trickle bar for any async work. The edge spinner is
                  optional.
                </p>
              </div>
              <Badge variant="soft">{spinner ? 'Bar + spinner' : 'Bar only'}</Badge>
            </div>
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
          </Card>

          <Card flat padded>
            <div className={styles.cardHeaderRow}>
              <div>
                <h3 className={styles.cardTitle}>Offline banner</h3>
                <p className={styles.cardText}>
                  Personalized status when the connection drops. Preview it
                  without disconnecting.
                </p>
              </div>
              <Badge variant={offline ? 'destructive' : 'success'}>
                {offline ? 'Preview' : 'Online'}
              </Badge>
            </div>
            <OfflineBanner force={offline} onRetry={() => setOffline(false)} />
            <div className="vz-demo-row">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setOffline((value) => !value)}
              >
                {offline ? 'Hide offline banner' : 'Preview offline state'}
              </Button>
            </div>
          </Card>

          <Card flat padded>
            <div className={styles.cardHeaderRow}>
              <div>
                <h3 className={styles.cardTitle}>Cookie consent</h3>
                <p className={styles.cardText}>
                  Accept or reject writes to localStorage under a configurable
                  key.
                </p>
              </div>
              <Badge variant="soft">Glass</Badge>
            </div>
            <div className="vz-demo-row">
              <Button size="sm" variant="outline" onClick={() => setConsent(true)}>
                Show consent
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.localStorage.removeItem('vz.docs.consent')}
              >
                Reset choice
              </Button>
            </div>
          </Card>
        </div>
      </Section>

      {consent ? (
        <CookieConsent
          storageKey="vz.docs.consent"
          onAccept={() => setConsent(false)}
          onReject={() => setConsent(false)}
        />
      ) : null}

      <Section title="Why it matters" lead="The system layer is where trust is won or lost.">
        <div className={styles.grid}>
          <div className={styles.card}>
            <span className={styles.cardIcon}>
              <Sparkles aria-hidden />
            </span>
            <h3 className={styles.cardTitle}>No surprise layout shift</h3>
            <p className={styles.cardText}>
              Reserve media dimensions up front. CLS is a design decision before
              it is a performance metric.
            </p>
          </div>
          <div className={styles.card}>
            <span className={styles.cardIcon}>
              <WifiOff aria-hidden />
            </span>
            <h3 className={styles.cardTitle}>Say when you are offline</h3>
            <p className={styles.cardText}>
              Disable network actions, explain what will sync, and never pretend
              a request succeeded.
            </p>
          </div>
          <div className={styles.card}>
            <span className={styles.cardIcon}>
              <Bell aria-hidden />
            </span>
            <h3 className={styles.cardTitle}>One toast at a time</h3>
            <p className={styles.cardText}>
              Toasts confirm; they do not ask. Bulk operations belong in a
              notification center.
            </p>
          </div>
        </div>
      </Section>
    </>
  )
}
