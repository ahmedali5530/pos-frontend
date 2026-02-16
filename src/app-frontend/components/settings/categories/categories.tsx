import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus,} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../../../../app-common/components/input/button";
import React, {useState} from "react";
import {Category} from "../../../../api/model/category";
import {TableComponent} from "../../../../app-common/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import {CreateCategory} from "./create.category";
import {ConfirmAlert} from "../../../../app-common/components/confirm/confirm.alert";
import {Switch} from "../../../../app-common/components/input/switch";
import {Tables} from "../../../../api/db/tables";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {useDB} from "../../../../api/db/db";
import {StringRecordId} from "surrealdb";

export const Categories = () => {
  const [operation, setOperation] = useState("create");
  const [category, setCategory] = useState<Category>();
  const [modal, setModal] = useState(false);

  const db = useDB();

  const useLoadHook = useApi<SettingsData<Category>>(
    Tables.category,
    [], [], 0, 10, ['stores']
  );
  const {fetchData} = useLoadHook;

  const columnHelper = createColumnHelper<Category>();

  const columns: any[] = [
    columnHelper.accessor("name", {
      header: "Name",
    }),
    columnHelper.accessor("stores", {
      header: "Stores",
      cell: (info) =>
        info
          .getValue()
          .map((item) => item.name)
          .join(", "),
      enableColumnFilter: false,
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
                setCategory(info.row.original);
                setOperation("update");
                setModal(true);
              }}
              tabIndex={-1}>
              <FontAwesomeIcon icon={faPencilAlt}/>
            </Button>
            <span className="mx-2 text-gray-300">|</span>
            <ConfirmAlert
              onConfirm={() => {
                deleteCategory(
                  info.getValue().toString(),
                  !info.row.original.is_active
                );
              }}
              confirmText="Yes, please"
              cancelText="No, wait"
              title="Confirmation"
              description={`Are you sure to ${info.row.original.is_active ? 'de-' : ''}activate this category?`}
            >
              <Switch checked={info.row.original.is_active} readOnly/>
            </ConfirmAlert>
          </>
        );
      },
    }),
  ];

  async function deleteCategory(id: string, status: boolean) {
    await db.merge(new StringRecordId(id), {
      is_active: status,
    });

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
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Category
          </Button>
        ]}
      />

      {modal && (
        <CreateCategory
          entity={category}
          onClose={() => {
            setCategory(undefined);
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
