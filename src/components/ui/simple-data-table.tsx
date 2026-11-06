import {
  flexRender,
  useTable,
  type PaginationState,
  type RowData,
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
  Search,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { For } from '~/components/utils/for'
import { Show } from '~/components/utils/show'
import { appTableFeatures, type AppColumnDef } from '~/lib/table'
import { cx } from '~/lib/cx'
import styles from './simple-data-table.module.scss'

type ClassValueOrFn<TContext> = string | ((context: TContext) => string)

export interface SimpleDataTableRowClassContext<TData> {
  row: TData
  rowIndex: number
  isEven: boolean
}

export interface SimpleDataTableCellClassContext<TData>
  extends SimpleDataTableRowClassContext<TData> {
  columnId: string
}

interface SimpleDataTableColumnMeta<TData> {
  headerClass?: string
  cellClass?: ClassValueOrFn<SimpleDataTableCellClassContext<TData>>
}

export interface SimpleDataTableClasses<TData> {
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
  row?: ClassValueOrFn<SimpleDataTableRowClassContext<TData>>
  cell?: ClassValueOrFn<SimpleDataTableCellClassContext<TData>>
  emptyState?: string
  pagination?: string
}

export type SimpleDataTableVariant = 'compact' | 'comfortable' | 'minimal'

function resolveClassName<TContext>(
  value: ClassValueOrFn<TContext> | undefined,
  context: TContext,
) {
  return typeof value === 'function' ? value(context) : value
}

function getColumnMeta<TData>(column: { columnDef: { meta?: unknown } }) {
  return column.columnDef.meta as SimpleDataTableColumnMeta<TData> | undefined
}

export interface SimpleDataTableProps<TData extends RowData> {
  data: TData[]
  columns: AppColumnDef<TData, unknown>[]
  searchable?: boolean
  searchPlaceholder?: string
  variant?: SimpleDataTableVariant
  pagination?: boolean
  initialPageSize?: number
  pageSizeOptions?: number[]
  loading?: boolean
  skeletonRows?: number
  emptyMessage?: string
  toolbarActions?: React.ReactNode
  classes?: SimpleDataTableClasses<TData>
  className?: string
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' | false }) {
  return (
    <span className={styles.sortIcon}>
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

/** Lightweight client-side data table with search, sorting and pagination. */
export function SimpleDataTable<TData extends RowData>({
  data,
  columns,
  searchable,
  searchPlaceholder,
  variant = 'comfortable',
  pagination,
  initialPageSize,
  pageSizeOptions,
  loading,
  skeletonRows,
  emptyMessage,
  toolbarActions,
  classes,
  className,
}: SimpleDataTableProps<TData>) {
  const isSearchable = searchable !== false
  const isPaginationEnabled = pagination !== false
  const skeletonCount = skeletonRows ?? 4
  const pageSizes = pageSizeOptions ?? [10, 25, 50]

  const [searchInput, setSearchInput] = useState('')
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize ?? 10,
  })
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(debounceRef.current), [])

  const handleSearch = useCallback((raw: string) => {
    setSearchInput(raw)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setGlobalFilter(raw)
      setPaginationState((state) => ({ ...state, pageIndex: 0 }))
    }, 300)
  }, [])

  const clearSearch = useCallback(() => {
    setSearchInput('')
    setGlobalFilter('')
    setPaginationState((state) => ({ ...state, pageIndex: 0 }))
  }, [])

  const table = useTable({
    features: appTableFeatures,
    data,
    columns,
    state: { sorting, pagination: paginationState, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPaginationState,
    autoResetPageIndex: true,
  })

  const totalFiltered = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = paginationState
  const pageStart = pageIndex * pageSize + 1
  const pageEnd = Math.min(pageStart + pageSize - 1, totalFiltered)
  const visibleLeafColumns = table.getAllLeafColumns().filter((column) => column.getIsVisible())
  const skeletonIndices = useMemo(
    () => Array.from({ length: skeletonCount }, (_, index) => index),
    [skeletonCount],
  )

  return (
    <div
      className={cx(styles.root, className)}
      data-variant={variant}
    >
      {isSearchable || toolbarActions ? (
        <div className={cx(styles.toolbar, classes?.toolbar)}>
          {isSearchable ? (
            <div className={cx(styles.searchWrap, classes?.searchWrap)}>
              <span className={styles.searchIcon}>
                <Search aria-hidden />
              </span>
              <input
                type="search"
                value={searchInput}
                onChange={(event) => handleSearch(event.currentTarget.value)}
                placeholder={searchPlaceholder ?? 'Search…'}
                aria-label={searchPlaceholder ?? 'Search'}
                className={cx(styles.search, classes?.searchInput)}
              />
              {searchInput.length > 0 ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className={styles.clear}
                >
                  <X aria-hidden />
                </button>
              ) : null}
            </div>
          ) : null}

          {toolbarActions ? (
            <div className={cx(styles.actions, classes?.actions)}>
              {toolbarActions}
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        className={cx(styles.shell, classes?.tableShell)}
        tabIndex={0}
        role="region"
        aria-label="Table"
      >
        <table className={cx(styles.table, classes?.table)}>
          <thead className={cx(styles.head, classes?.head)}>
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
                            styles.headerCell,
                            columnMeta?.headerClass,
                            classes?.headerCell,
                          )}
                        >
                          <Show when={!header.isPlaceholder}>
                            {canSort ? (
                              <button
                                type="button"
                                className={styles.sortButton}
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

          <tbody className={cx(styles.body, classes?.body)}>
            {loading ? (
              <For each={skeletonIndices}>
                {(index) => (
                  <tr key={`skeleton-${index}`} className={styles.row}>
                    <For each={visibleLeafColumns}>
                      {(column) => (
                        <td key={column.id} className={styles.cell}>
                          <div className={styles.skeleton} />
                        </td>
                      )}
                    </For>
                  </tr>
                )}
              </For>
            ) : table.getRowModel().rows.length > 0 ? (
              <For each={table.getRowModel().rows}>
                {(row) => {
                  const rowContext: SimpleDataTableRowClassContext<TData> = {
                    row: row.original,
                    rowIndex: row.index,
                    isEven: row.index % 2 === 0,
                  }

                  return (
                    <tr
                      key={row.id}
                      className={cx(
                        styles.row,
                        resolveClassName(classes?.row, rowContext),
                      )}
                    >
                      <For each={row.getVisibleCells()}>
                        {(cell) => {
                          const cellContext: SimpleDataTableCellClassContext<TData> = {
                            ...rowContext,
                            columnId: cell.column.id,
                          }
                          const columnMeta = getColumnMeta<TData>(cell.column)

                          return (
                            <td
                              key={cell.id}
                              className={cx(
                                styles.cell,
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
                  className={cx(styles.empty, classes?.emptyState)}
                >
                  {emptyMessage ?? 'No results found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isPaginationEnabled ? (
        <div className={cx(styles.pagination, classes?.pagination)}>
          <div className={styles.info}>
            {totalFiltered > 0 ? (
              <span>
                Showing{' '}
                <span className={styles.strong}>
                  {pageStart}–{pageEnd}
                </span>{' '}
                of <span className={styles.strong}>{totalFiltered}</span>
              </span>
            ) : null}

            <label className={styles.pageSize}>
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(event) =>
                  table.setPageSize(Number(event.currentTarget.value))
                }
                className={styles.select}
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

          <div className={styles.pages}>
            <button
              type="button"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.firstPage()}
              className={styles.pageButton}
              aria-label="First page"
            >
              <ChevronsLeft aria-hidden />
            </button>
            <button
              type="button"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              className={styles.pageButton}
              aria-label="Previous page"
            >
              <ChevronLeft aria-hidden />
            </button>

            <For each={pageNumbers(table.getPageCount(), pageIndex)}>
              {(item, index) =>
                item === '…' ? (
                  <span key={`page-${index}`} className={styles.ellipsis}>
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
                      styles.pageNumber,
                      pageIndex === Number(item) - 1 && styles.pageNumberActive,
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
              className={styles.pageButton}
              aria-label="Next page"
            >
              <ChevronRight aria-hidden />
            </button>
            <button
              type="button"
              disabled={!table.getCanNextPage()}
              onClick={() => table.lastPage()}
              className={styles.pageButton}
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
