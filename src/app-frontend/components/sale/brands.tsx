import {Input} from "../input";
import {Trans} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faTrash} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../button";
import React, {useEffect, useState} from "react";
import {Loader} from "../../../app-common/components/loader/loader";
import Highlighter from "react-highlight-words";
import {fetchJson, jsonRequest} from "../../../api/request/request";
import {BRAND_CREATE, BRAND_EDIT, BRAND_LIST} from "../../../api/routing/routes/backend.app";
import {useForm} from "react-hook-form";
import {UnprocessableEntityException} from "../../../lib/http/exception/http.exception";
import {ConstraintViolation} from "../../../lib/validator/validation.result";
import {Brand} from "../../../api/model/brand";

export const Brands = () => {
  const [q, setQ] = useState('');
  const [list, setList] = useState<Brand[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [operation, setOperation] = useState('create');

  const loadBrands = async (q?: string) => {
    setLoading(true);
    try {
      const response = await jsonRequest(BRAND_LIST);
      const json = await response.json();

      setList(json.list);
    } catch (e) {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const {register, handleSubmit, setError, formState: {errors}, reset} = useForm();
  const [creating, setCreating] = useState(false);

  const createBrand = async (values: any) => {
    setCreating(true);
    try {
      let url = '';
      if (values.id) {
        url = BRAND_EDIT.replace(':id', values.id);
      } else {
        url = BRAND_CREATE;
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
        await loadBrands();
      } else {
        setList(prev => {
          return [response.brand, ...prev];
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
      <h3 className="text-xl">Create Brand</h3>
      <form onSubmit={handleSubmit(createBrand)} className="mb-5">
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
                }}
              >Cancel</Button>
            )}
          </div>
        </div>
      </form>

      <Input name="q"
             type="search"
             onChange={(e) => {
               loadBrands(e.target.value);
               setQ(e.target.value);
             }}
             placeholder="Search"
             className="mb-3 mt-3 search-field w-full"/>
      <p className="mb-3">Showing latest 10 items</p>
      {isLoading && (
        <div className="flex justify-center items-center">
          <Loader lines={1} lineItems={2}/>
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
