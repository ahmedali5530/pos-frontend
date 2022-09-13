import {Input} from "../../input";
import {Trans, useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faTrash} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../../button";
import React, {useState} from "react";
import {Category} from "../../../../api/model/category";
import {fetchJson} from "../../../../api/request/request";
import {CATEGORY_CREATE, CATEGORY_GET, CATEGORY_LIST,} from "../../../../api/routing/routes/backend.app";
import {useForm} from "react-hook-form";
import {UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {ConstraintViolation} from "../../../../lib/validator/validation.result";
import {TableComponent} from "../../../../app-common/components/table/table";
import {useLoadList} from "../../../../api/hooks/use.load.list";
import {Product} from "../../../../api/model/product";
import {createColumnHelper} from "@tanstack/react-table";

export const Categories = () => {
  const [operation, setOperation] = useState('create');

  const useLoadHook = useLoadList<Category>(CATEGORY_LIST);
  const [state, action] = useLoadHook;

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Product>();

  const columns = [
    columnHelper.accessor('name', {
      header: () => t('Name'),
    }),
    columnHelper.accessor('id', {
      header: () => t('Actions'),
      enableSorting: false,
      cell: (info) => {
        return (
          <>
            <Button type="button" variant="primary" className="w-[40px]" onClick={() => {
              reset(info.row.original);
              setOperation('update');
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

  const {register, handleSubmit, setError, formState: {errors}, reset} = useForm();
  const [creating, setCreating] = useState(false);

  const createCategory = async (values: any) => {
    setCreating(true);
    try {
      let url = '';
      if (values.id) {
        url = CATEGORY_GET.replace(':id', values.id);
      } else {
        url = CATEGORY_CREATE;
      }

      await fetchJson(url, {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          type: 'product',
          isActive: true
        })
      });

      await action.loadList();

      reset({
        name: '',
        id: ''
      });
      setOperation('create');

    } catch (exception: any) {
      if (exception instanceof UnprocessableEntityException) {
        const e = await exception.response.json();
        e.violations.forEach((item: ConstraintViolation) => {
          setError(item.propertyPath, {
            message: item.message,
            type: 'server'
          });
        });

        return false;
      }

      throw exception;
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <h3 className="text-xl">Create Category</h3>
      <form onSubmit={handleSubmit(createCategory)} className="mb-5">
        <input type="hidden" {...register('id')}/>
        <div className="grid grid-cols-4 gap-4 mb-3">
          <div>
            <label htmlFor="name">Name</label>
            <Input {...register('name')} id="name" className="w-full"/>
            {errors.name && (
              <div className="text-red-500 text-sm">
                <Trans>
                  {errors.name.message}
                </Trans>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="" className="block w-full">&nbsp;</label>
            <Button variant="primary" type="submit" disabled={creating}>
              {creating ? 'Saving...' : (operation === 'create' ? 'Create new' : 'Update')}
            </Button>

            {operation === 'update' && (
              <Button
                variant="secondary"
                className="ml-3"
                type="button"
                onClick={() => {
                  setOperation('create');
                  reset({
                    name: null,
                    id: null
                  });
                }}
              >Cancel</Button>
            )}
          </div>
        </div>
      </form>

      <TableComponent
        columns={columns}
        useLoadList={useLoadHook}
      />
    </>
  );
};
