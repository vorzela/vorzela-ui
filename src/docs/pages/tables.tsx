import type { AppColumnDef } from '~/lib/table'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { DataTable } from '~/components/ui/data-table'
import { SimpleDataTable } from '~/components/ui/simple-data-table'
import { CodeBlock, Section } from '../showcase'
import styles from '../docs.module.scss'

type Person = {
  id: string
  name: string
  email: string
  role: 'Owner' | 'Admin' | 'Editor' | 'Viewer'
  status: 'Active' | 'Invited' | 'Suspended'
  projects: number
  lastActive: string
}

const people: Person[] = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@vorzela.dev', role: 'Owner', status: 'Active', projects: 12, lastActive: '2 min ago' },
  { id: '2', name: 'Grace Hopper', email: 'grace@vorzela.dev', role: 'Admin', status: 'Active', projects: 9, lastActive: '14 min ago' },
  { id: '3', name: 'Alan Turing', email: 'alan@vorzela.dev', role: 'Editor', status: 'Invited', projects: 4, lastActive: '3 hours ago' },
  { id: '4', name: 'Katherine Johnson', email: 'katherine@vorzela.dev', role: 'Admin', status: 'Active', projects: 15, lastActive: 'Yesterday' },
  { id: '5', name: 'Linus Torvalds', email: 'linus@vorzela.dev', role: 'Editor', status: 'Suspended', projects: 2, lastActive: '3 days ago' },
  { id: '6', name: 'Margaret Hamilton', email: 'margaret@vorzela.dev', role: 'Viewer', status: 'Active', projects: 1, lastActive: '5 days ago' },
  { id: '7', name: 'Donald Knuth', email: 'donald@vorzela.dev', role: 'Editor', status: 'Invited', projects: 6, lastActive: '1 week ago' },
  { id: '8', name: 'Barbara Liskov', email: 'barbara@vorzela.dev', role: 'Viewer', status: 'Active', projects: 3, lastActive: '1 week ago' },
]

const roleTone = {
  Owner: 'primary',
  Admin: 'soft',
  Editor: 'outline',
  Viewer: 'outline',
} as const

const statusTone = {
  Active: 'success',
  Invited: 'soft',
  Suspended: 'destructive',
} as const

const columns: AppColumnDef<Person, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => (
      <Badge variant={roleTone[row.original.role]}>{row.original.role}</Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={statusTone[row.original.status]}>{row.original.status}</Badge>
    ),
  },
  { accessorKey: 'projects', header: 'Projects' },
  { accessorKey: 'lastActive', header: 'Last active' },
]

const simpleCode = `import { SimpleDataTable } from '@vorzela/react-scss'
import type { AppColumnDef } from '@vorzela/react-scss'

const columns: AppColumnDef<Person, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
]

<SimpleDataTable
  data={people}
  columns={columns}
  searchable
  initialPageSize={5}
  pageSizeOptions={[5, 10]}
/>`

const fullCode = `import { DataTable } from '@vorzela/react-scss'

<DataTable
  data={people}
  columns={columns}
  enableRowSelection
  columnVisibilityToggle
  bulkActions={(rows) => (
    <Button variant="destructive" size="sm">
      Remove {rows.length}
    </Button>
  )}
/>`

export function TablesPage() {
  return (
    <>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>Tables</span>
        <h1 className={styles.heroTitle}>Dense data, calm surface.</h1>
        <p className={styles.heroLead}>
          Two table layers on TanStack Table v9: a lightweight searchable table
          for small datasets, and a full table with row selection, bulk actions
          and column visibility. Both are responsive and keyboard accessible.
        </p>
        <div className={styles.chipRow}>
          <span className={styles.chip}>Client-side by default</span>
          <span className={styles.chip}>Manual pagination ready</span>
          <span className={styles.chip}>No row libraries</span>
        </div>
      </header>

      <Section
        title="SimpleDataTable"
        lead="Search, sort and page without selection. Good for settings, tags and short admin lists."
      >
        <div className={styles.demo} style={{ padding: '1rem' }}>
          <SimpleDataTable
            data={people}
            columns={columns}
            searchable
            initialPageSize={5}
            pageSizeOptions={[5, 10]}
            searchPlaceholder="Search people…"
          />
        </div>
        <CodeBlock code={simpleCode} />
      </Section>

      <Section
        title="DataTable"
        lead="Adds a leading selection column, a bulk-action bar and a column visibility panel. Pagination and filtering can be delegated to the server."
      >
        <div className={styles.demo} style={{ padding: '1rem' }}>
          <DataTable
            data={people}
            columns={columns}
            enableRowSelection
            columnVisibilityToggle
            initialPageSize={5}
            pageSizeOptions={[5, 10]}
            searchPlaceholder="Search members…"
            bulkActions={(rows) => (
              <Button variant="destructive" size="sm">
                Remove {rows.length}
              </Button>
            )}
          />
        </div>
        <CodeBlock code={fullCode} />
      </Section>

      <Section
        title="Server pagination"
        lead="When the API paginates, pass the current state back to the server and feed the page count in. DataTable never assumes a client-side row model."
      >
        <CodeBlock
          language="tsx"
          code={`<DataTable
  data={response.rows}
  columns={columns}
  manualPagination
  manualSorting
  manualFiltering
  pageCount={Math.ceil(response.total / pageSize)}
  rowCount={response.total}
  initialPageSize={pageSize}
  onPaginationChange={(state) => {
    setPage(state.pageIndex + 1)
    setPageSize(state.pageSize)
  }}
  onSortingChange={(state) => {
    const next = state[0]
    setSortBy(next?.id ?? 'created_at')
    setSortDir(next?.desc ? 'desc' : 'asc')
  }}
  onGlobalFilterChange={(query) => {
    setSearch(query)
    setPage(1)
  }}
/>`}
        />
      </Section>

      <Section
        title="Patterns"
        lead="A few rules that keep tables readable when the data is not."
      >
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Align numbers right</h3>
            <p className={styles.cardText}>
              Numeric columns read faster right-aligned with tabular figures. Keep
              text columns left-aligned.
            </p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>One primary per row</h3>
            <p className={styles.cardText}>
              Put the row action in a trailing menu, not five inline buttons.
              Selection belongs in the leading column.
            </p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Reserve loading space</h3>
            <p className={styles.cardText}>
              Skeleton rows use the same column widths as real rows, so the table
              does not jump when data arrives.
            </p>
          </div>
        </div>
      </Section>
    </>
  )
}
