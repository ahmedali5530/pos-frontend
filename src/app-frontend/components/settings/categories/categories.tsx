import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../../../../app-common/components/input/button";
import React, {useState} from "react";
import {Category} from "../../../../api/model/category";
import {CATEGORY_LIST,} from "../../../../api/routing/routes/backend.app";
import {TableComponent} from "../../../../app-common/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import {useSelector} from "react-redux";
import {getStore} from "../../../../duck/store/store.selector";
import {CreateCategory} from "./create.category";
import useApi from "../../../../api/hooks/use.api";
import {HydraCollection} from "../../../../api/model/hydra";

export const Categories = () => {
  const [operation, setOperation] = useState('create');
  const [category, setCategory] = useState<Category>();
  const [modal, setModal] = useState(false);

  const useLoadHook = useApi<HydraCollection<Category>>('categories', CATEGORY_LIST);
  const {fetchData} = useLoadHook;

  const store = useSelector(getStore);

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Category>();

  const columns: any[] = [
    columnHelper.accessor('name', {
      header: () => t('Name'),
    })
  ];

  // if(user?.roles.includes('ROLE_ADMIN')) {
  columns.push(columnHelper.accessor('stores', {
    header: () => t('Stores'),
    cell: info => info.getValue().map(item => item.name).join(', ')
  }));
  // }

  columns.push(columnHelper.accessor('id', {
    header: () => t('Actions'),
    enableSorting: false,
    cell: (info) => {
      return (
        <>
          <Button type="button" variant="primary" className="w-[40px]" onClick={() => {
            setCategory(info.row.original);
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
  }));

  return (
    <>
      <TableComponent
        columns={columns}
        useLoadList={useLoadHook}
        params={{
          store: store?.id
        }}
        loaderLineItems={3}
        buttons={[{
          html: <Button variant="primary" onClick={() => {
            setModal(true);
            setOperation('create');
          }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Category
          </Button>
        }]}
      />

      <CreateCategory
        entity={category}
        onClose={() => {
          setCategory(undefined);
          setOperation('create');
          setModal(false);
          fetchData();
        }} operation={operation} addModal={modal}
      />
    </>
  );
};
