import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../../../../app-common/components/input/button";
import React, {useState} from "react";
import {BRAND_LIST} from "../../../../api/routing/routes/backend.app";
import {Brand} from "../../../../api/model/brand";
import {useLoadList} from "../../../../api/hooks/use.load.list";
import {createColumnHelper} from "@tanstack/react-table";
import {TableComponent} from "../../../../app-common/components/table/table";
import {useSelector} from "react-redux";
import {getStore} from "../../../../duck/store/store.selector";
import {CreateBrand} from "./create.brand";

export const Brands = () => {
  const [operation, setOperation] = useState('create');
  const [brand, setBrand] = useState<Brand>();
  const [modal, setModal] = useState(false);

  const useLoadHook = useLoadList<Brand>(BRAND_LIST);
  const {fetchData} = useLoadHook;
  const store = useSelector(getStore);

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Brand>();

  const columns: any = [
    columnHelper.accessor('name', {
      header: () => t('Name'),
    }),
    columnHelper.accessor('stores', {
      header: () => t('Stores'),
      enableSorting: false,
      cell: (info) => info.getValue().map(item => item.name).join(', ')
    }),
    columnHelper.accessor('id', {
      header: () => t('Actions'),
      enableSorting: false,
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
            <Button type="button" variant="danger" className="w-[40px]" tabIndex={-1}>
              <FontAwesomeIcon icon={faTrash}/>
            </Button>
          </>
        )
      }
    })
  ];


  return (
    <>
      <TableComponent
        columns={columns}
        useLoadList={useLoadHook}
        params={{
          store: store?.id
        }}
        loaderLineItems={2}
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
