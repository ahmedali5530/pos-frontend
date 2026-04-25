import classNames from "classnames";
import {getRealProductPrice} from "../../containers/dashboard/pos";
import {Modal} from "../../../app-common/components/modal/modal";
import {Product} from "../../../api/model/product";
import {ProductVariant} from "../../../api/model/product.variant";
import {useAtom} from "jotai";
import {defaultState} from "../../../store/jotai";
import Mousetrap from "mousetrap";
import React, {createRef, useEffect, useMemo, useRef, useState} from "react";
import {FixedSizeList} from "react-window";
import {useBlockLayout, useTable} from "react-table";
import {ItemComponent} from "../settings/items/item";
import Highlighter from "react-highlight-words";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBarcode} from "@fortawesome/free-solid-svg-icons";
import {Input} from "../../../app-common/components/input/input";
import {TrapFocus} from "../../../app-common/components/container/trap.focus";
import Fuse from "fuse.js";

interface Props {
  modal: boolean;
  onClose: () => void;
  variants: ProductVariant[];
  addItemVariant: (
    item: Product,
    variant: ProductVariant,
    quantity: number,
    price?: number) => void;
}

export const SearchVariants = ({
  modal, onClose, variants, addItemVariant
}: Props) => {
  const [appState, setAppState] = useAtom(defaultState);

  const handlerRef = useRef(null);

  useEffect(() => {
    handlerRef.current = function(event: any) {
      event.preventDefault();

      moveVariantsCursor(event);
    };
  }, [appState.selected, appState.quantity, appState.selectedVariant, appState.latest, variants]);

  const searchScrollContainer = useRef<FixedSizeList|null>(null);
  const moveSearchList = (index: number) => {
    if (searchScrollContainer && searchScrollContainer.current) {
      searchScrollContainer.current.scrollToItem(index);
    }
  };

  const [windowHeight, setWindowHeight] = useState(0);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowHeight(window.innerHeight - 250);
    }
  }, []);

  const defaultColumn = React.useMemo(
    () => ({
      width: "auto",
    }),
    []
  );

  const columns = React.useMemo(
    () => [
      {
        Header: "Variant",
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

  const [search, setSearch] = useState('');

  const filteredItems = useMemo(() => {
    if (search.trim().length === 0) {
      return variants;
    }

    const fuseOptions: Fuse.IFuseOptions<any> = {
      includeMatches: true,
      isCaseSensitive: false,
      includeScore: true,
      threshold: 0.2,
      ignoreLocation: false,
      shouldSort: true,
      keys: ["attribute_value", "barcode"],
    };

    const fuse = new Fuse(variants, fuseOptions);

    return fuse.search(search.trim()).map((item) => item.item);
  }, [variants, search]);

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
            "table-row hover:bg-gray-200 cursor-pointer",
            appState.selectedVariant === index ? "bg-gray-300" : ""
          )}
          onClick={() => addItemVariant(appState.latest!, item, appState.quantity)}
          key={index}>
          <div className="flex-1 basis-auto p-1">
            {item.name}
            <div>{item.attribute_value}</div>
            {item.barcode && (
              <div className="text-gray-700">{item.barcode}</div>
            )}
          </div>
          <div className="basis-auto p-1 text-right">
            {item.price ? item.price : getRealProductPrice(appState.latest!)}
          </div>
        </div>
      );
    },
    [prepareRow, rows, appState.selectedVariant]
  );

  const moveVariantsCursor = (event: any) => {
    const variantsLength = variants.length;
    if (event.key === "ArrowDown") {
      setAppState(prev => {
        let newSelected = prev.selectedVariant + 1;
        if (newSelected === variantsLength) {
          newSelected = 0;
          return {
            ...prev,
            selectedVariant: newSelected
          };
        }

        moveSearchList(newSelected);

        return {
          ...prev,
          selectedVariant: newSelected
        };
      })

    } else if (event.key === "ArrowUp") {
      setAppState(prev => {
        let newSelected = prev.selectedVariant - 1;
        if (newSelected === -1) {
          newSelected = variantsLength - 1;
        }

        moveSearchList(newSelected);

        return {
          ...prev,
          selectedVariant: newSelected,
        }
      })

    } else if (event.key === "Enter") {
      if(appState.latest) {
        addItemVariant(
          appState.latest,
          variants[appState.selectedVariant],
          appState.quantity
        );
      }
    }
  };

  useEffect(() => {
    const func = (e) => handlerRef.current?.(e);

    Mousetrap.bind(["up", "down", "enter"], func);

    return () => {
      Mousetrap.reset();
    };
  }, []);

  const inputRef = useRef<HTMLInputElement|null>(null)

  return (
    <Modal
      open={modal}
      onClose={onClose}
      title={`Choose a variant for ${appState.latest?.name}`}
      hideCloseButton={true}
      shouldCloseOnOverlayClick={false}
    >
      {variants.length > 0 && (
        <TrapFocus inputRef={inputRef.current}>
        <div className="table w-full">
          <Input
            ref={inputRef}
            className="search-field mb-3 mousetrap w-full"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            autoFocus
          />

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
        </div>
        </TrapFocus>
      )}
    </Modal>
  )
}
