import {Input} from "../input";
import {Trans} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faTrash} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../button";
import React, {useEffect, useState} from "react";
import {Loader} from "../../../app-common/components/loader/loader";
import Highlighter from "react-highlight-words";
import {fetchJson, jsonRequest} from "../../../api/request/request";
import {SUPPLIER_CREATE, SUPPLIER_EDIT, SUPPLIER_LIST} from "../../../api/routing/routes/backend.app";
import {useForm} from "react-hook-form";
import {UnprocessableEntityException} from "../../../lib/http/exception/http.exception";
import {ConstraintViolation} from "../../../lib/validator/validation.result";
import {Supplier} from "../../../api/model/supplier";

export const Suppliers = () => {
  const [q, setQ] = useState('');
  const [list, setList] = useState<Supplier[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [operation, setOperation] = useState('create');

  const loadSuppliers = async (q?: string) => {
    setLoading(true);
    try {
      const response = await jsonRequest(SUPPLIER_LIST);
      const json = await response.json();

      setList(json.list);
    } catch (e) {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const {register, handleSubmit, setError, formState: {errors}, reset} = useForm();
  const [creating, setCreating] = useState(false);

  const createSupplier = async (values: any) => {
    setCreating(true);
    try {
      let url = '';
      if (values.id) {
        url = SUPPLIER_EDIT.replace(':id', values.id);
      } else {
        url = SUPPLIER_CREATE;
      }

      const response = await fetchJson(url, {
        method: 'POST',
        body: JSON.stringify({
          ...values,
        })
      });

      if (values.id) {
        await loadSuppliers();
      } else {
        setList(prev => {
          return [response.supplier, ...prev];
        });
      }

      reset({
        name: '',
        id: '',
        phone: '',
        email: ''
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
      <h3 className="text-xl">Create Supplier</h3>
      <form onSubmit={handleSubmit(createSupplier)} className="mb-5">
        <input type="hidden" {...register('id')}/>
        <div className="grid grid-cols-5 gap-4 mb-3">
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
            <label htmlFor="phone">Phone</label>
            <Input {...register('phone')} id="phone" className="w-full"/>
            {errors.phone && (
              <div className="text-red-500 text-sm">
                <Trans>
                  {errors.phone.message}
                </Trans>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <Input {...register('email')} id="email" className="w-full"/>
            {errors.email && (
              <div className="text-red-500 text-sm">
                <Trans>
                  {errors.email.message}
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
               loadSuppliers(e.target.value);
               setQ(e.target.value);
             }}
             placeholder="Search"
             className="mb-3 mt-3 search-field w-full"/>
      <p className="mb-3">Showing latest 10 items</p>
      {isLoading && (
        <div className="flex justify-center items-center">
          <Loader lines={10}/>
        </div>
      )}
      {!isLoading && (
        <table className="table border border-collapse">
          <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
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
                <td>{row.phone}</td>
                <td>{row.email}</td>
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
