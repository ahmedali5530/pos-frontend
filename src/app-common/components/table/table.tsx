import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable
} from "@tanstack/react-table";
import React, {FC, ReactNode, useCallback, useEffect, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import _ from "lodash";
import {Loader} from "../loader/loader";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";

interface ButtonProps {
  title?: ReactNode;
  html?: ReactNode;
  className?: string;
  handler: (
    payload: any,
    loadList: () => void,
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
  useLoadList: any;
  setFilters?: (filters?: any) => void;
  globalSearch?: boolean;
}

export const TableComponent: FC<TableComponentProps> = ({
  columns, params, sort, buttons, selectionButtons, loaderLineItems, useLoadList, setFilters,
  globalSearch
}) => {
  const {t} = useTranslation();

  const [state, action] = useLoadList;

  const [sorting, setSorting] = React.useState<SortingState>([]);

  useEffect(() => {
    if (sort) {
      setSorting(sort);
    }
  }, [sort]);
  const [{pageIndex, pageSize}, setPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState('');

  const loadList = useCallback(async () => {
    const newParams = {
      ...params,
      limit: pageSize,
      offset: pageIndex * pageSize,
    };

    if (sorting.length > 0) {
      newParams.orderBy = sorting[0].id;
      newParams.orderMode = sorting[0].desc ? 'desc' : 'asc';
    }

    if (globalFilter) {
      newParams.q = globalFilter;
    }

    if(setFilters){
      setFilters(newParams);
    }

    action.loadList(newParams);
  }, [params, pageSize, pageIndex, sorting, globalFilter]);

  useEffect(() => {
    loadList();
  }, [pageSize, pageIndex, sorting, globalFilter]);

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data: state.list,
    pageCount: Math.ceil(state.total / pageSize),
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
    return table.getSelectedRowModel().rows.map(item => (item.original as any).uuid)
  }, [rowSelection]);

  const [isLoading, setLoading] = useState(false);

  const onClick = async (button: ButtonProps) => {
    button.handler(ids, loadList, setLoading, setRowSelection);
  };

  const renderButton = (button: ButtonProps) => {
    if(button.html){
      return button.html;
    }

    return (
      <button disabled={isLoading} className={button.className} onClick={() => onClick(button)}>{button.title}</button>
    );
  };

  return (
    <>
      <div className="table-responsive">
        <div className="grid my-5 grid-cols-12 g-0">
          <div className="col-span-9">
            <div className="input-group">
              <button className="btn btn-secondary" onClick={() => loadList()}>
                <FontAwesomeIcon icon={faRefresh} />
              </button>
              {Object.keys(rowSelection).length > 0 ? (
                <>
                  {selectionButtons?.map(button => (
                    <>{renderButton(button)}</>
                  ))}
                </>
              ) : (
                <>
                  {buttons?.map(button => (
                    <>{renderButton(button)}</>
                  ))}
                </>
              )}
            </div>
          </div>

          {(globalSearch === undefined || globalSearch) && (
            <div className="col-span-3">
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(String(value))}
                className="input w-full"
                placeholder={t('Search in all columns') + '...'}
                type="search"
              />
            </div>
          )}
        </div>

        {(state.isLoading || isLoading) ? (
          <div className="flex justify-center items-center">
            <Loader lines={pageSize} lineItems={loaderLineItems || 5}/>
          </div>
        ) : (
          <table className="table table-hover">
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
        )}

      </div>
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
              table.setPageIndex(Number(e.target.value) - 1)
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
              table.setPageSize(Number(e.target.value))
            }}
            className="w-auto form-control"
          >
          {[10, 20, 25, 50, 100, 500].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              {t('Show')} {pageSize}
            </option>
          ))}
          </select> &bull; {t('Total records')} <strong>{state.total}</strong>
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
