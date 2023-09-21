import useApi from "../../../api/hooks/use.api";
import { useEffect } from "react";
// @ts-ignore
import Loader from '../../../assets/images/spinner.svg';

interface Props {
  cacheKey: string;
  url?: string;
  displayLoader?: boolean;
  render?: (data: any) => void;
  properties?: string[];
}

export const DynamicValue = ({
  url, displayLoader, render, properties, cacheKey
}: Props) => {
  // disable default firing
  const useLoadHook = useApi<any>(cacheKey, import.meta.env.VITE_API_HOST + url || 'fake-url',
    {}, '', 'asc', 1, 1, {}, {enabled: false}
  );

  useEffect(() => {
    if(url !== null) {
      useLoadHook.fetch();
    }
  }, [url]);

  return (
    <>
      {displayLoader && useLoadHook.isFetching && (
        <img src={Loader} alt="loader" style={{ width: '16px' }}/>
      )}
      {render && render(useLoadHook)}
      {!useLoadHook.isFetching && !render && properties?.map(item => {
        if( useLoadHook.data?.hasOwnProperty(item) ) {
          return useLoadHook.data?.[item]
        }
      })}
    </>
  )
}
