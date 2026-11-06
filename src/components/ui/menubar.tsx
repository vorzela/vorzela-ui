import { cx } from '~/lib/cx'
import { Dropdown, type DropdownItem } from './dropdown'
import styles from './menubar.module.scss'

export interface MenubarMenu {
  label: string
  items: DropdownItem[]
}

export interface MenubarProps {
  menus: MenubarMenu[]
  align?: 'left' | 'right'
  className?: string
  label?: string
}

/** Horizontal application menu. Each menu reuses the viewport-aware Dropdown. */
export function Menubar({
  menus,
  align = 'left',
  className,
  label = 'Application menu',
}: MenubarProps) {
  return (
    <div role="group" aria-label={label} className={cx(styles.root, className)}>
      {menus.map((menu) => (
        <Dropdown
          key={menu.label}
          align={align}
          items={menu.items}
          trigger={
            <button type="button" className={styles.trigger}>
              {menu.label}
            </button>
          }
        />
      ))}
    </div>
  )
}
