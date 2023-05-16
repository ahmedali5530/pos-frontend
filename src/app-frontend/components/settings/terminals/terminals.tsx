import React, {useEffect, useMemo, useState} from 'react';
import {useLoadList} from "../../../../api/hooks/use.load.list";
import {
  CATEGORY_LIST, PRODUCT_KEYWORDS,
  STORE_LIST,
  TERMINAL_CREATE,
  TERMINAL_GET,
  TERMINAL_LIST
} from "../../../../api/routing/routes/backend.app";
import {Trans, useTranslation} from "react-i18next";
import {createColumnHelper} from "@tanstack/react-table";
import {Button} from "../../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus, faTimes, faTrash} from "@fortawesome/free-solid-svg-icons";
import {Controller, useForm} from "react-hook-form";
import {useAlert} from "react-alert";
import {fetchJson} from "../../../../api/request/request";
import {HttpException, UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {ConstraintViolation, ValidationResult} from "../../../../lib/validator/validation.result";
import {Input} from "../../../../app-common/components/input/input";
import {TableComponent} from "../../../../app-common/components/table/table";
import { Terminal } from '../../../../api/model/terminal';
import {Store} from "../../../../api/model/store";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {ReactSelectOptionProps} from "../../../../api/model/common";
import {Category} from "../../../../api/model/category";
import {Modal} from "../../../../app-common/components/modal/modal";
import {StoresInput} from "../../../../app-common/components/input/stores";
import {Product} from "../../../../api/model/product";
import {CreateTerminal} from "./create.terminal";
import {Tax} from "../../../../api/model/tax";

export const Terminals = () => {
  const [operation, setOperation] = useState('create');
  const [terminal, setTerminal] = useState<Terminal>();
  const [modal, setModal] = useState(false);

  const useLoadHook = useLoadList<Terminal>(TERMINAL_LIST);
  const {fetchData} = useLoadHook;

  const [terminalProducts, setTerminalProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<string>();

  const terminalProductsFilter = useMemo(() => {
    if(filter) {
      return terminalProducts.filter(item => item.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1);
    }

    return terminalProducts;

  }, [terminalProducts, filter]);

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Terminal>();

  const columns = [
    columnHelper.accessor('code', {
      header: () => t('Code'),
    }),
    columnHelper.accessor('products', {
      header: () => t('Products'),
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
              setTerminal(info.row.original);
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
        loaderLineItems={4}
        buttons={[{
          html: <Button variant="primary" onClick={() => {
            setModal(true);
            setOperation('create');
          }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Terminal
          </Button>
        }]}
      />

      <Modal open={terminalProducts.length > 0} onClose={() => {
        setTerminalProducts([]);
      }} title="Terminal products" size="full">
        <div className="w-full mb-3">
          <Input type="search" placeholder="Filter products" onChange={(e) => setFilter(e.target.value)} value={filter} />
        </div>

        {/*TODO: implement removal of products*/}
        <div className="flex flex-wrap gap-3">
          {terminalProductsFilter.map(item => (
            <span className="pl-3 rounded-full inline-flex justify-center items-center bg-primary-500 text-white h-[40px] pr-3">
              {item.name}
              {/*<button className="ml-3 bg-white text-danger-500 rounded-full h-[40px] w-[40px] border-2" title={`Remove ${item.name}?`}>
                <FontAwesomeIcon icon={faTimes} />
              </button>*/}
            </span>
          ))}
        </div>
      </Modal>

      <CreateTerminal addModal={modal} onClose={() => {
        setTerminal(undefined);
        setOperation('create');
        setModal(false);
        fetchData();
      }} entity={terminal} operation={operation} />
    </>
  );
}
