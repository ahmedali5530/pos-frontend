import React, { useState } from "react";
import {
  DISCOUNT_GET,
  DISCOUNT_LIST,
} from "../../../../api/routing/routes/backend.app";
import { useTranslation } from "react-i18next";
import { createColumnHelper } from "@tanstack/react-table";
import { Button } from "../../../../app-common/components/input/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencilAlt,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { TableComponent } from "../../../../app-common/components/table/table";
import { Discount } from "../../../../api/model/discount";
import { useSelector } from "react-redux";
import { getStore } from "../../../../duck/store/store.selector";
import { CreateDiscount } from "./create.discount";
import useApi from "../../../../api/hooks/use.api";
import { HydraCollection } from "../../../../api/model/hydra";
import { ConfirmAlert } from "../../../../app-common/components/confirm/confirm.alert";
import { jsonRequest } from "../../../../api/request/request";
import { Switch } from "../../../../app-common/components/input/switch";

export const DiscountTypes = () => {
  const [operation, setOperation] = useState("create");

  const store = useSelector(getStore);
  const useLoadHook = useApi<HydraCollection<Discount>>(
    "discounts",
    `${DISCOUNT_LIST}?store=${store?.id}`
  );
  const { fetchData } = useLoadHook;
  const [discount, setDiscount] = useState<Discount>();
  const [modal, setModal] = useState(false);

  const { t } = useTranslation();

  const columnHelper = createColumnHelper<Discount>();

  const columns: any = [
    columnHelper.accessor("name", {
      header: "Name",
    }),
    columnHelper.accessor("rate", {
      header: "Rate",
    }),
    columnHelper.accessor("rateType", {
      header: "Rate Type",
    }),
    columnHelper.accessor("scope", {
      header: "Discount type",
    }),
    columnHelper.accessor("stores", {
      header: "Stores",
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) =>
        info
          .getValue()
          .map((item) => item.name)
          .join(", "),
    }),
    columnHelper.accessor("id", {
      header: "Actions",
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => {
        return (
          <>
            <Button
              type="button"
              variant="primary"
              className="w-[40px]"
              onClick={() => {
                setDiscount(info.row.original);
                setOperation("update");
                setModal(true);
              }}
              tabIndex={-1}>
              <FontAwesomeIcon icon={faPencilAlt} />
            </Button>
            <span className="mx-2 text-gray-300">|</span>
            <ConfirmAlert
              onConfirm={() => {
                deleteDiscount(
                  info.getValue().toString(),
                  !info.row.original.isActive
                );
              }}
              confirmText="Yes, please"
              cancelText="No, wait"
              title="Confirm deletion"
              description="Are you sure to delete this purchase?">
              <Switch checked={info.row.original.isActive} readOnly />
            </ConfirmAlert>
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
        buttons={[
          {
            html: (
              <Button
                variant="primary"
                onClick={() => {
                  setModal(true);
                  setOperation("create");
                }}>
                <FontAwesomeIcon icon={faPlus} className="mr-2" /> Store
              </Button>
            ),
          },
        ]}
      />

      <CreateDiscount
        addModal={modal}
        onClose={() => {
          setModal(false);
          setOperation("create");
          fetchData();
          setDiscount(undefined);
        }}
        operation={operation}
        entity={discount}
      />
    </>
  );
};
