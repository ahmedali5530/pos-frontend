import {useState} from "react";
import {jsonRequest} from "../request/request";
import {HttpException, UnauthorizedException} from "../../lib/http/exception/http.exception";
import {QueryString} from "../../lib/location/query.string";
export interface LoadItemState<T> {
  isLoading: boolean;
  item?: T;
  error?: string;
}

export interface LoadItemActions {
  loadItem: (params?: any) => Promise<void>;
}

export const useLoadItem = <L>(url: string): [LoadItemState<L>, LoadItemActions] => {
  const [isLoading, setIsLoading] = useState(false);
  const [foundError, setFoundError] = useState<string | undefined>();
  const [item, setItem] = useState<L>();

  const loadItem = async (params?: any) => {
    setIsLoading(true);
    setFoundError(undefined);

    const a = new URL(url);
    a.search = QueryString.stringify(params);

    try {
      const response = await jsonRequest(a.toString());
      const json = await response.json();

      setItem(json);

    }catch (exception){
      if(exception instanceof UnauthorizedException){
        const res = await exception.response.json();
        setFoundError(res.message);
      }

      if(exception instanceof HttpException){
        setFoundError(exception.message);
      }

      throw exception;
    }finally {
      setIsLoading(false);
    }
  };

  return [{ isLoading, item, error: foundError }, { loadItem }];
};
