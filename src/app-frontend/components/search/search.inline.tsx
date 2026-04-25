import React, {createRef, useEffect, useMemo, useRef, useState} from "react";
import {Product} from "../../../api/model/product";
import {useBlockLayout, useTable} from "react-table";
import {FixedSizeList} from "react-window";
import Highlighter from "react-highlight-words";
import classNames from "classnames";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBarcode, faCog,} from "@fortawesome/free-solid-svg-icons";
import {getRealProductPrice} from "../../containers/dashboard/pos";
import {Input} from "../../../app-common/components/input/input";
import {Button} from "../../../app-common/components/input/button";
import Mousetrap from "mousetrap";
import {ItemComponent} from "../settings/items/item";
import {Controller, useForm} from "react-hook-form";
import Fuse from "fuse.js";
import {useAtom} from "jotai";
import {defaultData, defaultState} from "../../../store/jotai";

interface SearchInlineProps {
  items: Product[];
  addItem: (item: Product, quantity: number, price?: number) => void;
  onClick?: () => void;
}

export const SearchInline = (props: SearchInlineProps) => {
  const {items: allItems, addItem} = props;

  const [searchParams, setSearchParams] = useState({
    ignoreLocation: false,
    threshold: 0.5,
    caseSensitive: false,
  });

  const [appState, setAppState] = useAtom(defaultState);

  const {
    selected, quantity
  } = appState;

  const searchScrollContainer = createRef<FixedSizeList>();
  // const [selected, setSelected] = useState(0);
  const [q, setQ] = useState("");

  const {handleSubmit, control, reset} = useForm();

  const [appSettings, setAppSettings] = useAtom(defaultData);
  const {searchBox} = appSettings;

  const filteredItems = useMemo(() => {
    if (q.trim().length === 0) {
      return allItems;
    }

    const fuseOptions = {
      includeMatches: true,
      isCaseSensitive: searchParams.caseSensitive,
      includeScore: true,
      threshold: searchParams.threshold,
      ignoreLocation: searchParams.ignoreLocation,
      keys: ["name", "barcode", "base_price"],
    };

    const fuse = new Fuse(allItems, fuseOptions);

    return fuse.search(q.trim()).map((item) => item.item);
  }, [allItems, q, searchParams]);

  const defaultColumn = React.useMemo(
    () => ({
      width: "auto",
    }),
    []
  );

  const columns = React.useMemo(
    () => [
      {
        Header: "Name",
        style: {},
      },
      {
        Header: "Price",
        style: {
          textAlign: "right",
          paddingRight: "10px",
        },
      },
    ],
    []
  );

  const {getTableProps, getTableBodyProps, headerGroups, rows, prepareRow} =
    useTable(
      {
        columns,
        data: filteredItems,
        defaultColumn,
      },
      useBlockLayout
    );

  const RenderRow = React.useCallback(
    ({index, style}: { index: number; style: object }) => {
      const row = rows[index];
      prepareRow(row);
      const item = row.original;
      return (
        <div
          {...row.getRowProps({
            style,
          })}
          className={classNames(
            "hover:bg-gray-200 cursor-pointer rounded"
          )}
          role="option"
        >
          <div
            className="basis-auto p-2"
            onClick={() => {
              addItem(item, quantity);
            }}>
            <Highlighter
              highlightClassName="YourHighlightClass"
              searchWords={[q]}
              autoEscape={true}
              textToHighlight={item.name}
            />
            {item.barcode && (
              <div className="text-gray-500">
                <FontAwesomeIcon icon={faBarcode} className="mr-2"/>
                <Highlighter
                  highlightClassName="YourHighlightClass"
                  searchWords={[q]}
                  autoEscape={true}
                  textToHighlight={item.barcode}
                />
              </div>
            )}
          </div>
          <div
            className="flex-1 p-2 text-right font-bold"
            onClick={() => {
              addItem(item, quantity);
            }}>
            {getRealProductPrice(item).toString()}
            {item.base_price !== getRealProductPrice(item) && (
              <div className="text-danger-500 font-normal text-sm">
                <s>{item.base_price}</s>
              </div>
            )}
          </div>
        </div>
      );
    },
    [prepareRow, rows, quantity, q, selected, filteredItems, searchBox]
  );

  const [windowHeight, setWindowHeight] = useState(0);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowHeight(window.innerHeight - 250);
    }
  }, []);

  const submitForm = async (values: any) => {
    const item = filteredItems[selected];

    addItem(item, Number(values.quantity));

    reset({
      q: "",
      quantity: 1,
    });

    setQ("");
  };

  return (
    <>
      <form onSubmit={handleSubmit(submitForm)}>
        <div className="flex gap-3">
          <div className="input-group">
            <Input
              className="search-field mousetrap grow lg w-full"
              onChange={(event) => {
                setQ(event.currentTarget.value);
                setAppState(prev => ({
                  ...prev,
                  selected: 0,
                }));
              }}
              autoFocus
              type="search"
              value={q}
              name="q"
            />
            <Controller
              name="quantity"
              render={({field}) => (
                <Input
                  onChange={(event) => {
                    field.onChange(event.target.value);
                    setAppState(prev => ({
                      ...prev,
                      quantity: Number(event.target.value)
                    }))
                  }}
                  type="number"
                  value={quantity}
                  placeholder="Quantity"
                  className="mousetrap lg grow shrink w-[80px]"
                />
              )}
              control={control}
            />
          </div>
        </div>
        <button type="submit" className="none"></button>
      </form>

      <div {...getTableProps()} className="table">
        <div>
          {headerGroups.map((headerGroup, k) => (
            <div {...headerGroup.getHeaderGroupProps()} key={k}>
              {headerGroup.headers.map((column, i) => {
                //@ts-ignore
                const style = column.style;
                return (
                  <div
                    {...column.getHeaderProps({
                      style: style,
                    })}
                    className={classNames(
                      "p-2 flex-1 font-bold",
                      i === 0 ? "grow-0" : ""
                    )}
                    key={i}>
                    {column.render("Header")}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div {...getTableBodyProps()}>
          <FixedSizeList
            height={windowHeight}
            itemCount={rows.length}
            itemSize={60}
            width={"100%"}
            ref={searchScrollContainer}>
            {RenderRow}
          </FixedSizeList>
        </div>
      </div>
    </>
  );
};
