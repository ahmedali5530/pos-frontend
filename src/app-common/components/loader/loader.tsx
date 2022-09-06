import {ReactNode, useEffect, useState} from "react";

interface LoaderProps{
  lines?: number;
  lineItems?: number;
}

export const Loader = ({lines = 5, lineItems = 5}: LoaderProps) => {
  const [items, setItems] = useState<ReactNode[]>([]);
  useEffect(() => {
    let a: ReactNode[] = [];
    for(let i = 1; i <= lines; i++){
      let b: ReactNode[] = [];
      for(let j = 1; j <= lineItems; j++){
        b.push(
          <div className="h-5 bg-gray-300 rounded-full w-24"></div>
        );
      }
      a.push(
        <div className="flex justify-between items-center gap-5 p-5">
          {b}
        </div>
      );
    }

    setItems(a);
  }, [lines, lineItems]);

  return (
    <div role="status"
         className="gap-5 w-full divide-y divide-gray-300 animate-pulse">
      {items}
      <span className="sr-only">Loading...</span>
    </div>
  );
};
