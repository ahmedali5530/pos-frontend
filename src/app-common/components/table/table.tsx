import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable
} from "@tanstack/react-table";
import React, { ChangeEventHandler, FC, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import _ from "lodash";
import {Loader} from "../loader/loader";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faClose, faRefresh, faSearch } from "@fortawesome/free-solid-svg-icons";
import {UseApiResult} from "../../../api/hooks/use.api";
import { Input } from "../input/input";
import { ReactSelect } from "../input/custom.react.select";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from 'yup'
import { getErrorClass, hasErrors } from "../../../lib/error/error";
import classNames from "classnames";


interface ButtonProps {
  title?: ReactNode;
  html: ReactNode;
}

interface TableComponentProps {
  columns: any;
  sort?: SortingState;
  buttons?: ButtonProps[];
  selectionButtons?: ButtonProps[];
  loaderLineItems?: number;
  loaderLines?: number;
  useLoadList: UseApiResult;
  dataKey?: string;
  totalKey?: string;
  enableSearch?: boolean;
}


export const TableComponent: FC<TableComponentProps> = ({
  columns, sort, buttons, selectionButtons, loaderLineItems, useLoadList,
  loaderLines, dataKey, totalKey, enableSearch
}) => {
  const {t} = useTranslation();

  const {
    handlePageChange,
    handleFilterChange, filters,
    handlePageSizeChange: handleLimitChange,
    handleSortChange, handleSortModeChange,
    data,
    isFetching: loading,
    fetchData, fetch,
    resetFilters
  } = useLoadList;

  const [sorting, setSorting] = useState<SortingState>([]);

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

  const table = useReactTable({
    data: data?.[dataKey || "hydra:member"]||[],
    pageCount: Math.ceil(data?.[totalKey || "hydra:totalItems"] as number / pageSize),
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
      pagination,
      rowSelection
    },
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

  const [columnFilter, setColumnFilter] = useState({
    column: '',
    orgColumn: '',
    value: ''
  });

  const {handleSubmit, control, setValue, formState: {errors}} = useForm({
    resolver: yupResolver(yup.object({
      column: yup.object({
        label: yup.string(),
        value: yup.string()
      }).required(),
      // value: yup.string().required()
    }))
  });
  const filterOptions = table.getAllColumns().filter(column => column.getCanFilter()).map(column => ({label: column.columnDef.header, value: column.id}));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if(!loaded) {
      setValue('column', filterOptions[0]) // set first column as default
      setLoaded(true)
    }
  }, [table.getAllColumns()])

  const handleColumnFilter = (values: any) => {
    if(filters[values.column.value] === values.value){
      fetchData();
    }else {
      handleFilterChange({
        ...filters,
        [columnFilter.column]: undefined, // remove previous filter
        [(values.column.value).replace('_', '.')]: values.value // replace _ with . to match the filters with API Platform
      });

      setColumnFilter({
        column: values.column.value.replace('_', '.'),
        orgColumn: values.column.value,
        value: values.value
      });
    }
  }

  return (
    <>
      <div className="my-5 flex justify-between">
        <div className="inline-flex justify-start">
          {enableSearch !== false && (
            <form className="input-group" onSubmit={handleSubmit(handleColumnFilter)}>
                <Controller
                  render={({field}) => (
                    <Input
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Search..."
                      hasError={hasErrors(_.get(errors.value, 'message'))}
                      type="search"
                      className="w-72"
                    />
                  )}
                  name="value"
                  control={control}
                />

                <Controller
                  name="column"
                  render={({field}) => (
                    <ReactSelect
                      onChange={field.onChange}
                      options={filterOptions}
                      className={
                        classNames(
                          "rs-__container w-36",
                          getErrorClass(_.get(errors.column, 'message'))
                        )
                      }
                      value={field.value}
                    />
                  )}
                  control={control}
                />
                <button className="btn btn-primary w-12" type="submit">
                  <FontAwesomeIcon icon={faSearch} />
                </button>
                {Object.keys(filters).length > 0 && (
                  <button className="btn btn-danger w-12" type="button" onClick={resetFilters}>
                    <FontAwesomeIcon icon={faClose} />
                  </button>
                )}
              </form>
          )}
        </div>
        <div className="inline-flex justify-end">
          <div className="input-group">
            <button className="btn btn-secondary w-12" onClick={fetchData}>
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
          </select> &bull; {t('Total records')} <strong>{data ? data[totalKey || "hydra:totalItems"] : 0}</strong>
        </span>
      </div>
    </>
  );
};
