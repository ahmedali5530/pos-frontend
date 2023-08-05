import React, { createRef, Ref, useEffect, useMemo, useState } from "react";
import {Product} from "../../../api/model/product";
import {useBlockLayout, useTable} from 'react-table'
import {FixedSizeList} from 'react-window'
import Highlighter from "react-highlight-words";
import classNames from "classnames";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faBarcode, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import {getRealProductPrice} from "../../containers/dashboard/pos";
import { Input } from "../../../app-common/components/input/input";
import { Modal } from "../../../app-common/components/modal/modal";
import { Button } from "../../../app-common/components/input/button";
import { Tooltip } from "antd";
import Mousetrap from "mousetrap";
import { Shortcut } from "../../../app-common/components/input/shortcut";

interface SearchTableProps {
  items: Product[];
  addItem: (item: Product, quantity: number, price?: number) => void;
}

export const SearchTable = (props: SearchTableProps) => {
  const {items: allItems, addItem} = props;
  const searchScrollContainer = createRef<FixedSizeList>();
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState(0);
  const [q, setQ] = useState('');

  const items = useMemo(() => {
    return allItems.filter(item => item.name.toLowerCase().includes(q.toLowerCase()))
  }, [allItems, q]);

  const [modal, setModal] = useState(false);

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
              "hover:bg-gray-200 cursor-pointer rounded",
              selected === index ? 'bg-gray-300' : ''
            )
          }
          onClick={() => {
            addItem(item, quantity)
            setModal(false)
          }}
        >
          <div className="basis-auto grow-1 shrink-1 p-2">
            <Highlighter
              highlightClassName="YourHighlightClass"
              searchWords={[q]}
              autoEscape={true}
              textToHighlight={item.name}
            />
            {item.barcode && (
              <div className="text-gray-500">
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
          <div className="basis-auto grow shrink p-2 text-right font-bold">
            {getRealProductPrice(item)}
            {item.basePrice !== getRealProductPrice(item) && (
              <div className="text-danger-500 font-normal text-sm">
                <s>{item.basePrice}</s>
              </div>
            )}
          </div>
        </div>
      )
    },
    [prepareRow, rows, quantity, q, selected]
  );

  const [windowHeight, setWindowHeight] = useState(0);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowHeight(window.innerHeight - 250);
    }
  }, []);

  const moveCursor = (event: any) => {
    const itemsLength = items.length;
    if( event.key === 'ArrowDown' ) {
      let newSelected = selected + 1;
      if( (newSelected) === itemsLength ) {
        newSelected = 0;
        setSelected(newSelected);
      }
      setSelected(newSelected);

      moveSearchList(newSelected);
    } else if( event.key === 'ArrowUp' ) {
      let newSelected = selected - 1;
      if( (newSelected) === -1 ) {
        newSelected = itemsLength - 1;
      }
      setSelected(newSelected);

      moveSearchList(newSelected);
    } else if( event.key === 'Enter' ) {
      addItem(items[selected], quantity);
      setModal(false)
    }
  };

  useEffect(() => {
    Mousetrap.bind(['up', 'down', 'enter'], function (e: Event) {
      e.preventDefault();
      //move cursor in items
      moveCursor(e);
    });
  }, [selected, items]);

  const moveSearchList = (index: number) => {
    if( searchScrollContainer && searchScrollContainer.current ) {
      searchScrollContainer.current.scrollToItem(index, 'center');
    }
  };

  const onOpen = () => {
    setModal(true)
    setQ('')
    setQuantity(1)
  }

  return (
    <>
      <Tooltip title="Search by name">
        <Button
          variant="primary"
          className="btn-square"
          type="button"
          size="lg"
          onClick={onOpen}
        >
          <FontAwesomeIcon icon={faMagnifyingGlass}/>
          <Shortcut shortcut="ctrl+f" handler={onOpen} invisible={true} />
        </Button>
      </Tooltip>
      <Modal open={modal} onClose={() => setModal(false)} title="Search items" shouldCloseOnEsc={true}>
        <div className="input-group">
          <Input className="search-field w-full mousetrap" onChange={(event) => {
            setQ(event.currentTarget.value)
            setSelected(0)
          }} autoFocus type="search" />
          <Input type="number" onChange={(event) => setQuantity(+event.target.value)} value={quantity} placeholder="Quantity" />
        </div>
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
              itemSize={60}
              width={'100%'}
              ref={searchScrollContainer}
            >
              {RenderRow}
            </FixedSizeList>
          </div>
        </div>
      </Modal>
    </>
  )
};
