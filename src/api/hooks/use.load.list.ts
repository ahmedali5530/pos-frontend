import {useState, useEffect} from "react";
import {jsonRequest} from "../request/request";
import {QueryString} from "../../lib/location/query.string";
import {HydraCollection, HydraError} from "../model/hydra";

export interface FetchDataState{
  loading: boolean;
  error: Error | null;
  page: number;
  limit: number;
  filter: {[key: string]: string|string[]}|undefined;
  order?: { [sort: string]: string };
  sort?: string;
  sortMode?: string;
}

export interface FetchDataReturns<T> extends FetchDataState{
  handlePageChange?: (page: number) => void;
  handleLimitChange?: (limit: number) => void;
  handleFilterChange?: (filter: any) => void;
  handleSortChange?: (sort?: string) => void;
  handleSortModeChange?: (sortMode?: string) => void;
  fetchData: () => void;
  data: HydraCollection<T>|HydraError|any;
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

export const useLoadList = <L>(url: string): FetchDataReturns<L> => {
  const [data, setData] = useState<any>();
  const [state, setState] = useState<FetchDataState>(defaultState);

  async function fetchData() {
    let query: any = {
      ...state.filter, // filters
      page: state.page,
      itemsPerPage: state.limit,

    };

    if(state.sort){
      query['order'] = {
        [state.sort]: state.sortMode
      }
    }

    try {
      setState((prevState) => ({ ...prevState, loading: true }));
      const response = await jsonRequest(url + '?' + QueryString.stringify(query));
      let json: HydraCollection|any = await response.json();

      setData(json);
    } catch (error: any) {
      setState((prevState) => ({ ...prevState, error }));
    } finally {
      setState((prevState) => ({ ...prevState, loading: false }));
    }
  }

  useEffect(() => {
    fetchData();
  }, [url, state.page, state.limit, state.filter, state.sort, state.sortMode]);

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

  return {
    data: data,
    ...state,
    handlePageChange,
    handleLimitChange,
    handleFilterChange,
    handleSortChange,
    handleSortModeChange,
    fetchData
  };
}
