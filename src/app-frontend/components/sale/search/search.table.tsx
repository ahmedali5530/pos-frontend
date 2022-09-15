import React, {Ref, useEffect, useState} from "react";
import {Product} from "../../../../api/model/product";
import {useBlockLayout, useTable} from 'react-table'
import {FixedSizeList} from 'react-window'
import Highlighter from "react-highlight-words";
import classNames from "classnames";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBarcode, faLayerGroup} from "@fortawesome/free-solid-svg-icons";
import {getRealProductPrice} from "../../../containers/dashboard/pos";

interface SearchTableProps {
  searchScrollContainer: Ref<FixedSizeList>;
  items: Product[];
  selected: number;
  setSelected: (state: number) => void;
  setRate: (rate: number) => void;
  addItem: (item: Product, quantity: number) => void;
  quantity: number;
  q: string;
}


export const SearchTable = (props: SearchTableProps) => {
  const {searchScrollContainer, items, selected, addItem, quantity, q} = props;

  const defaultColumn = React.useMemo(
    () => ({
      width: 'auto',
    }),
    []
  );

  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        style: {}
      },
      {
        Header: 'Price',
        style: {
          textAlign: 'right'
        }
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data: items,
      defaultColumn,
    },
    useBlockLayout
  );

  const RenderRow = React.useCallback(
    ({index, style}: {index: number, style: object}) => {
      const row = rows[index];
      prepareRow(row);
      const item = row.original;
      return (
        <div
          {...row.getRowProps({
            style,
          })}
          className={
            classNames(
              "hover:bg-gray-200 cursor-pointer",
              selected === index ? 'bg-gray-300' : ''
            )
          }
          onClick={() => {
            addItem(item, quantity)
          }}
        >
          <div className="basis-auto grow-1 shrink-1 p-2">
            {item.variants.length > 0 && (
              <FontAwesomeIcon icon={faLayerGroup} className="mr-2 text-gray-400" />
            )}
            <Highlighter
              highlightClassName="YourHighlightClass"
              searchWords={[q]}
              autoEscape={true}
              textToHighlight={item.name}
            />
            {item.barcode && (
              <div className="text-gray-400">
                <FontAwesomeIcon icon={faBarcode} className="mr-2" />
                <Highlighter
                  highlightClassName="YourHighlightClass"
                  searchWords={[q]}
                  autoEscape={true}
                  textToHighlight={item.barcode}
                />
              </div>
            )}
          </div>
          <div className="basis-auto grow shrink p-2 text-right">
            {getRealProductPrice(item)}
            {item.basePrice !== getRealProductPrice(item) && (
              <div className="text-red-400">
                <s>{item.basePrice}</s>
              </div>
            )}
          </div>
        </div>
      )
    },
    [prepareRow, rows, q, selected]
  );

  const [windowHeight, setWindowHeight] = useState(0);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowHeight(window.innerHeight - 290 - 100);
    }
  }, []);


  return (
    <>
      <div {...getTableProps()} className="table">
        <div>
          {headerGroups.map((headerGroup, k) => (
            <div {...headerGroup.getHeaderGroupProps()} key={k}>
              {headerGroup.headers.map((column, i) => {
                //@ts-ignore
                const style = column.style;
                return (
                  <div {...column.getHeaderProps({
                    style: style
                  })} className="p-2 basis-auto grow shrink font-bold" key={i}>
                    {column.render('Header')}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <div {...getTableBodyProps()}>
          <FixedSizeList
            height={windowHeight}
            itemCount={rows.length}
            itemSize={80}
            width={'100%'}
            ref={searchScrollContainer}
          >
            {RenderRow}
          </FixedSizeList>
        </div>
      </div>
    </>
  )
};
