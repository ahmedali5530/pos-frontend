import {Input} from "../input";
import {Loader} from "../../../app-common/components/loader/loader";
import Highlighter from "react-highlight-words";
import {Button} from "../button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faTrash} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect, useState} from "react";
import {Product} from "../../../api/model/product";
import {jsonRequest} from "../../../api/request/request";
import {PRODUCT_LIST} from "../../../api/routing/routes/backend.app";

interface ItemsProps {
  setActiveTab: (tab: string) => void;
  setOperation: (operation: string) => void;
  setRow: (row: Product) => void;
}

export const Items = ({
  setActiveTab, setOperation, setRow
}: ItemsProps) => {
  const [list, setList] = useState<Product[]>([]);
  const [isLoading, setLoading] = useState(false);


  const loadItems = async (q?: string) => {
    setLoading(true);

    try {
      const queryParams = new URLSearchParams({
        limit: '10',
        orderBy: 'id',
        orderMode: 'DESC'
      });

      if (q) {
        queryParams.append('q', q);
      }

      const response = await jsonRequest(PRODUCT_LIST + '?' + queryParams.toString());
      const json = await response.json();

      setList(json.list);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadItems();
  }, []);


  const [q, setQ] = useState('');

  return (
    <>
      <Input name="q"
             type="search"
             onChange={(e) => {
               loadItems(e.target.value);
               setQ(e.target.value);
             }}
             placeholder="Search"
             className="mb-3 mt-3 search-field w-full"/>
      <p className="mb-3">Showing latest 10 items</p>
      {isLoading && (
        <div className="flex justify-center items-center">
          <Loader lines={10}/>
        </div>
      )}
      {!isLoading && (
        <table className="table border border-collapse">
          <thead>
          <tr>
            <th>Name</th>
            <th>Barcode</th>
            <th>Sale Price</th>
            <th>Purchase Price</th>
            <th>Action</th>
          </tr>
          </thead>
          <tbody>
          {list.map((row, index) => {
            return (
              <tr key={index} className="hover:bg-gray-100">
                <td>
                  <Highlighter
                    highlightClassName="YourHighlightClass"
                    searchWords={[q]}
                    autoEscape={true}
                    textToHighlight={row.name}
                  />
                </td>
                <td>
                  {row.barcode && (
                    <Highlighter
                      highlightClassName="YourHighlightClass"
                      searchWords={[q]}
                      autoEscape={true}
                      textToHighlight={row.barcode}
                    />
                  )}
                </td>
                <td>
                  <Highlighter
                    highlightClassName="YourHighlightClass"
                    searchWords={[q]}
                    autoEscape={true}
                    textToHighlight={row.basePrice.toString()}
                  />
                </td>
                <td>{row.cost}</td>
                <td>
                  <Button type="button" variant="primary" className="w-[40px]" onClick={() => {
                    setRow(row);
                    setOperation('update');
                    setActiveTab('form');
                  }} tabIndex={-1}>
                    <FontAwesomeIcon icon={faPencilAlt}/>
                  </Button>
                  <span className="mx-2 text-gray-300">|</span>
                  <Button type="button" variant="danger" className="w-[40px]" tabIndex={-1}>
                    <FontAwesomeIcon icon={faTrash}/>
                  </Button>
                </td>
              </tr>
            )
          })}
          </tbody>
        </table>
      )}
    </>
  );
};
