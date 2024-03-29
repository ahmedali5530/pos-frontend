import React, { useState } from "react";
import { TAX_GET, TAX_LIST } from "../../../../api/routing/routes/backend.app";
import { useTranslation } from "react-i18next";
import { createColumnHelper } from "@tanstack/react-table";
import { Button } from "../../../../app-common/components/input/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt, faPlus } from "@fortawesome/free-solid-svg-icons";
import { TableComponent } from "../../../../app-common/components/table/table";
import { Tax } from "../../../../api/model/tax";
import { getAuthorizedUser } from "../../../../duck/auth/auth.selector";
import { useSelector } from "react-redux";
import { getStore } from "../../../../duck/store/store.selector";
import { CreateTax } from "./create.tax";
import useApi from "../../../../api/hooks/use.api";
import { HydraCollection } from "../../../../api/model/hydra";
import { jsonRequest } from "../../../../api/request/request";
import { Switch } from "../../../../app-common/components/input/switch";
import { ConfirmAlert } from "../../../../app-common/components/confirm/confirm.alert";

export const TaxTypes = () => {
  const [operation, setOperation] = useState("create");
  const [tax, setTax] = useState<Tax>();
  const [modal, setModal] = useState(false);
  const user = useSelector(getAuthorizedUser);
  const store = useSelector(getStore);

  const useLoadHook = useApi<HydraCollection<Tax>>(
    "taxes",
    `${TAX_LIST}?store=${store?.id}`
  );
  const { fetchData } = useLoadHook;

  const { t } = useTranslation();

  const columnHelper = createColumnHelper<Tax>();

  const columns: any = [
    columnHelper.accessor("name", {
      header: "Name",
    }),
    columnHelper.accessor("rate", {
      header: "Rate",
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
                setTax(info.row.original);
                setOperation("update");
                setModal(true);
              }}
              tabIndex={-1}>
              <FontAwesomeIcon icon={faPencilAlt} />
            </Button>
            <span className="mx-2 text-gray-300">|</span>
            <ConfirmAlert
              onConfirm={() => {
                deleteTax(
                  info.getValue().toString(),
                  !info.row.original.isActive
                );
              }}
              confirmText="Yes, please"
              cancelText="No, wait"
              title="Confirmation"
              description={`Are you sure to ${
                info.row.original.isActive ? "de-" : ""
              }activate this tax?`}>
              <Switch checked={info.row.original.isActive} readOnly />
            </ConfirmAlert>
          </>
        );
      },
    }),
  ];

  async function deleteTax(id: string, status: boolean) {
    await jsonRequest(TAX_GET.replace(":id", id), {
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
        loaderLineItems={4}
        buttons={[
          {
            html: (
              <Button
                variant="primary"
                onClick={() => {
                  setModal(true);
                  setOperation("create");
                }}>
                <FontAwesomeIcon icon={faPlus} className="mr-2" /> Tax
              </Button>
            ),
          },
        ]}
      />

      <CreateTax
        entity={tax}
        onClose={() => {
          setTax(undefined);
          setOperation("create");
          setModal(false);
          fetchData();
        }}
        operation={operation}
        addModal={modal}
      />
    </>
  );
};
