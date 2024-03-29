import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getStore } from "../../../../duck/store/store.selector";
import useApi from "../../../../api/hooks/use.api";
import { HydraCollection } from "../../../../api/model/hydra";
import { BARCODE_LIST, DISCOUNT_GET, } from "../../../../api/routing/routes/backend.app";
import { createColumnHelper } from "@tanstack/react-table";
import { jsonRequest } from "../../../../api/request/request";
import { TableComponent } from "../../../../app-common/components/table/table";
import { Barcode } from "../../../../api/model/barcode";
import { Button } from "../../../../app-common/components/input/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

export const DynamicBarcodes = () => {


  const store = useSelector(getStore);
  const useLoadHook = useApi<HydraCollection<Barcode>>(
    "barcodes",
    `${BARCODE_LIST}?store=${store?.id}`
  );

  const columnHelper = createColumnHelper<Barcode>();

  const columns: any = [
    columnHelper.accessor("item.name", {
      header: "Product",
    }),
    columnHelper.accessor("variant.attributeValue", {
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
            <FontAwesomeIcon icon={faCopy} />
          </Button>
        </>
      )
    }),
    columnHelper.accessor("measurement", {
      header: "Measurement",
      cell: (info) => `${info.getValue()} ${info.row.original.unit}`,
    }),
    columnHelper.accessor("id", {
      header: "Actions",
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => {
        return (
          <>
            {/*<Button type="button" variant="primary" className="w-[40px]" onClick={() => {
              setEntity(info.row.original);
              setOperation('update');
              setModal(true);
            }} tabIndex={-1}>
              <FontAwesomeIcon icon={faPencilAlt}/>
            </Button>*/}
          </>
        );
      },
    }),
  ];

  async function deleteDiscount(id: string, status: boolean) {
    await jsonRequest(DISCOUNT_GET.replace(":id", id), {
      method: "PUT",
      body: JSON.stringify({
        isActive: status,
      }),
    });

    await useLoadHook.fetchData();
  }

  return (
    <>
      <TableComponent
        columns={columns}
        useLoadList={useLoadHook}
        loaderLineItems={6}
      />
    </>
  );
};
