import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../../../../app-common/components/input/button";
import React, {useState} from "react";
import { BRAND_EDIT, BRAND_LIST, CUSTOMER_LIST, PURCHASE_DELETE } from "../../../../api/routing/routes/backend.app";
import {Brand} from "../../../../api/model/brand";
import {createColumnHelper} from "@tanstack/react-table";
import {TableComponent} from "../../../../app-common/components/table/table";
import {useSelector} from "react-redux";
import {getStore} from "../../../../duck/store/store.selector";
import {CreateBrand} from "./create.brand";
import useApi from "../../../../api/hooks/use.api";
import {HydraCollection} from "../../../../api/model/hydra";
import { jsonRequest } from "../../../../api/request/request";
import { ConfirmAlert } from "../../../../app-common/components/confirm/confirm.alert";
import { Switch } from "../../../../app-common/components/input/switch";

export const Brands = () => {
  const [operation, setOperation] = useState('create');
  const [brand, setBrand] = useState<Brand>();
  const [modal, setModal] = useState(false);

  const store = useSelector(getStore);
  const useLoadHook = useApi<HydraCollection<Brand>>('brands', BRAND_LIST, {
    store: store?.id
  });
  const {fetchData} = useLoadHook;

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Brand>();

  const columns: any = [
    columnHelper.accessor('name', {
      header: ('Name'),
    }),
    columnHelper.accessor('stores', {
      header: ('Stores'),
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => info.getValue().map(item => item.name).join(', ')
    }),
    columnHelper.accessor('id', {
      id: 'actions',
      header: ('Actions'),
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => {
        return (
          <>
            <Button type="button" variant="primary" className="w-[40px]" onClick={() => {
              setBrand(info.row.original);
              setOperation('update');
              setModal(true);
            }} tabIndex={-1}>
              <FontAwesomeIcon icon={faPencilAlt}/>
            </Button>
            <span className="mx-2 text-gray-300">|</span>
            <ConfirmAlert
              onConfirm={() => {
                deleteBrand(info.getValue().toString(), !info.row.original.isActive);
              }}
              confirmText="Yes, please"
              cancelText="No, wait"
              title="Confirm deletion"
              description="Are you sure to delete this purchase?"
            >
              <Switch checked={info.row.original.isActive} readOnly />
            </ConfirmAlert>
          </>
        )
      }
    })
  ];

  async function deleteBrand(id: string, status: boolean) {
    await jsonRequest(BRAND_EDIT.replace(':id', id), {
      method: 'PUT',
      body: JSON.stringify({
        isActive: status
      })
    });

    await useLoadHook.fetchData();
  }


  return (
    <>
      <TableComponent
        columns={columns}
        useLoadList={useLoadHook}
        loaderLineItems={3}
        buttons={[{
          html: <Button variant="primary" onClick={() => {
            setModal(true);
            setOperation('create');
          }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Brand
          </Button>
        }]}
      />

      <CreateBrand entity={brand} onClose={() => {
        setBrand(undefined);
        setOperation('create');
        setModal(false);
        fetchData();
      }} operation={operation} addModal={modal}/>
    </>
  );
};
