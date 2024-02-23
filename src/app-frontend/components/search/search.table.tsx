import React, { createRef, useEffect, useMemo, useState } from "react";
import { Product } from "../../../api/model/product";
import { useBlockLayout, useTable } from "react-table";
import { FixedSizeList } from "react-window";
import Highlighter from "react-highlight-words";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBarcode, faCog, faMagnifyingGlass, } from "@fortawesome/free-solid-svg-icons";
import { getRealProductPrice } from "../../containers/dashboard/pos";
import { Input } from "../../../app-common/components/input/input";
import { Modal } from "../../../app-common/components/modal/modal";
import { Button } from "../../../app-common/components/input/button";
import { Tooltip } from "antd";
import Mousetrap from "mousetrap";
import { Shortcut } from "../../../app-common/components/input/shortcut";
import { ItemComponent } from "../settings/items/item";
import { Controller, useForm } from "react-hook-form";
import Fuse from "fuse.js";
import { Switch } from "../../../app-common/components/input/switch";
import { useAtom } from "jotai";
import { defaultData, defaultState } from "../../../store/jotai";

interface SearchTableProps {
  items: Product[];
  addItem: (item: Product, quantity: number, price?: number) => void;
  onClick?: () => void;
}

export const SearchTable = (props: SearchTableProps) => {
  const { items: allItems, addItem } = props;
  const [searchParams, setSearchParams] = useState({
    ignoreLocation: true,
    threshold: 0.2,
    caseSensitive: false,
  });

  const [appState, setAppState] = useAtom(defaultState);

  const {
    selected
  } = appState;

  const searchScrollContainer = createRef<FixedSizeList>();
  const [quantity, setQuantity] = useState(1);
  // const [selected, setSelected] = useState(0);
  const [q, setQ] = useState("");

  const { handleSubmit, control, reset } = useForm();

  const [appSettings] = useAtom(defaultData);
  const { searchBox } = appSettings;


  const items = useMemo(() => {
    if( q.trim().length === 0 ) {
      return allItems;
    }

    const fuseOptions = {
      isCaseSensitive: searchParams.caseSensitive,
      // includeScore: false,
      shouldSort: true,
      // includeMatches: false,
      findAllMatches: true,
      // minMatchCharLength: 1,
      // location: 0,
      threshold: searchParams.threshold,
      // distance: 100,
      useExtendedSearch: true,
      ignoreLocation: searchParams.ignoreLocation,
      // ignoreFieldNorm: false,
      // fieldNormWeight: 1,
      keys: ["name", "barcode", "basePrice"],
    };

    const fuse = new Fuse(allItems, fuseOptions);

    return fuse.search(q).map((item) => item.item);
  }, [allItems, q, searchParams]);

  const [modal, setModal] = useState(false);

  const defaultColumn = React.useMemo(
    () => ({
      width: "auto",
    }),
    []
  );

  const columns = React.useMemo(
    () => [
      {
        Header: "View",
        style: {},
      },
      {
        Header: "Name",
        style: {},
      },
      {
        Header: "Price",
        style: {
          textAlign: "right",
          paddingRight: "15px",
        },
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data: items,
        defaultColumn,
      },
      useBlockLayout
    );

  const RenderRow = React.useCallback(
    ({ index, style }: { index: number; style: object }) => {
      const row = rows[index];
      prepareRow(row);
      const item = row.original;
      return (
        <div
          {...row.getRowProps({
            style,
          })}
          className={classNames(
            "hover:bg-gray-200 cursor-pointer rounded",
            selected === index ? "bg-gray-300" : ""
          )}
          tabIndex={selected === index ? 0 : -1}
          role="option"
        >
          <div className="basis-auto p-2">
            <ItemComponent product={item}/>
          </div>
          <div
            className="basis-auto p-2"
            onClick={() => {
              addItem(item, quantity);
              if( searchBox ) {
                setModal(false);
              }
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
              if( searchBox ) {
                setModal(false);
              }
            }}>
            <Highlighter
              highlightClassName="YourHighlightClass"
              searchWords={[q]}
              autoEscape={true}
              textToHighlight={getRealProductPrice(item).toString()}
            />
            {item.basePrice !== getRealProductPrice(item) && (
              <div className="text-danger-500 font-normal text-sm">
                <s>{item.basePrice}</s>
              </div>
            )}
          </div>
        </div>
      );
    },
    [prepareRow, rows, quantity, q, selected, items, searchBox]
  );

  const [windowHeight, setWindowHeight] = useState(0);
  useEffect(() => {
    if( typeof window !== "undefined" ) {
      setWindowHeight(window.innerHeight - 250);
    }
  }, []);

  const moveCursor = (event: any) => {
      const itemsLength = items.length;
      if( event.key === "ArrowDown" ) {
        let newSelected = selected + 1;
        if( newSelected === itemsLength ) {
          newSelected = 0;
        }
        setAppState(prev => ({
          ...prev,
          selected: newSelected
        }));

        moveSearchList(newSelected);
      } else if( event.key === "ArrowUp" ) {
        let newSelected = selected - 1;
        if( newSelected === -1 ) {
          newSelected = itemsLength - 1;
        }

        setAppState(prev => ({
          ...prev,
          selected: newSelected
        }));

        moveSearchList(newSelected);
      } else if( event.key === "Enter" ) {
        addItem(items[selected], quantity);
        if( searchBox ) {
          setModal(false);
        }
      }
  };

  const submitForm = async (values: any) => {
    const item = items[selected];

    addItem(item, Number(values.quantity));

    if( searchBox ) {
      setModal(false);
    }
    reset({
      q: "",
      quantity: 1,
    });

    setQ("");
  };

  useEffect(() => {
    function func(e: Event){
      moveCursor(e);
    }

    if(modal) {
      Mousetrap.bind(["up", "down", "enter"], func);
    }else{
      Mousetrap.unbind(['up', 'down', 'enter'], func);
    }
  }, [selected, items, quantity, modal]);

  const moveSearchList = (index: number) => {
    if( searchScrollContainer && searchScrollContainer.current ) {
      searchScrollContainer.current.scrollToItem(index);
    }
  };

  const onOpen = () => {
    setModal(true);
    setQ("");
    setQuantity(1);
    props.onClick && props.onClick();

    setAppState(prev => ({
      ...prev,
      selected: 0
    }));
  };

  const onClose = () => {
    setModal(false);
    setQ("");
    setQuantity(1);
  };

  const [searchBoxModal, setSearchBoxModal] = useState(false);

  return (
    <>
      <Tooltip title="Search by name">
        <Button
          variant="primary"
          iconButton
          type="button"
          size="lg"
          onClick={onOpen}>
          <FontAwesomeIcon icon={faMagnifyingGlass}/>
          <Shortcut shortcut="ctrl+f" handler={onOpen} invisible={true}/>
        </Button>
      </Tooltip>
      <Modal
        open={modal}
        onClose={onClose}
        title={`Search items ${rows.length}`}
        shouldCloseOnEsc={true}>
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="flex gap-3">
            <div className="input-group flex-1">
              <Input
                className="search-field w-full mousetrap lg"
                onChange={(event) => {
                  setQ(event.currentTarget.value);
                  setAppState(prev => ({
                    ...prev,
                    selected: 0
                  }));
                }}
                autoFocus
                type="search"
                value={q}
                name="q"
              />
              <Controller
                name="quantity"
                render={({ field }) => (
                  <Input
                    onChange={(event) => {
                      field.onChange(event.target.value);
                      setQuantity(Number(event.target.value));
                    }}
                    type="number"
                    value={quantity}
                    placeholder="Quantity"
                    className="mousetrap lg"
                  />
                )}
                control={control}
              />
            </div>
            <div className="search-behaviour">
              <Button
                size="lg"
                iconButton
                type="button"
                variant="secondary"
                onClick={() => setSearchBoxModal(!searchBoxModal)}
              >
                <FontAwesomeIcon icon={faCog}/>
              </Button>
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
      </Modal>
      <Modal
        title="Search settings"
        open={searchBoxModal}
        onClose={() => setSearchBoxModal(!searchBoxModal)}
        size="sm"
      >
        <div className="mb-3">
          <Switch checked={searchBox} onChange={() => {
            setAppState(prev => ({
              ...prev,
              searchBox: !searchBox
            }))
          }}>
            Close search window after adding item
          </Switch>
        </div>
        {/*<h5 className="text-xl mb-3">Fuzzy search settings</h5>*/}
        {/*<div className="mb-3">*/}
        {/*  <Switch checked={searchParams.ignoreLocation} onChange={() => {*/}
        {/*    setSearchParams(prev => ({*/}
        {/*      ...prev,*/}
        {/*      ignoreLocation: !searchParams.ignoreLocation*/}
        {/*    }))*/}
        {/*  }}>*/}
        {/*    Search from anywhere in name?*/}
        {/*  </Switch>*/}
        {/*</div>*/}
        <div className="mb-3">
          <Switch checked={searchParams.caseSensitive} onChange={() => {
            setSearchParams(prev => ({
              ...prev,
              caseSensitive: !searchParams.caseSensitive
            }))
          }}>
            Use case sensitive search
          </Switch>
        </div>
        <div className="mb-3">
          <label htmlFor="threshold">Search threshold {searchParams.threshold}</label>
          <input type="range" min={0} max={1} step={0.1} className="w-full" value={searchParams.threshold} onChange={(event) => {
            setSearchParams(prev => ({
              ...prev,
              threshold: Number(event.target.value)
            }))
          }} />
          <span className="text-gray-500 text-sm">Less threshold will match less items</span>
        </div>
      </Modal>
    </>
  );
};
