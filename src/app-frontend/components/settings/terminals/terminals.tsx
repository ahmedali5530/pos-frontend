import React, {useMemo, useState} from 'react';
import {useTranslation} from "react-i18next";
import {createColumnHelper} from "@tanstack/react-table";
import {Button} from "../../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus, faTimes} from "@fortawesome/free-solid-svg-icons";
import {Input} from "../../../../app-common/components/input/input";
import {TableComponent} from "../../../../app-common/components/table/table";
import {Terminal} from '../../../../api/model/terminal';
import {Store} from "../../../../api/model/store";
import {Modal} from "../../../../app-common/components/modal/modal";
import {Product} from "../../../../api/model/product";
import {CreateTerminal} from "./create.terminal";
import {Switch} from "../../../../app-common/components/input/switch";
import {ConfirmAlert} from "../../../../app-common/components/confirm/confirm.alert";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Tables} from "../../../../api/db/tables";
import {StringRecordId} from "surrealdb";
import {useDB} from "../../../../api/db/db";

export const Terminals = () => {
  const [operation, setOperation] = useState('create');
  const [terminal, setTerminal] = useState<Terminal>();
  const [modal, setModal] = useState(false);
  const db = useDB();

  const useLoadHook = useApi<SettingsData<Terminal>>(
    Tables.terminal, [], ['code asc'], 0, 10, ['products', 'store']
  );
  const {fetchData} = useLoadHook;

  const [terminalProducts, setTerminalProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<string>();

  const terminalProductsFilter = useMemo(() => {
    if (filter) {
      return terminalProducts.filter(item => item.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1);
    }

    return terminalProducts;

  }, [terminalProducts, filter]);

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Terminal>();

  const columns = [
    columnHelper.accessor('code', {
      header: ('Code'),
    }),
    columnHelper.accessor('products', {
      header: ('Products'),
      enableColumnFilter: false,
      cell: info => (
        <>
          {info.getValue().slice(0, 7).map(p => p.name).join(', ')}{' '}
          {info.getValue().slice(7).length > 0 && (
            <Button
              className="btn btn-secondary"
              onClick={() => setTerminalProducts(info.getValue())}
              type="button"
            >+{info.getValue().slice(7).length} more
            </Button>
          )}
        </>
      )
    }),
    columnHelper.accessor('store', {
      header: ('Store'),
      enableColumnFilter: false,
      cell: info => info.getValue()?.name
    }),
    columnHelper.accessor('id', {
      header: ('Actions'),
      enableColumnFilter: false,
      enableSorting: false,
      cell: (info) => {
        return (
          <>
            <Button type="button" variant="primary" className="w-[40px]" onClick={() => {
              setTerminal(info.row.original);
              setOperation('update');
              setModal(true);
            }} tabIndex={-1}>
              <FontAwesomeIcon icon={faPencilAlt}/>
            </Button>
            <span className="mx-2 text-gray-300">|</span>
            <ConfirmAlert
              onConfirm={() => {
                deleteTerminal(info.getValue().toString(), !info.row.original.is_active);
              }}
              confirmText="Yes, please"
              cancelText="No, wait"
              title="Confirmation"
              description={`Are you sure to ${info.row.original.is_active ? 'de-' : ''}activate this terminal?`}
            >
              <Switch checked={info.row.original.is_active} readOnly/>
            </ConfirmAlert>
          </>
        )
      }
    })
  ];

  async function deleteTerminal(id: string, status: boolean) {
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
        loaderLineItems={4}
        buttons={[
          <Button variant="primary" onClick={() => {
            setModal(true);
            setOperation('create');
          }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Terminal
          </Button>
        ]}
      />


      {terminalProducts.length > 0 && (
        <Modal open={terminalProducts.length > 0} onClose={() => {
          setTerminalProducts([]);
        }} title="Terminal products" size="full">
          <div className="w-full mb-3">
            <Input type="search" placeholder="Filter products" onChange={(e) => setFilter(e.target.value)}
                   value={filter}/>
          </div>

          {/*TODO: implement removal of products*/}
          <div className="flex flex-wrap gap-3">
            {terminalProductsFilter.map(item => (
              <span
                className="pl-3 rounded-full inline-flex justify-center items-center bg-primary-500 text-white h-[40px] pr-3">
              {item.name}
                <button className="ml-3 bg-white text-danger-500 rounded-full h-[40px] w-[40px] border-2"
                        title={`Remove ${item.name}?`}>
                <FontAwesomeIcon icon={faTimes}/>
              </button>
            </span>
            ))}
          </div>
        </Modal>
      )}

      {modal && (
        <CreateTerminal addModal={modal} onClose={() => {
          setTerminal(undefined);
          setOperation('create');
          setModal(false);
          fetchData();
        }} entity={terminal} operation={operation}/>
      )}
    </>
  );
}
