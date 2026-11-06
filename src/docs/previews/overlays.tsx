import { Copy, Download, Pencil, Share2, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { ActionMenu } from '~/components/ui/action-menu'
import { AlertDialog } from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
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
import { Toolbar, ToolbarGroup } from '~/components/ui/toolbar'
import { Tooltip } from '~/components/ui/tooltip'
import { Tour } from '~/components/ui/tour'

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
  { key: 'delete', label: 'Delete', danger: true, divider: true, onSelect: () => {} },
]

function ModalPreview() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Rename project"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Save changes</Button>
          </>
        }
      >
        <Input label="Project name" defaultValue="Vorzela UI" />
      </Modal>
    </>
  )
}

function DrawerPreview() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Open drawer</Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Project details" side="right">
        <div className={styles.demoStack}>
          <Input label="Name" defaultValue="Vorzela UI" />
          <Button onClick={() => setOpen(false)}>Save</Button>
        </div>
      </Drawer>
    </>
  )
}

function SheetPreview() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Open sheet</Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Quick note" side="bottom">
        <div className={styles.demoStack}>
          <Input label="Title" placeholder="Release note" />
          <Button onClick={() => setOpen(false)}>Publish</Button>
        </div>
      </Sheet>
    </>
  )
}

function AlertDialogPreview() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>Delete project</Button>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this project?"
        description="Deployments, environment variables and build history are removed permanently."
        actionText="Delete project"
        destructive
        onAction={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}

function TourPreview() {
  const [open, setOpen] = useState(false)
  return (
    <div className={styles.demoStack}>
      <div className="vz-demo-row">
        <Button onClick={() => setOpen(true)}>Start tour</Button>
        <div id="preview-tour-search" className={styles.card}>
          <p className={styles.cardTitle}>Search</p>
          <p className={styles.cardText}>Find projects, builds and members.</p>
        </div>
        <div id="preview-tour-actions" className={styles.card}>
          <p className={styles.cardTitle}>Actions</p>
          <p className={styles.cardText}>Share, export or archive the project.</p>
        </div>
      </div>
      <Tour
        open={open}
        onOpenChange={setOpen}
        onFinish={() => setOpen(false)}
        steps={[
          {
            id: 'search',
            target: '#preview-tour-search',
            title: 'Find anything',
            description: 'Search projects, builds and members from one field.',
            placement: 'bottom',
          },
          {
            id: 'actions',
            target: '#preview-tour-actions',
            title: 'Project actions',
            description: 'Share, export or archive the current project.',
            placement: 'top',
          },
        ]}
      />
    </div>
  )
}

export const overlayPreviews = {
  'modal': <ModalPreview />,
  'drawer': <DrawerPreview />,
  'sheet': <SheetPreview />,
  'alert-dialog': <AlertDialogPreview />,
  'tour': <TourPreview />,
  'dropdown': (
    <Dropdown
      trigger={<Button variant="outline">Project actions</Button>}
      items={menuItems}
    />
  ),
  'action-menu': <ActionMenu items={actionItems} triggerLabel="Project actions" />,
  'context-menu': (
    <ContextMenu items={menuItems}>
      <div className={styles.contextTarget}>Right-click this card</div>
    </ContextMenu>
  ),
  'popover': (
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
  ),
  'hover-card': (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="ghost">@ada</Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <p className={styles.cardTitle}>Ada Lovelace</p>
        <p className={styles.cardText}>Design systems · London · joined 2024</p>
      </HoverCardContent>
    </HoverCard>
  ),
  'tooltip': (
    <Tooltip content="Copy the current URL" placement="top">
      <Button variant="outline">Hover or focus me</Button>
    </Tooltip>
  ),
  'toolbar': (
    <Toolbar label="Formatting">
      <ToolbarGroup>
        <Button size="sm" variant="ghost">Bold</Button>
        <Button size="sm" variant="ghost">Italic</Button>
        <Button size="sm" variant="ghost">Underline</Button>
      </ToolbarGroup>
    </Toolbar>
  ),
  'popconfirm': (
    <Popconfirm
      title="Delete this project?"
      description="The project and its deployments are removed."
      destructive
      confirmLabel="Delete"
      onConfirm={() => {}}
    >
      <Button variant="outline">Delete project</Button>
    </Popconfirm>
  ),
  'close-button': (
    <div className="vz-demo-row">
      <CloseButton label="Close panel" />
      <CloseButton label="Close dialog" size="lg" />
    </div>
  ),
}
