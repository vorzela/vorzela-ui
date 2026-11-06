import { useState } from 'react'
import {
  Copy,
  Download,
  Pencil,
  Share2,
  Trash2,
} from 'lucide-react'

import { ActionMenu } from '~/components/ui/action-menu'
import { AlertDialog } from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { CloseButton } from '~/components/ui/close-button'
import { ContextMenu } from '~/components/ui/context-menu'
import { Drawer } from '~/components/ui/drawer'
import { Dropdown } from '~/components/ui/dropdown'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '~/components/ui/hover-card'
import { Input } from '~/components/ui/input'
import { Modal } from '~/components/ui/modal'
import { Popconfirm } from '~/components/ui/popconfirm'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Sheet } from '~/components/ui/sheet'
import { Tooltip } from '~/components/ui/tooltip'
import { Demo, Section } from '../showcase'
import styles from '../docs.module.scss'

const menuItems = [
  { key: 'edit', label: 'Edit project', icon: <Pencil aria-hidden size={14} /> },
  { key: 'duplicate', label: 'Duplicate', icon: <Copy aria-hidden size={14} /> },
  { key: 'share', label: 'Share', icon: <Share2 aria-hidden size={14} /> },
  { key: 'export', label: 'Export', icon: <Download aria-hidden size={14} /> },
  { key: 'delete', label: 'Delete', icon: <Trash2 aria-hidden size={14} />, danger: true, divider: true },
]

const actionItems = [
  { key: 'edit', label: 'Edit', onSelect: () => {} },
  { key: 'duplicate', label: 'Duplicate', onSelect: () => {} },
  { key: 'share', label: 'Share', onSelect: () => {} },
  { key: 'delete', label: 'Delete', danger: true, divider: true, onSelect: () => {} },
]

export function OverlaysPage() {
  const [modal, setModal] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [sheet, setSheet] = useState(false)
  const [confirm, setConfirm] = useState(false)

  return (
    <>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>Overlays</span>
        <h1 className={styles.heroTitle}>Above the page, not in the way.</h1>
        <p className={styles.heroLead}>
          Dialogs, drawers, menus, popovers and tooltips share one portal, one
          focus trap and one dismissal model. Escape and outside press close
          every layer; focus returns to the trigger.
        </p>
        <div className={styles.chipRow}>
          <span className={styles.chip}>Portal + focus trap</span>
          <span className={styles.chip}>Scroll lock</span>
          <span className={styles.chip}>Escape / outside click</span>
        </div>
      </header>

      <Section title="Dialogs" lead="A modal blocks the page for a decision. Keep the action count to two; the destructive action goes on the right.">
        <Demo title="Modal and confirmation" note="Focus trapped">
          <div className="vz-demo-row">
            <Button onClick={() => setModal(true)}>Open modal</Button>
            <Button variant="destructive" onClick={() => setConfirm(true)}>
              Delete project
            </Button>
          </div>
        </Demo>
      </Section>

      <Section title="Drawers and sheets" lead="Use a drawer for a side task and a sheet for a short form. Both slide over the page and restore scroll on close.">
        <Demo title="Edge panels" note="Left, right, bottom">
          <div className="vz-demo-row">
            <Button variant="outline" onClick={() => setDrawer(true)}>
              Open drawer
            </Button>
            <Button variant="outline" onClick={() => setSheet(true)}>
              Open sheet
            </Button>
          </div>
        </Demo>
      </Section>

      <Section title="Menus" lead="Dropdown for a small action list, ActionMenu for a trailing ⋯ trigger, ContextMenu for right-click.">
        <div className={styles.demoGrid}>
          <Card flat padded>
            <h3 className={styles.cardTitle}>Dropdown</h3>
            <Dropdown
              trigger={<Button variant="outline">Project actions</Button>}
              items={menuItems}
            />
          </Card>
          <Card flat padded>
            <h3 className={styles.cardTitle}>Action menu</h3>
            <ActionMenu items={actionItems} triggerLabel="Project actions" />
          </Card>
          <Card flat padded>
            <h3 className={styles.cardTitle}>Context menu</h3>
            <ContextMenu items={menuItems}>
              <div className={styles.contextTarget}>Right-click this card</div>
            </ContextMenu>
          </Card>
          <Card flat padded>
            <h3 className={styles.cardTitle}>Tooltip</h3>
            <Tooltip content="Copy the current URL" placement="top">
              <Button variant="outline">Hover or focus me</Button>
            </Tooltip>
          </Card>
          <Card flat padded>
            <h3 className={styles.cardTitle}>Popconfirm</h3>
            <Popconfirm
              title="Delete this project?"
              description="The project and its deployments are removed."
              destructive
              confirmLabel="Delete"
              onConfirm={() => {}}
            >
              <Button variant="outline">Delete project</Button>
            </Popconfirm>
          </Card>
          <Card flat padded>
            <h3 className={styles.cardTitle}>Close button</h3>
            <div className="vz-demo-row">
              <CloseButton label="Close panel" />
              <CloseButton label="Close dialog" size="lg" />
            </div>
          </Card>
        </div>
      </Section>

      <Section title="Popover and hover card" lead="Popovers hold interactive content. Hover cards preview a person or entity and never contain the only path to an action.">
        <div className="vz-demo-row">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Share project</Button>
            </PopoverTrigger>
            <PopoverContent ariaLabel="Share project" className={styles.popoverContent}>
              <p className={styles.cardTitle}>Invite by email</p>
              <Input label="Email" placeholder="teammate@example.com" size="sm" />
              <div className="vz-demo-row">
                <Button size="sm">Send invite</Button>
                <Button size="sm" variant="ghost">Copy link</Button>
              </div>
            </PopoverContent>
          </Popover>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost">@ada</Button>
            </HoverCardTrigger>
            <HoverCardContent>
              <p className={styles.cardTitle}>Ada Lovelace</p>
              <p className={styles.cardText}>Design systems · London · joined 2024</p>
            </HoverCardContent>
          </HoverCard>
        </div>
      </Section>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Rename project"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModal(false)}>Save changes</Button>
          </>
        }
      >
        <Input label="Project name" defaultValue="Vorzela UI" />
        <p className={styles.cardText}>
          Renaming changes the URL slug. Existing links keep working.
        </p>
      </Modal>

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Project details" side="right">
        <div className={styles.demoStack}>
          <Input label="Name" defaultValue="Vorzela UI" />
          <Input label="Slug" defaultValue="vorzela-ui" />
          <Button onClick={() => setDrawer(false)}>Save</Button>
        </div>
      </Drawer>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Quick note" side="bottom">
        <div className={styles.demoStack}>
          <Input label="Title" placeholder="Release note" />
          <Button onClick={() => setSheet(false)}>Publish</Button>
        </div>
      </Sheet>

      <AlertDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Delete this project?"
        description="Deployments, environment variables and build history are removed permanently."
        actionText="Delete project"
        destructive
        onAction={() => setConfirm(false)}
        onCancel={() => setConfirm(false)}
      />
    </>
  )
}
