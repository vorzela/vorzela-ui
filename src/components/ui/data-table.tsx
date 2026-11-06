import {
  flexRender,
  useTable,
  type ColumnVisibilityState,
  type PaginationState,
  type RowData,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  ChevronsUpDown,
  Columns3,
  Search,
  X,
} from 'lucide-react'
import type React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { For } from '~/components/utils/for'
import { Show } from '~/components/utils/show'
import { Checkbox } from '~/components/ui/checkbox'
import { appTableFeatures, type AppColumnDef } from '~/lib/table'
import { cx } from '~/lib/cx'
import styles from './data-table.module.scss'
import tableStyles from './simple-data-table.module.scss'

type ClassValueOrFn<TContext> = string | ((context: TContext) => string)

export interface DataTableRowClassContext<TData> {
  row: TData
  rowIndex: number
  selected: boolean
  isEven: boolean
}

export interface DataTableCellClassContext<TData>
  extends DataTableRowClassContext<TData> {
  columnId: string
}

interface DataTableColumnMeta<TData> {
  headerClass?: string
  cellClass?: ClassValueOrFn<DataTableCellClassContext<TData>>
}

export interface DataTableClasses<TData> {
  toolbar?: string
  searchWrap?: string
  searchInput?: string
  actions?: string
  tableShell?: string
  table?: string
  head?: string
  headerRow?: string
  headerCell?: string
  body?: string
  row?: ClassValueOrFn<DataTableRowClassContext<TData>>
  selectedRow?: ClassValueOrFn<DataTableRowClassContext<TData>>
  cell?: ClassValueOrFn<DataTableCellClassContext<TData>>
  emptyState?: string
  bulkBar?: string
  pagination?: string
}

export type DataTableVariant = 'compact' | 'comfortable' | 'minimal'

function resolveClassName<TContext>(
  value: ClassValueOrFn<TContext> | undefined,
  context: TContext,
) {
  return typeof value === 'function' ? value(context) : value
}

function getColumnMeta<TData>(column: { columnDef: { meta?: unknown } }) {
  return column.columnDef.meta as DataTableColumnMeta<TData> | undefined
}

export interface DataTableProps<TData extends RowData> {
  data: TData[]
  columns: AppColumnDef<TData, unknown>[]
  pagination?: boolean
  initialPageSize?: number
  pageSizeOptions?: number[]
  manualPagination?: boolean
  pageCount?: number
  rowCount?: number
  onPaginationChange?: (state: PaginationState) => void
  manualSorting?: boolean
  onSortingChange?: (state: SortingState) => void
  manualFiltering?: boolean
  onGlobalFilterChange?: (value: string) => void
  searchable?: boolean
  searchPlaceholder?: string
  variant?: DataTableVariant
  columnVisibilityToggle?: boolean
  enableRowSelection?: boolean
  onSelectionChange?: (rows: TData[]) => void
  bulkActions?: (selectedRows: TData[]) => React.ReactNode
  loading?: boolean
  skeletonRows?: number
  emptyMessage?: string
  toolbarActions?: React.ReactNode
  classes?: DataTableClasses<TData>
  className?: string
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' | false }) {
  return (
    <span className={tableStyles.sortIcon}>
      <Show when={direction === 'asc'}>
        <ChevronUp aria-hidden />
      </Show>
      <Show when={direction === 'desc'}>
        <ChevronDown aria-hidden />
      </Show>
      <Show when={direction === false}>
        <ChevronsUpDown aria-hidden />
      </Show>
    </span>
  )
}

interface ColVisProps {
  anchorRef: React.RefObject<HTMLButtonElement | null>
  columns: Array<{
    id: string
    columnDef: { header?: unknown }
    getCanHide: () => boolean
    getIsVisible: () => boolean
    toggleVisibility: (value?: boolean) => void
  }>
  onClose: () => void
}

