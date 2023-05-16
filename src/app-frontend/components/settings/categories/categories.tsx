import {Input} from "../../../../app-common/components/input/input";
import {Trans, useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../../../../app-common/components/input/button";
import React, {useState} from "react";
import {Category} from "../../../../api/model/category";
import {fetchJson} from "../../../../api/request/request";
import {CATEGORY_CREATE, CATEGORY_GET, CATEGORY_LIST,} from "../../../../api/routing/routes/backend.app";
import {useForm} from "react-hook-form";
import {UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {ConstraintViolation} from "../../../../lib/validator/validation.result";
import {TableComponent} from "../../../../app-common/components/table/table";
import {useLoadList} from "../../../../api/hooks/use.load.list";
import {createColumnHelper} from "@tanstack/react-table";
import {useSelector} from "react-redux";
import {ReactSelectOptionProps} from "../../../../api/model/common";
import {getStore} from "../../../../duck/store/store.selector";
import {StoresInput} from "../../../../app-common/components/input/stores";
import {CreateCategory} from "./create.category";
import {Brand} from "../../../../api/model/brand";

export const Categories = () => {
  const [operation, setOperation] = useState('create');
  const [category, setCategory] = useState<Category>();
  const [modal, setModal] = useState(false);

  const useLoadHook = useLoadList<Category>(CATEGORY_LIST);
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
