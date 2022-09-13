import {useState} from "react";
import {jsonRequest} from "../request/request";
import {HttpException, UnauthorizedException} from "../../lib/http/exception/http.exception";
import {QueryString} from "../../lib/location/query.string";
export interface LoadListState<T> {
  isLoading: boolean;
  list: T[];
  error?: string;
  total: number;
  count: number;
  response: any;
}

export interface LoadListActions {
  loadList: (params?: any) => Promise<void>;
}

export const useLoadList = <L>(url: string): [LoadListState<L>, LoadListActions] => {
  const [isLoading, setIsLoading] = useState(false);
  const [foundError, setFoundError] = useState<string | undefined>();
  const [list, setList] = useState<L[]>([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [response, setResponse] = useState<any>();

  const loadList = async (params?: any) => {
    setIsLoading(true);
    setFoundError(undefined);

    const a = new URL(url);
    a.search = QueryString.stringify(params);

    try {
      const response = await jsonRequest(a.toString());
      const json = await response.json();

      setList(json.list);
      setCount(json.count);
      setTotal(json.total);
      setResponse(json);

    }catch (exception){
      if(exception instanceof HttpException){
        setFoundError(exception.message);
      }

      if(exception instanceof UnauthorizedException){
        const res = await exception.response.json();
        setFoundError(res.message);
      }

      throw exception;
    }finally {
      setIsLoading(false);
    }
  };

  return [{ isLoading, list, error: foundError, total, count, response }, { loadList }];
};
