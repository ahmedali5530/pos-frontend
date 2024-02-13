import classNames from "classnames";
import { FixedSizeList } from "react-window";
import React, { useEffect, useRef, useState } from "react";
import { Row, useBlockLayout, useTable } from "react-table";
import Mousetrap from "mousetrap";

interface Props {
  data: any[];
  columns: any[];
  containerHeight: number;
  itemHeight: number;
  renderRow: (index: number, selectedIndex: number, style: Object, item: Row, onClick?: () => void) => React.ReactElement;
  onSelectionChange?: (index: number, row: any) => void;
  onEnter?: (index: number, row: any) => void;
  onClick?: () => void;
}

export const KeyboardTable = ({
  data, columns, containerHeight, itemHeight, renderRow, onEnter, onSelectionChange
}: Props) => {
  const [selected, setSelected] = useState<number>(0);
  const container = useRef<FixedSizeList | null>(null);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    // state: { selectedRowIds },
  } = useTable(
    {
      columns,
      data,
      initialState: {
        // selectedRowIds: { [selected as number]: true },
      },
    },
    // Use the useMemo hook to ensure that the table instance is only recreated if columns or data change
    useBlockLayout
  );

  const _renderRow = React.useCallback(
    ({ index, style }: { index: number; style: object }) => {
      const row = rows[index];
      prepareRow(row);
      return renderRow(index, selected, style, row, () => {
        setSelected(index);
      });
    },
    [prepareRow, rows, selected]
  );

  Mousetrap.bind(["up", "down", "enter"], function (e: React.KeyboardEvent) {
    e.preventDefault();
    //move cursor in items
    moveCursor(e);
  });

  const moveCursor = (event: any) => {
    const itemsLength = data.length;
    if( event.key === "ArrowDown" ) {
      let newSelected = selected + 1;
      if( newSelected === itemsLength ) {
        newSelected = 0;
      }
      setSelected(newSelected);
      onSelectionChange && onSelectionChange(newSelected, data[newSelected]);
    } else if( event.key === "ArrowUp" ) {
      let newSelected = selected - 1;
      if( newSelected === -1 ) {
        newSelected = itemsLength - 1;
      }
      setSelected(newSelected);
      onSelectionChange && onSelectionChange(newSelected, data[newSelected]);
    }else if(event.key === 'Enter'){
      onEnter && onEnter(selected, data[selected]);
    }
  };

  useEffect(() => {
    // setSelected(0);
  }, [data]);

  return (
    <div>
      <div {...getTableProps()} className="table">
        <div>
          {headerGroups.map((headerGroup, k) => (
            <div {...headerGroup.getHeaderGroupProps({
              style: {
                width: '100%'
              }
            })} key={k}>
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
                    key={i}
                  >
                    {column.render("Header")}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div {...getTableBodyProps()}>
          <FixedSizeList
            height={containerHeight}
            itemCount={rows.length}
            itemSize={itemHeight}
            width={"100%"}
            ref={container}>
            {_renderRow}
          </FixedSizeList>
        </div>
      </div>
    </div>
  );
}
