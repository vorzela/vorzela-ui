import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { DataTable } from '~/components/ui/data-table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/components/ui/pagination'
import { SimpleDataTable } from '~/components/ui/simple-data-table'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import type { AppColumnDef } from '~/lib/table'

import styles from '../docs.module.scss'

type Person = {
  id: string
  name: string
  email: string
  role: 'Owner' | 'Admin' | 'Editor' | 'Viewer'
  status: 'Active' | 'Invited' | 'Suspended'
  projects: number
}

const people: Person[] = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@vorzela.dev', role: 'Owner', status: 'Active', projects: 12 },
  { id: '2', name: 'Grace Hopper', email: 'grace@vorzela.dev', role: 'Admin', status: 'Active', projects: 9 },
  { id: '3', name: 'Alan Turing', email: 'alan@vorzela.dev', role: 'Editor', status: 'Invited', projects: 4 },
  { id: '4', name: 'Katherine Johnson', email: 'katherine@vorzela.dev', role: 'Admin', status: 'Active', projects: 15 },
  { id: '5', name: 'Linus Torvalds', email: 'linus@vorzela.dev', role: 'Editor', status: 'Suspended', projects: 2 },
]

const columns: AppColumnDef<Person, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => <Badge variant="soft">{row.original.role}</Badge>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.status === 'Active' ? 'success' : 'outline'}>
        {row.original.status}
      </Badge>
    ),
  },
]

export const tablesPreviews = {
  'simple-data-table': (
    <SimpleDataTable
      data={people}
      columns={columns}
      searchable
      initialPageSize={3}
      pageSizeOptions={[3, 5]}
    />
  ),
  'data-table': (
    <DataTable
      data={people}
      columns={columns}
      enableRowSelection
      columnVisibilityToggle
      initialPageSize={3}
      pageSizeOptions={[3, 5]}
      bulkActions={(rows) => (
        <Button variant="destructive" size="sm">
          Remove {rows.length}
        </Button>
      )}
    />
  ),
  'table': (
    <div className={styles.card}>
      <Table>
        <TableCaption>Recent invoices</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>INV-1042</TableCell>
            <TableCell><Badge variant="success">Paid</Badge></TableCell>
            <TableCell>$240.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>INV-1043</TableCell>
            <TableCell><Badge variant="soft">Open</Badge></TableCell>
            <TableCell>$240.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>INV-1044</TableCell>
            <TableCell><Badge variant="destructive">Failed</Badge></TableCell>
            <TableCell>$240.00</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
  'pagination': (
    <Pagination>
      <PaginationContent>
        <PaginationItem><PaginationPrevious /></PaginationItem>
        <PaginationItem><PaginationLink isActive>1</PaginationLink></PaginationItem>
        <PaginationItem><PaginationLink>2</PaginationLink></PaginationItem>
        <PaginationItem><PaginationLink>3</PaginationLink></PaginationItem>
        <PaginationItem><PaginationEllipsis /></PaginationItem>
        <PaginationItem><PaginationLink>12</PaginationLink></PaginationItem>
        <PaginationItem><PaginationNext /></PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
}
