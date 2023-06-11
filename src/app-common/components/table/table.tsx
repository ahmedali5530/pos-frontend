import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable
} from "@tanstack/react-table";
import React, {FC, ReactNode, useEffect, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import _ from "lodash";
import {Loader} from "../loader/loader";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRefresh} from "@fortawesome/free-solid-svg-icons";
import {UseApiResult} from "../../../api/hooks/use.api";

interface ButtonProps {
  title?: ReactNode;
  html: ReactNode;
  className?: string;
  handler?: (
    payload: any,
    fetchData: () => void,
    setLoading: (state: boolean) => void,
    setRowSelect: (ids: {
      [index: number]: boolean
    }) => void
  ) => void;
}

interface TableComponentProps {
  columns: any;
  params?: any;
  sort?: any;
  buttons?: ButtonProps[];
  selectionButtons?: ButtonProps[];
  loaderLineItems?: number;
  loaderLines?: number;
  useLoadList: UseApiResult;
  setFilters?: (filters?: any) => void;
  globalSearch?: boolean;
}

export const TableComponent: FC<TableComponentProps> = ({
  columns, sort, buttons, selectionButtons, loaderLineItems, useLoadList,
  globalSearch, loaderLines
}) => {
  const {t} = useTranslation();

  const {
    handlePageChange,
    handleFilterChange,
    handlePageSizeChange: handleLimitChange,
    handleSortChange, handleSortModeChange,
    data,
    isFetching: loading,
    fetchData, fetch
  } = useLoadList;

  const [sorting, setSorting] = React.useState<SortingState>([]);

  // set initial sorting
  useEffect(() => {
    if (sort) {
      setSorting(sort);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if(sorting.length > 0) {
      handleSortChange!(sorting[0].id);
      handleSortModeChange!(sorting[0].desc ? 'desc' : 'asc');
    }
  }, [sorting]);

  const [{pageIndex, pageSize}, setPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState('');

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  useEffect(() => {
    handlePageChange!(pageIndex + 1);
    handleLimitChange!(pageSize);
  }, [pageIndex, pageSize]);

  useEffect(() => {
    handleFilterChange!({
      q: globalFilter
    });

  }, [globalFilter]);

  const table = useReactTable({
    data: data?.["hydra:member"]||[],
    pageCount: Math.ceil(data?.["hydra:totalItems"] as number / pageSize),
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
      pagination,
      rowSelection,
      globalFilter
    },
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    enableMultiSort: false,
    manualSorting: true,
    manualFiltering: true
  });

  const ids = useMemo(() => {
    // return table.getSelectedRowModel().rows.map(item => (item.original as any).uuid)

    return [];
  }, [rowSelection]);

  const [isLoading, setLoading] = useState(false);

  const renderButton = (button: ButtonProps) => {
    if (button.html) {
      return button.html;
    }
  };

  const pageSizes: { [key: string | number]: any } = {
    10: 10,
    20: 20,
    25: 25,
    50: 50,
    100: 100
  };

  return (
    <>
      <div className="grid my-5 grid-cols-12 g-0">
        {(globalSearch === undefined || globalSearch) && (
          <div className="col-span-3">
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => {
                setGlobalFilter(String(value))
              }}
              className="input w-full search-field"
              placeholder={t('Search in all columns') + '...'}
              type="search"
            />
          </div>
        )}
        <div className="col-span-9 flex justify-end">
          <div className="input-group">
            <button className="btn btn-secondary" onClick={fetchData}>
              <FontAwesomeIcon icon={faRefresh}/>
            </button>
            {Object.keys(rowSelection).length > 0 && (
              <>
                {selectionButtons?.map(button => (
                  <>{renderButton(button)}</>
                ))}
              </>
            )}
            <>
              {buttons?.map(button => (
                <>{renderButton(button)}</>
              ))}
            </>
          </div>
        </div>
      </div>

      {(loading || isLoading) ? (
        <div className="flex justify-center items-center">
          <Loader lines={loaderLines || 1} lineItems={loaderLineItems || 5}/>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-background">
            <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={Math.random() + headerGroup.id} id={Math.random() + headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    <div
                      {...{
                        className: header.column.getCanSort()
                          ? 'cursor-pointer select-none'
                          : '',
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: ' ▲',
                        desc: ' ▼',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
            </thead>
            <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={Math.random() + cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <nav className="input-group">
          <button
            className="btn btn-primary"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </button>
        </nav>
        &bull;
        <span className="flex items-center gap-1">
          <div>{t('Page')}</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} {t('of')}{' '}{table.getPageCount()}
          </strong>
        </span>
        &bull;{' '}
        {t('Go to page')}
        <span className="flex items-center gap-2">
          <select
            value={table.getState().pagination.pageIndex + 1}
            onChange={e => {
              table.setPageIndex(Number(e.target.value) - 1);
            }}
            className="w-auto form-control"
          >
          {_.range(0, table.getPageCount()).map(pageSize => (
            <option key={pageSize} value={pageSize + 1}>
              {pageSize + 1}
            </option>
          ))}
          </select>
        </span>
        &bull;
        <span className="flex items-center gap-2">
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value));
            }}
            className="w-auto form-control"
          >
          {Object.keys(pageSizes).map((pageSize: string | number) => (
            <option key={pageSize} value={pageSizes[pageSize]}>
              {t('Show')} {pageSize}
            </option>
          ))}
          </select> &bull; {t('Total records')} <strong>{data ? data["hydra:totalItems"] : 0}</strong>
        </span>
      </div>
    </>
  );
};

// A debounced input react component
export const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) => {
  const [value, setValue] = React.useState(initialValue)

  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return (
    <input {...props} value={value} onChange={e => setValue(e.target.value)}/>
  )
}
