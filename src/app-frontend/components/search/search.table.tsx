import React, { createRef, Ref, useEffect, useMemo, useState } from "react";
import { Product } from "../../../api/model/product";
import { useBlockLayout, useTable } from "react-table";
import { FixedSizeList } from "react-window";
import Highlighter from "react-highlight-words";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBarcode,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
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
import { set } from "lodash";

interface SearchTableProps {
  items: Product[];
  addItem: (item: Product, quantity: number, price?: number) => void;
  onClick?: () => void;
}

export const SearchTable = (props: SearchTableProps) => {
  const { items: allItems, addItem } = props;
  const searchScrollContainer = createRef<FixedSizeList>();
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState(0);
  const [q, setQ] = useState("");

  const { handleSubmit, register, control, reset } = useForm();

  const items = useMemo(() => {
    if (q.trim().length === 0) {
      return allItems;
    }

    const fuseOptions = {
      // isCaseSensitive: false,
      // includeScore: false,
      // shouldSort: true,
      // includeMatches: false,
      findAllMatches: true,
      // minMatchCharLength: 1,
      // location: 0,
      threshold: 0.3,
      // distance: 100,
      useExtendedSearch: true,
      ignoreLocation: true,
      // ignoreFieldNorm: false,
      // fieldNormWeight: 1,
      keys: ["name", "barcode"],
    };

    const fuse = new Fuse(allItems, fuseOptions);

    return fuse.search(q).map((item) => item.item);
  }, [allItems, q]);

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
          )}>
          <div className="basis-auto p-2">
            <ItemComponent product={item} />
          </div>
          <div
            className="basis-auto grow-1 shrink-1 p-2"
            onClick={() => {
              addItem(item, quantity);
              setModal(false);
            }}>
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
          <div
            className="basis-auto grow shrink p-2 text-right font-bold"
            onClick={() => {
              addItem(item, quantity);
              setModal(false);
            }}>
            {getRealProductPrice(item)}
            {item.basePrice !== getRealProductPrice(item) && (
              <div className="text-danger-500 font-normal text-sm">
                <s>{item.basePrice}</s>
              </div>
            )}
          </div>
        </div>
      );
    },
    [prepareRow, rows, quantity, q, selected]
  );

  const [windowHeight, setWindowHeight] = useState(0);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowHeight(window.innerHeight - 250);
    }
  }, []);

  const moveCursor = (event: any) => {
    const itemsLength = items.length;
    if (event.key === "ArrowDown") {
      let newSelected = selected + 1;
      if (newSelected === itemsLength) {
        newSelected = 0;
      }
      setSelected(newSelected);

      moveSearchList(newSelected);
    } else if (event.key === "ArrowUp") {
      let newSelected = selected - 1;
      if (newSelected === -1) {
        newSelected = itemsLength - 1;
      }
      setSelected(newSelected);

      moveSearchList(newSelected);
    } else if (event.key === "Enter") {
      addItem(items[selected], quantity);
      setModal(false);
    }
  };

  const submitForm = async (values: any) => {
    const item = items[selected];
    addItem(item, Number(values.quantity));
    setModal(false);
    reset({
      q: "",
      quantity: 1,
    });
    setSelected(0);
    setQ("");
  };

  useEffect(() => {
    Mousetrap.bind(["up", "down", "enter"], function (e: Event) {
      e.preventDefault();
      //move cursor in items
      moveCursor(e);
    });
  }, [selected, items, quantity]);

  const moveSearchList = (index: number) => {
    if (searchScrollContainer && searchScrollContainer.current) {
      searchScrollContainer.current.scrollToItem(index, "center");
    }
  };

  const onOpen = () => {
    setModal(true);
    setQ("");
    setQuantity(1);
    props.onClick && props.onClick();
  };

  return (
    <>
      <Tooltip title="Search by name">
        <Button
          variant="primary"
          className="btn-square"
          type="button"
          size="lg"
          onClick={onOpen}>
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          <Shortcut shortcut="ctrl+f" handler={onOpen} invisible={true} />
        </Button>
      </Tooltip>
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Search items"
        shouldCloseOnEsc={true}>
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="input-group">
            <Input
              className="search-field w-full mousetrap"
              onChange={(event) => {
                setQ(event.currentTarget.value);
                setSelected(0);
              }}
              autoFocus
              type="search"
              value={q}
              name="q"
            />
            <Input
              {...register("quantity")}
              type="number"
              value={quantity}
              placeholder="Quantity"
            />
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
                      className="p-2 basis-auto grow shrink font-bold"
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
    </>
  );
};
