import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus,} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../../../../app-common/components/input/button";
import React, {useState} from "react";
import {Brand} from "../../../../api/model/brand";
import {createColumnHelper} from "@tanstack/react-table";
import {TableComponent} from "../../../../app-common/components/table/table";
import {CreateBrand} from "./create.brand";
import {ConfirmAlert} from "../../../../app-common/components/confirm/confirm.alert";
import {Switch} from "../../../../app-common/components/input/switch";
import {Tables} from "../../../../api/db/tables";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {useDB} from "../../../../api/db/db";
import {StringRecordId} from "surrealdb";
import {ProductStore} from "../../../../api/model/product.store";

export const Brands = () => {
  const [operation, setOperation] = useState("create");
  const [brand, setBrand] = useState<Brand>();
  const [modal, setModal] = useState(false);

  const useLoadHook = useApi<SettingsData<Brand>>(
    Tables.brand,
    [], [], 0, 10, ['stores']
  );
  const {fetchData} = useLoadHook;

  const db = useDB();

  const columnHelper = createColumnHelper<Brand>();

  const columns: any = [
    columnHelper.accessor("name", {
      header: "Name",
    }),
    columnHelper.accessor("stores", {
      header: "Stores",
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) =>
        info
          .getValue()
          .map((item) => <span key={item.id} className="badge">{item.name}</span>),
    }),
    columnHelper.accessor("id", {
      id: "actions",
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
                setBrand(info.row.original);
                setOperation("update");
                setModal(true);
              }}
              tabIndex={-1}>
              <FontAwesomeIcon icon={faPencilAlt}/>
            </Button>
            <span className="mx-2 text-gray-300">|</span>
            <ConfirmAlert
              onConfirm={() => {
                deleteBrand(
                  info.getValue().toString(),
                  !info.row.original.is_active
                );
              }}
              confirmText="Yes, please"
              cancelText="No, wait"
              title="Confirmation"
              description={`Are you sure to ${info.row.original.is_active ? 'de-' : ''}activate this brand?`}
            >
              <Switch checked={info.row.original.is_active} readOnly/>
            </ConfirmAlert>
          </>
        );
      },
    }),
  ];

  async function deleteBrand(id: string, status: boolean) {
    await db.merge(new StringRecordId(id), {
      is_active: status
    })

    await useLoadHook.fetchData();
  }

  return (
    <>
      <TableComponent
        columns={columns}
        loaderHook={useLoadHook}
        loaderLineItems={3}
        buttons={[
          <Button
            variant="primary"
            onClick={() => {
              setModal(true);
              setOperation("create");
            }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Brand
          </Button>
        ]}
      />

      {modal && (
        <CreateBrand
          entity={brand}
          onClose={() => {
            setBrand(undefined);
            setOperation("create");
            setModal(false);
            fetchData();
          }}
          operation={operation}
          addModal={modal}
        />
      )}

    </>
  );
};
