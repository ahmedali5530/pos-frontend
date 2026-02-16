import React from "react";
import {createColumnHelper} from "@tanstack/react-table";
import {TableComponent} from "../../../../app-common/components/table/table";
import {Barcode} from "../../../../api/model/barcode";
import {Button} from "../../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCopy} from "@fortawesome/free-solid-svg-icons";
import {useAtom} from "jotai";
import {appState} from "../../../../store/jotai";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Tables} from "../../../../api/db/tables";

export const DynamicBarcodes = () => {


  const [{store}] = useAtom(appState);
  const useLoadHook = useApi<SettingsData<Barcode>>(
    Tables.barcode,
    [], [], 0, 10, ['store', 'item', 'variant']
  );

  const columnHelper = createColumnHelper<Barcode>();

  const columns: any = [
    columnHelper.accessor("item.name", {
      header: "Product",
    }),
    columnHelper.accessor("variant.attribute_value", {
      header: "Variant",
    }),
    columnHelper.accessor("barcode", {
      header: "Barcode",
      cell: info => (
        <>
          {info.getValue()}{' '}
          <Button onClick={async () => {
            await navigator.clipboard.writeText(info.getValue())
          }} variant="secondary" className="ml-2">
            <FontAwesomeIcon icon={faCopy}/>
          </Button>
        </>
      )
    }),
    columnHelper.accessor("measurement", {
      header: "Measurement",
      cell: (info) => `${info.getValue()} ${info.row.original.unit}`,
    })
  ];

  return (
    <>
      <TableComponent
        columns={columns}
        loaderHook={useLoadHook}
        loaderLineItems={6}
      />
    </>
  );
};
