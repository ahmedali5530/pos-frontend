import {useState} from 'react';
import {useQuery, useQueryClient, UseQueryOptions, UseQueryResult} from '@tanstack/react-query';
import {jsonRequest} from "../request/request";
import {QueryString} from "../../lib/location/query.string";
import {notify} from "../../app-common/components/confirm/notification";

type Filters = Record<string, any>;
type Sort = string;
type SortMode = 'asc' | 'desc';

export interface UseApiResult<T = any> {
  data: T | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  filters: Filters;
  sort: Sort;
  sortMode: SortMode,
  page: number;
  pageSize: number;
  handleFilterChange: (newFilters: Filters) => void;
  handleSortChange: (newSort: Sort) => void;
  handleSortModeChange: (newSortMode: SortMode) => void;
  handlePageChange: (newPage: number) => void;
  handlePageSizeChange: (newPageSize: number) => void;
  fetchData: () => void;
  fetch: () => void;
  resetFilters: () => void;
}

function useApi<T>(
  key: string,
  url: string,
  initialFilters: Filters = {},
  initialSort: Sort = '',
  initialSortMode: SortMode = 'asc',
  initialPage: number = 1,
  initialPageSize: number = 10,
  fetchOptions?: any,
  useApiOptions?: any
): UseApiResult<T> {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [sort, setSort] = useState<Sort>(initialSort);
  const [sortMode, setSortMode] = useState<SortMode>(initialSortMode);
  const [page, setPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  const queryClient = useQueryClient();

  const fetchFilteredData = async (): Promise<T> => {
    let query: any = {
      ...filters,
      page: page,
      itemsPerPage: pageSize
    };
    if (sort) {
      query['order'] = {
        [sort]: sortMode
      }
    }

    const search = QueryString.stringify(query);
    const response = await jsonRequest(`${url}?${search}`, {
      method: 'GET',
      ...fetchOptions
    });

    if (!response.ok) {
      notify({
        type: 'error',
        title: `There was some error while fetching the ${key}`
      })
      throw new Error(`There was some error while fetching the ${key}`);
    }
    return response.json();
  };

  const {
    data,
    isLoading,
    isError,
    isFetching,
    error,
    refetch,
  }: UseQueryResult<T> = useQuery([key, filters, sort, sortMode, page, pageSize], fetchFilteredData, {
    refetchOnWindowFocus: false,
    networkMode: 'always',
    ...useApiOptions,
  });

  const resetFilters = () => {
    setFilters({});
    setPage(1);
  }

  const handleFilterChange = (newFilters: Filters): void => {
    setFilters({...filters, ...newFilters});
    setPage(1);
  };

  const handleSortChange = (newSort: Sort): void => {
    setSort(newSort);
    setPage(1);
  };

  const handleSortModeChange = (newSortMode: SortMode): void => {
    setSortMode(newSortMode);
  }

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number): void => {
    setPageSize(newPageSize);
  }

  const manualFetch = (): void => {
    queryClient.prefetchQuery([key, filters, sort, sortMode, page, pageSize], fetchFilteredData);
  }

  return {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    filters,
    sort, sortMode,
    page, pageSize,
    handleFilterChange,
    handleSortChange, handleSortModeChange,
    handlePageChange, handlePageSizeChange,
    fetchData: refetch,
    fetch: manualFetch,
    resetFilters
  };
}

export default useApi;
