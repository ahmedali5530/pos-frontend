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
import {useLoadList} from "../../../api/hooks/use.load.list";
import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {useAlert} from "react-alert";
import _ from "lodash";

interface ButtonProps {
  title: ReactNode;
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
  url: string;
  columns: any;
  params?: any;
  sort?: any;
  buttons?: ButtonProps[];
  selectionButtons?: ButtonProps[];
}

export const TableComponent: FC<TableComponentProps> = ({
  url, columns, params, sort, buttons, selectionButtons
}) => {
  const {t} = useTranslation();
  const alert = useAlert();

  const [state, action] = useLoadList(url);

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

  const loadList = async () => {
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

    action.loadList(newParams);
  };

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
    return (
      <button disabled={isLoading} className={button.className} onClick={() => onClick(button)}>{button.title}</button>
    );
  };

  return (
    <>
      <div className="tw-relative table-responsive">
        {(state.isLoading || isLoading) && (
          <div className="
          tw-absolute tw-top-0 tw-left-0 tw-bottom-0 tw-right-0
          tw-h-[100%] tw-flex tw-items-center tw-justify-center tw-z-10
          tw-bg-white/80 tw-font-bold tw-uppercase
          ">
            <div className="tw-bg-white tw-p-3 tw-rounded tw-shadow-xl tw-border tw-border-solid tw-border-gray-200">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">{t('Loading')}...</span>
              </div>
            </div>
          </div>
        )}
        <div className="row tw-my-5 g-0">
          <div className="col">
            <div className="btn-group">
              <button className="btn btn-outline-primary" onClick={() => loadList()}>
                <i className="bi bi-arrow-clockwise"></i>
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

          <div className="col-3">
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              className="form-control"
              placeholder={t('Search in all columns') + '...'}
              type="search"
            />
          </div>
        </div>
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
      </div>
      <div className="d-flex align-items-center gap-2 mt-3 tw-flex-wrap">
        <nav>
          <ul className="pagination mb-0">
            <li className={
              classNames(
                "page-item",
                !table.getCanPreviousPage() && 'disabled'
              )
            }>
              <button
                className="page-link"
                onClick={() => table.setPageIndex(0)}
              >
                {'<<'}
              </button>
            </li>
            <li className={
              classNames(
                "page-item",
                !table.getCanPreviousPage() && 'disabled'
              )
            }>
              <button
                className="page-link"
                onClick={() => table.previousPage()}
              >
                {'<'}
              </button>
            </li>
            <li className={
              classNames(
                "page-item",
                !table.getCanNextPage() && 'disabled'
              )
            }>
              <button
                className="page-link"
                onClick={() => table.nextPage()}
              >
                {'>'}
              </button>
            </li>
            <li className={
              classNames(
                "page-item",
                !table.getCanNextPage() && 'disabled'
              )
            }>
              <button
                className="page-link"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              >
                {'>>'}
              </button>
            </li>
          </ul>
        </nav>
        &bull;
        <span className="d-flex align-items-center gap-1">
          <div>{t('Page')}</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} {t('of')}{' '}{table.getPageCount()}
          </strong>
        </span>
        &bull;{' '}
        {t('Go to page')}
        <span className="d-flex align-items-center gap-2">
          <select
            value={table.getState().pagination.pageIndex + 1}
            onChange={e => {
              table.setPageIndex(Number(e.target.value) - 1)
            }}
            className="w-auto"
          >
          {_.range(0, table.getPageCount()).map(pageSize => (
            <option key={pageSize} value={pageSize + 1}>
              {pageSize + 1}
            </option>
          ))}
          </select>
        </span>
        &bull;
        <span className="d-flex align-items-center gap-2">
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value))
            }}
            className="w-auto"
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
function DebouncedInput({
                          value: initialValue,
                          onChange,
                          debounce = 500,
                          ...props
                        }: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
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
