import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../../../../app-common/components/input/button";
import React, {useState} from "react";
import {Department} from "../../../../api/model/department";
import {DEPARTMENT_LIST,} from "../../../../api/routing/routes/backend.app";
import {TableComponent} from "../../../../app-common/components/table/table";
import {useLoadList} from "../../../../api/hooks/use.load.list";
import {createColumnHelper} from "@tanstack/react-table";
import {useSelector} from "react-redux";
import {getStore} from "../../../../duck/store/store.selector";
import {CreateDepartment} from "./create.department";

export const Departments = () => {
  const [operation, setOperation] = useState('create');

  const useLoadHook = useLoadList<Department>(DEPARTMENT_LIST);
  const {fetchData} = useLoadHook;
  const [department, setDepartment] = useState<Department>();
  const [modal, setModal] = useState(false);

  const store = useSelector(getStore);

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Department>();

  const columns: any[] = [
    columnHelper.accessor('name', {
      header: () => t('Name'),
    }),
    columnHelper.accessor('description', {
      header: () => t('Description'),
    }),
    columnHelper.accessor('store', {
      header: () => t('Store'),
      cell: info => info.getValue()?.name
    }),
    columnHelper.accessor('id', {
      header: () => t('Actions'),
      enableSorting: false,
      cell: (info) => {
        return (
          <>
            <Button type="button" variant="primary" className="w-[40px]" onClick={() => {
              setDepartment(info.row.original);
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
        loaderLineItems={3}
        buttons={[{
          html: <Button variant="primary" onClick={() => {
            setModal(true);
            setOperation('create');
          }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Department
          </Button>
        }]}
      />

      <CreateDepartment addModal={modal} onClose={() => {
        setModal(false);
        setOperation('create');
        fetchData();
        setDepartment(undefined);
      }} operation={operation} entity={department}/>
    </>
  );
};