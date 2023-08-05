import { useEffect, useState } from "react";
import { jsonRequest } from "../request/request";
import { QueryString } from "../../lib/location/query.string";
import { HydraCollection, HydraError } from "../model/hydra";
import { get } from 'lodash';

export interface FetchDataState {
  loading: boolean;
  error: Error | null;
  page: number;
  limit: number;
  filter: { [key: string]: string | string[] } | undefined;
  order?: { [sort: string]: string };
  sort?: string;
  sortMode?: string;
  abort?: () => void;
}

export interface FetchDataReturns<T> extends FetchDataState {
  handlePageChange?: (page: number) => void;
  handleLimitChange?: (limit: number) => void;
  handleFilterChange?: (filter: any) => void;
  handleSortChange?: (sort?: string) => void;
  handleSortModeChange?: (sortMode?: string) => void;
  fetchData: () => void;
  data: HydraCollection<T> | HydraError | any;
  list: T[];
}

const defaultState: FetchDataState = {
  loading: true,
  error: null,
  page: 1,
  limit: 10,
  sort: undefined,
  sortMode: undefined,
  filter: undefined
};

const abortController = new AbortController();

export const useLoadList = <L>(url: string, options?: any): FetchDataReturns<L> => {
  const [data, setData] = useState<L[]>();
  const [list, setList] = useState<L[]>([]);
  const [state, setState] = useState<FetchDataState>(defaultState);

  useEffect(() => {
    const optionsLimit = get(options, 'limit');
    if( optionsLimit ) {
      handleLimitChange(optionsLimit);
    }
    const optionsPage = get(options, 'page');
    if( optionsPage ) {
      handlePageChange(optionsPage);
    }
    const optionsFilter = get(options, 'filter');
    if( optionsFilter ) {
      handleFilterChange(optionsFilter);
    }
    const optionsSort = get(options, 'sort');
    if( optionsSort ) {
      handleSortChange(optionsSort);
    }
    const optionsSortMode = get(options, 'sortMode');
    if( optionsSortMode ) {
      handleSortModeChange(optionsSortMode);
    }
  }, []);

  async function fetchData() {
    let query: any = {
      ...state.filter, // filters
      page: state.page,
      itemsPerPage: state.limit,
    };

    if( state.sort ) {
      query['order'] = {
        [state.sort]: state.sortMode
      }
    }

    try {
      setState((prevState) => ({ ...prevState, loading: true }));

      const response = await jsonRequest(url + '?' + QueryString.stringify(query), {
        signal: abortController.signal
      });
      let json: HydraCollection | any = await response.json();

      if( json['hydra:member'] ) {
        setList(json['hydra:member']);
      }

      setData(json);
    } catch ( error: any ) {
      setState((prevState) => ({ ...prevState, error }));
    } finally {
      setState((prevState) => ({ ...prevState, loading: false }));
    }
  }

  useEffect(() => {
    fetchData();
  }, [state.page, state.limit, state.filter, state.sort, state.sortMode]);

  function handlePageChange(page: number) {
    setState((prevState) => ({ ...prevState, page }));
  }

  function handleLimitChange(limit: number) {
    setState((prevState) => ({ ...prevState, limit }));
  }

  function handleFilterChange(filter: any) {
    setState((prevState) => ({ ...prevState, filter }));
  }

  function handleSortChange(sort?: string) {
    setState((prevState) => ({ ...prevState, sort }));
  }

  function handleSortModeChange(sortMode?: string) {
    setState((prevState) => ({ ...prevState, sortMode }));
  }

  function abort() {
    abortController.abort();
  }

  return {
    data: data,
    list: list,
    ...state,
    handlePageChange,
    handleLimitChange,
    handleFilterChange,
    handleSortChange,
    handleSortModeChange,
    fetchData, abort
  };
}
