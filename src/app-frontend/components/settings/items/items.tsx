import { Button } from "../../../../app-common/components/input/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencilAlt,
  faPlus,
  faEllipsis, faEye, faPencil, faTrash
} from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import { Product } from "../../../../api/model/product";
import {
  PRODUCT_GET,
  PRODUCT_LIST,
} from "../../../../api/routing/routes/backend.app";
import { TableComponent } from "../../../../app-common/components/table/table";
import { useTranslation } from "react-i18next";
import { createColumnHelper } from "@tanstack/react-table";
import { ImportItems } from "./import.items";
import { ExportItems } from "./export.items";
import { CreateItem } from "./manage-item/items.create";
import useApi from "../../../../api/hooks/use.api";
import { HydraCollection } from "../../../../api/model/hydra";
import { ConfirmAlert } from "../../../../app-common/components/confirm/confirm.alert";
import { jsonRequest } from "../../../../api/request/request";
import { Switch } from "../../../../app-common/components/input/switch";
import { ItemComponent } from "./item";
import { Menu, MenuItem } from "react-aria-components";
import { DropdownMenu, DropdownMenuItem } from "../../../../app-common/components/react-aria/dropdown.menu";

export const Items = () => {
  const useLoadHook = useApi<HydraCollection<Product>>(
    "products",
    PRODUCT_LIST
  );
  const [entity, setEntity] = useState<Product>();
  const [operation, setOperation] = useState("create");
  const [modal, setModal] = useState(false);

  const { t } = useTranslation();

  const columnHelper = createColumnHelper<Product>();

  const columns: any[] = [
    columnHelper.accessor("name", {
      header: "Name",
    }),
    columnHelper.accessor("barcode", {
      header: "Barcode",
    }),
    columnHelper.accessor("basePrice", {
      header: "Sale Price",
    }),
    columnHelper.accessor("cost", {
      header: "Purchase Price",
    }),
    columnHelper.accessor("department.name", {
      header: "Department",
    }),
    columnHelper.accessor("categories", {
      id: "categories.name",
      header: "Categories",
      cell: (info) =>
        info
          .getValue()
          .map((item) => item.name)
          .join(", "),
    }),
    columnHelper.accessor("suppliers", {
      id: "suppliers.name",
      header: "Suppliers",
      cell: (info) =>
        info
          .getValue()
          .map((item) => item.name)
          .join(", "),
    }),
    columnHelper.accessor("brands", {
      id: "brands.name",
      header: "Brands",
      cell: (info) =>
        info
          .getValue()
          .map((item) => item.name)
          .join(", "),
    }),
    columnHelper.accessor("variants", {
      header: "Variants",
      cell: (info) => `${info.getValue().length} variants`,
      enableSorting: false,
      enableColumnFilter: false,
    }),
    columnHelper.accessor("taxes", {
      id: "taxes.name",
      header: "Taxes",
      cell: (info) =>
        info
          .getValue()
          .map((item) => `${item.name} ${item.rate}%`)
          .join(", "),
    }),
    columnHelper.accessor("stores", {
      header: "Stores",
      cell: (info) =>
        info
          .getValue()
          .map((item) => item.store.name)
          .join(", "),
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.accessor("terminals", {
      header: "Terminals",
      cell: (info) =>
        info
          .getValue()
          .map((item) => item.code)
          .join(", "),
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.accessor("id", {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => {
        return (
          <div className="flex gap-1">
            <ConfirmAlert
              onConfirm={() => {
                deleteItem(
                  info.row.original.id.toString(),
                  !info.row.original.isActive
                );
              }}
              confirmText="Yes, please"
              cancelText="No, wait"
              title="Confirmation"
              description={`Are you sure to ${
                info.row.original.isActive ? "de-" : ""
              }activate this item?`}
            >
              <Switch checked={info.row.original.isActive}></Switch>
            </ConfirmAlert>
            <ItemComponent product={info.row.original}/>
            <DropdownMenu label={
              <FontAwesomeIcon icon={faEllipsis}/>
            } onAction={key => {
              if(key === 'edit'){
                setEntity(info.row.original);
                setOperation("update");
                setModal(true);
              }
              if(key === 'view'){
                // <ItemComponent product={info.row.original}/>
              }
            }}>
              <DropdownMenuItem id="edit" icon={faPencil}>Edit</DropdownMenuItem>
            </DropdownMenu>
          </div>
        );
      },
    }),
  ];

  async function deleteItem(id: string, status: boolean) {
    await jsonRequest(PRODUCT_GET.replace(":id", id), {
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
        buttons={[
          {
            html: <ImportItems />,
          },
          {
            html: <ExportItems />,
          },
          {
            html: (
              <Button
                variant="primary"
                onClick={() => {
                  setModal(true);
                  setOperation("create");
                }}>
                <FontAwesomeIcon icon={faPlus} className="mr-2" /> Item
              </Button>
            ),
          },
        ]}
        loaderLineItems={12}
        loaderLines={10}
      />

      <CreateItem
        addModal={modal}
        entity={entity}
        onClose={() => {
          setModal(false);
          setOperation("create");
          useLoadHook.fetchData();
          setEntity(undefined);
        }}
        operation={operation}
      />
    </>
  );
};