function ColVisPanel({ anchorRef, columns, onClose }: ColVisProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: '0px', left: '0px' })

  useEffect(() => {
    const anchor = anchorRef.current
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    const panelWidth = 200
    const left = Math.min(rect.right - panelWidth, window.innerWidth - panelWidth - 8)
    setPosition({
      top: `${rect.bottom + 6}px`,
      left: `${Math.max(left, 8)}px`,
    })
  }, [anchorRef])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (panelRef.current?.contains(target)) return
      if (anchorRef.current?.contains(target)) return
      onClose()
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKey)
    }
  }, [anchorRef, onClose])

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-label="Toggle columns"
      style={position}
      className={styles.colPanel}
    >
      <p className={styles.colTitle}>Columns</p>
      <For each={columns}>
        {(column) =>
          column.id === '__select__' ? null : (
            <label key={column.id} className={styles.colOption}>
              <input
                type="checkbox"
                checked={column.getIsVisible()}
                onChange={(event) =>
                  column.toggleVisibility(event.currentTarget.checked)
                }
                className={styles.colCheck}
              />
              {String(column.columnDef.header ?? column.id)}
            </label>
          )
        }
      </For>
    </div>,
    document.body,
  )
}

/** Full data table: search, sorting, selection, column visibility and paging. */
export function DataTable<TData extends RowData>({
  data,
  columns,
  pagination,
  initialPageSize,
  pageSizeOptions,
  manualPagination,
  pageCount,
  rowCount,
  onPaginationChange,
  manualSorting,
  onSortingChange,
  manualFiltering,
  onGlobalFilterChange,
  searchable,
  searchPlaceholder,
  variant = 'comfortable',
  columnVisibilityToggle,
  enableRowSelection,
  onSelectionChange,
  bulkActions,
  loading,
  skeletonRows,
  emptyMessage,
  toolbarActions,
  classes,
  className,
}: DataTableProps<TData>) {
  const isSearchable = searchable !== false
  const isColVizEnabled = columnVisibilityToggle !== false
  const isPaginationEnabled = pagination !== false
  const skeletonCount = skeletonRows ?? 5

  const [searchInput, setSearchInput] = useState('')
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize ?? 10,
  })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({})
  const [showColViz, setShowColViz] = useState(false)

  const colVizBtnRef = useRef<HTMLButtonElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(debounceRef.current), [])

  const handleSearch = useCallback(
    (raw: string) => {
      setSearchInput(raw)
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        setGlobalFilter(raw)
        onGlobalFilterChange?.(raw)
      }, 300)
    },
    [onGlobalFilterChange],
  )

  const clearSearch = useCallback(() => {
    setSearchInput('')
    setGlobalFilter('')
    onGlobalFilterChange?.('')
  }, [onGlobalFilterChange])

  const allColumns = useMemo<AppColumnDef<TData, unknown>[]>(() => {
    if (!enableRowSelection) return columns

    const selectColumn: AppColumnDef<TData, unknown> = {
      id: '__select__',
      enableSorting: false,
      enableHiding: false,
      size: 48,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
          }
          onChange={(value) => table.toggleAllPageRowsSelected(value)}
          aria-label="Select all rows on this page"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={(value) => row.toggleSelected(value)}
          aria-label={`Select row ${row.id}`}
        />
      ),
    }

    return [selectColumn, ...columns]
  }, [enableRowSelection, columns])

  const handleSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      setSorting((previous) => {
        const next = typeof updater === 'function' ? updater(previous) : updater
        onSortingChange?.(next)
        return next
      })
    },
    [onSortingChange],
  )

  const handlePaginationChange = useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      setPaginationState((previous) => {
        const next = typeof updater === 'function' ? updater(previous) : updater
        onPaginationChange?.(next)
        return next
      })
    },
    [onPaginationChange],
  )

  const table = useTable({
    features: appTableFeatures,
    data,
    columns: allColumns,
    state: {
      sorting,
      pagination: paginationState,
      rowSelection,
      columnVisibility,
      globalFilter,
    },
    enableRowSelection: enableRowSelection ?? false,
    manualPagination: manualPagination ?? false,
    manualSorting: manualSorting ?? false,
    manualFiltering: manualFiltering ?? false,
    ...(pageCount !== undefined ? { pageCount } : {}),
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
    autoResetPageIndex: true,
  })

  const selectedRows = useMemo(
    () => table.getSelectedRowModel().rows.map((row) => row.original),
    [table],
  )
  const selectedCount = selectedRows.length

  useEffect(() => {
    onSelectionChange?.(selectedRows)
  }, [selectedRows, onSelectionChange])

  const totalFiltered = manualPagination
    ? (rowCount ?? 0)
    : table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = paginationState
  const pageStart = pageIndex * pageSize + 1
  const pageEnd = Math.min(pageStart + pageSize - 1, totalFiltered)
  const pageSizes = pageSizeOptions ?? [10, 25, 50, 100]
  const visibleLeafColumns = table.getAllLeafColumns().filter((column) => column.getIsVisible())
  const skeletonIndices = useMemo(
    () => Array.from({ length: skeletonCount }, (_, index) => index),
    [skeletonCount],
  )

  return (
    <div className={cx(tableStyles.root, className)} data-variant={variant}>
      <div className={cx(tableStyles.toolbar, classes?.toolbar)}>
        {isSearchable ? (
          <div className={cx(tableStyles.searchWrap, classes?.searchWrap)}>
            <span className={tableStyles.searchIcon}>
              <Search aria-hidden />
            </span>
            <input
              type="search"
              value={searchInput}
              onChange={(event) => handleSearch(event.currentTarget.value)}
              placeholder={searchPlaceholder ?? 'Search…'}
              aria-label={searchPlaceholder ?? 'Search'}
              className={cx(tableStyles.search, classes?.searchInput)}
            />
            {searchInput.length > 0 ? (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className={tableStyles.clear}
              >
                <X aria-hidden />
              </button>
            ) : null}
          </div>
        ) : null}

        <div className={cx(styles.toolbarActions, classes?.actions)}>
          {isColVizEnabled ? (
            <>
              <button
                ref={colVizBtnRef}
                type="button"
                aria-expanded={showColViz}
                aria-haspopup="dialog"
                onClick={() => setShowColViz((value) => !value)}
                className={cx(
                  styles.columnsButton,
                  showColViz && styles.columnsButtonActive,
                )}
              >
                <Columns3 aria-hidden />
                <span className={styles.columnsLabel}>Columns</span>
              </button>

              {showColViz ? (
                <ColVisPanel
                  anchorRef={colVizBtnRef}
                  columns={table.getAllLeafColumns()}
                  onClose={() => setShowColViz(false)}
                />
              ) : null}
            </>
          ) : null}

          {toolbarActions}
        </div>
      </div>

      {enableRowSelection && selectedCount > 0 ? (
        <div className={cx(styles.bulkBar, classes?.bulkBar)}>
          <div className={styles.bulkInfo}>
            <span className={styles.bulkCount}>
              {selectedCount} row{selectedCount === 1 ? '' : 's'} selected
            </span>
            <button
              type="button"
              onClick={() => setRowSelection({})}
              className={styles.clearSelection}
            >
              Clear selection
            </button>
          </div>

          {bulkActions ? (
            <div className={styles.bulkActions}>{bulkActions(selectedRows)}</div>
          ) : null}
        </div>
      ) : null}

      <div className={cx(tableStyles.shell, classes?.tableShell)}>
        <table className={cx(tableStyles.table, classes?.table)}>
          <thead className={cx(tableStyles.head, classes?.head)}>
            <For each={table.getHeaderGroups()}>
              {(headerGroup) => (
                <tr key={headerGroup.id} className={classes?.headerRow}>
                  <For each={headerGroup.headers}>
                    {(header) => {
                      const columnMeta = getColumnMeta<TData>(header.column)
                      const canSort = header.column.getCanSort()
                      const sorted = header.column.getIsSorted()

                      return (
                        <th
                          key={header.id}
                          colSpan={header.colSpan}
                          scope="col"
                          aria-sort={
                            sorted === 'asc'
                              ? 'ascending'
                              : sorted === 'desc'
                                ? 'descending'
                                : canSort
                                  ? 'none'
                                  : undefined
                          }
                          className={cx(
                            tableStyles.headerCell,
                            columnMeta?.headerClass,
                            classes?.headerCell,
                          )}
                          style={
                            header.column.columnDef.size
                              ? { width: `${header.column.columnDef.size}px` }
                              : undefined
                          }
                        >
                          <Show when={!header.isPlaceholder}>
                            {canSort ? (
                              <button
                                type="button"
                                className={tableStyles.sortButton}
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                                <SortIcon direction={sorted} />
                              </button>
                            ) : (
                              <span>
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                              </span>
                            )}
                          </Show>
                        </th>
                      )
                    }}
                  </For>
                </tr>
              )}
            </For>
          </thead>

          <tbody className={cx(tableStyles.body, classes?.body)}>
            {loading ? (
              <For each={skeletonIndices}>
                {(index) => (
                  <tr key={`skeleton-${index}`} className={tableStyles.row}>
                    <For each={visibleLeafColumns}>
                      {(column) => (
                        <td key={column.id} className={tableStyles.cell}>
                          <div className={tableStyles.skeleton} />
                        </td>
                      )}
                    </For>
                  </tr>
                )}
              </For>
            ) : table.getRowModel().rows.length > 0 ? (
              <For each={table.getRowModel().rows}>
                {(row) => {
                  const rowContext: DataTableRowClassContext<TData> = {
                    row: row.original,
                    rowIndex: row.index,
                    selected: row.getIsSelected(),
                    isEven: row.index % 2 === 0,
                  }

                  return (
                    <tr
                      key={row.id}
                      className={cx(
                        tableStyles.row,
                        rowContext.selected && styles.selected,
                        resolveClassName(classes?.row, rowContext),
                        rowContext.selected &&
                          resolveClassName(classes?.selectedRow, rowContext),
                      )}
                    >
                      <For each={row.getVisibleCells()}>
                        {(cell) => {
                          const cellContext: DataTableCellClassContext<TData> = {
                            ...rowContext,
                            columnId: cell.column.id,
                          }
                          const columnMeta = getColumnMeta<TData>(cell.column)

                          return (
                            <td
                              key={cell.id}
                              className={cx(
                                tableStyles.cell,
                                resolveClassName(classes?.cell, cellContext),
                                resolveClassName(columnMeta?.cellClass, cellContext),
                              )}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </td>
                          )
                        }}
                      </For>
                    </tr>
                  )
                }}
              </For>
            ) : (
              <tr>
                <td
                  colSpan={visibleLeafColumns.length}
                  className={cx(tableStyles.empty, classes?.emptyState)}
                >
                  {emptyMessage ?? 'No results found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isPaginationEnabled ? (
        <div className={cx(tableStyles.pagination, classes?.pagination)}>
          <div className={tableStyles.info}>
            {totalFiltered > 0 ? (
              <span>
                Showing{' '}
                <span className={tableStyles.strong}>
                  {pageStart}–{pageEnd}
                </span>{' '}
                of <span className={tableStyles.strong}>{totalFiltered}</span>
              </span>
            ) : null}

            <label className={tableStyles.pageSize}>
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(event) =>
                  table.setPageSize(Number(event.currentTarget.value))
                }
                className={tableStyles.select}
              >
                <For each={pageSizes}>
                  {(size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  )}
                </For>
              </select>
            </label>
          </div>

          <div className={tableStyles.pages}>
            <button
              type="button"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.firstPage()}
              className={tableStyles.pageButton}
              aria-label="First page"
            >
              <ChevronsLeft aria-hidden />
            </button>
            <button
              type="button"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              className={tableStyles.pageButton}
              aria-label="Previous page"
            >
              <ChevronLeft aria-hidden />
            </button>

            <For each={pageNumbers(table.getPageCount(), pageIndex)}>
              {(item, index) =>
                item === '…' ? (
                  <span key={`page-${index}`} className={tableStyles.ellipsis}>
                    <span aria-hidden>…</span>
                    <span className="vz-sr-only">More pages</span>
                  </span>
                ) : (
                  <button
                    key={`page-${index}`}
                    type="button"
                    onClick={() => table.setPageIndex(Number(item) - 1)}
                    aria-label={`Page ${item}`}
                    aria-current={
                      pageIndex === Number(item) - 1 ? 'page' : undefined
                    }
                    className={cx(
                      tableStyles.pageNumber,
                      pageIndex === Number(item) - 1 && tableStyles.pageNumberActive,
                    )}
                  >
                    {item}
                  </button>
                )
              }
            </For>

            <button
              type="button"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              className={tableStyles.pageButton}
              aria-label="Next page"
            >
              <ChevronRight aria-hidden />
            </button>
            <button
              type="button"
              disabled={!table.getCanNextPage()}
              onClick={() => table.lastPage()}
              className={tableStyles.pageButton}
              aria-label="Last page"
            >
              <ChevronsRight aria-hidden />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function pageNumbers(total: number, current: number): (string | '…')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => String(index + 1))
  }
  const pages: (string | '…')[] = []
  const add = (page: number) => pages.push(String(page))
  add(1)
  if (current > 3) pages.push('…')
  for (let page = Math.max(2, current); page <= Math.min(total - 1, current + 2); page += 1) {
    add(page)
  }
  if (current < total - 3) pages.push('…')
  add(total)
  return pages
}
