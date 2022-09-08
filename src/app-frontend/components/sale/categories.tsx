import {Input} from "../input";
import {Trans} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faRefresh, faTrash} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../button";
import {ImportItems} from "./import.items";
import {ExportItems} from "./export.items";
import React, {useEffect, useState} from "react";
import {Loader} from "../../../app-common/components/loader/loader";
import Highlighter from "react-highlight-words";
import {Category} from "../../../api/model/category";
import {fetchJson, jsonRequest} from "../../../api/request/request";
import {
  CATEGORY_CREATE,
  CATEGORY_GET,
  CATEGORY_LIST,
  PRODUCT_CREATE,
  PRODUCT_GET
} from "../../../api/routing/routes/backend.app";
import {useForm} from "react-hook-form";
import {UnprocessableEntityException} from "../../../lib/http/exception/http.exception";
import {ConstraintViolation} from "../../../lib/validator/validation.result";

export const Categories = () => {
  const [q, setQ] = useState('');
  const [list, setList] = useState<Category[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [operation, setOperation] = useState('create');

  const loadCategories = async (q?: string) => {
    setLoading(true);
    try {
      const response = await jsonRequest(CATEGORY_LIST);
      const json = await response.json();

      setList(json.list);
    } catch (e) {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

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

      const response = await fetchJson(url, {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          type: 'product',
          isActive: true
        })
      });

      if (values.id) {
        await loadCategories();
      } else {
        setList(prev => {
          return [response.category, ...prev];
        });
      }

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

      <Input name="q"
             type="search"
             onChange={(e) => {
               loadCategories(e.target.value);
               setQ(e.target.value);
             }}
             placeholder="Search"
             className="mb-3 mt-3 search-field w-full"/>
      <p className="mb-3">Showing latest 10 items</p>
      {isLoading && (
        <div className="flex justify-center items-center">
          <Loader lines={1} lineItems={4}/>
        </div>
      )}
      {!isLoading && (
        <table className="table border border-collapse">
          <thead>
          <tr>
            <th>Name</th>
            <th>Action</th>
          </tr>
          </thead>
          <tbody>
          {list.map((row, index) => {
            return (
              <tr key={index} className="hover:bg-gray-100">
                <td>
                  <Highlighter
                    highlightClassName="YourHighlightClass"
                    searchWords={[q]}
                    autoEscape={true}
                    textToHighlight={row.name}
                  />
                </td>
                <td>
                  <Button type="button" variant="primary" className="w-[40px]" onClick={() => {
                    reset(row);
                    setOperation('update');
                  }} tabIndex={-1}>
                    <FontAwesomeIcon icon={faPencilAlt}/>
                  </Button>
                  <span className="mx-2 text-gray-300">|</span>
                  <Button type="button" variant="danger" className="w-[40px]" tabIndex={-1}>
                    <FontAwesomeIcon icon={faTrash}/>
                  </Button>
                </td>
              </tr>
            )
          })}
          </tbody>
        </table>
      )}
    </>
  );
};
