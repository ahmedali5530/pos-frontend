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
import {Modal} from "../../../app-common/components/modal/modal";
import {Button} from "../../../app-common/components/input/button";
import Mousetrap from "mousetrap";
import {ItemComponent} from "../settings/items/item";
import {Controller, useForm} from "react-hook-form";
import Fuse from "fuse.js";
import {Switch} from "../../../app-common/components/input/switch";
import {useAtom} from "jotai";
import {defaultData, defaultState} from "../../../store/jotai";

interface SearchTableProps {
  items: Product[];
  addItem: (item: Product, quantity: number, price?: number) => void;
  onClick?: () => void;
  onClose: () => void
}

export const SearchTable = (props: SearchTableProps) => {
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
              if (searchBox) {
                props.onClose();
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
              if (searchBox) {
                props.onClose();
              }
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

  const handlerRef = useRef(null);
  // update handler when dependencies change
  useEffect(() => {
    handlerRef.current = (event: any) => {
      event.preventDefault();

      moveCursor(event);
    };
  }, [selected, filteredItems, quantity]);

  const moveCursor = (event: any) => {
    const itemsLength = filteredItems.length;
    if (event.key === "ArrowDown") {
      setAppState(prev => {
        let newSelected = prev.selected + 1;
        if (newSelected === itemsLength) {
          newSelected = 0;
        }

        moveSearchList(newSelected);

        return {
          ...prev,
          selected: newSelected
        };
      });
    } else if (event.key === "ArrowUp") {
      setAppState(prev => {
        let newSelected = prev.selected - 1;
        if (newSelected === -1) {
          newSelected = itemsLength - 1;
        }

        moveSearchList(newSelected);

        return {
          ...prev,
          selected: newSelected
        };

      })
    } else if (event.key === "Enter") {
      addItem(filteredItems[appState.selected], appState.quantity);
      if (searchBox) {
        props.onClose();
      }
    }
  };

  const submitForm = async (values: any) => {
    const item = filteredItems[selected];

    addItem(item, Number(values.quantity));

    if (searchBox) {
      props.onClose();
    }
    reset({
      q: "",
      quantity: 1,
    });

    setQ("");
  };

  useEffect(() => {
    const func = (e) => handlerRef.current?.(e);

    Mousetrap.bind(["up", "down", "enter"], func);

    return () => {
      Mousetrap.reset();
    };
  }, []);

  const moveSearchList = (index: number) => {
    if (searchScrollContainer && searchScrollContainer.current) {
      searchScrollContainer.current.scrollToItem(index);
    }
  };

  const onOpen = () => {
    // if (props.onClose) {
    //   props.onClose();
    // }

    setQ("");

    props.onClick && props.onClick();

    setAppState(prev => ({
      ...prev,
      selected: 0,
      quantity: 1
    }));
  };

  useEffect(() => {
    onOpen()
  }, []);

  const onClose = () => {
    props.onClose();
  };

  const [searchBoxModal, setSearchBoxModal] = useState(false);

  return (
    <>
      <Modal
        open={true}
        onClose={onClose}
        title={`Search items ${rows.length}`}
        shouldCloseOnEsc={true}>
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="flex gap-3">
            <div className="input-group flex-1">
              <input
                className="input search-field w-full mousetrap lg"
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

      {searchBoxModal && (
        <Modal
          title="Search settings"
          open={searchBoxModal}
          onClose={() => setSearchBoxModal(!searchBoxModal)}
          size="sm"
        >
          <div className="mb-3">
            <Switch checked={searchBox} onChange={() => {
              setAppSettings(prev => ({
                ...prev,
                searchBox: !searchBox
              }))
            }}>
              Close search window after adding item
            </Switch>
          </div>
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
            <input type="range" min={0} max={1} step={0.1} className="w-full" value={searchParams.threshold}
                   onChange={(event) => {
                     setSearchParams(prev => ({
                       ...prev,
                       threshold: Number(event.target.value)
                     }))
                   }}/>
            <span className="text-gray-500 text-sm">Less threshold will match less items</span>
          </div>
        </Modal>
      )}
    </>
  );
};
