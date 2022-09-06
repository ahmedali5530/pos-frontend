import {Button} from "../button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faList, faPencilAlt, faRefresh, faSpinner, faTrash} from "@fortawesome/free-solid-svg-icons";
import {Modal} from "../modal";
import {Input} from "../input";
import React, {useEffect, useState} from "react";
import {fetchJson, jsonRequest} from "../../../api/request/request";
import {useForm} from "react-hook-form";
import {Product} from "../../../api/model/product";
import {Category} from "../../../api/model/category";
import Highlighter from "react-highlight-words";
import {ImportItems} from "./import.items";
import {ExportItems} from './export.items';
import {CATEGORY_LIST, PRODUCT_CREATE, PRODUCT_GET, PRODUCT_LIST} from "../../../api/routing/routes/backend.app";
import {ConstraintViolation} from "../../../lib/validator/validation.result";
import {Trans} from "react-i18next";
import {UnprocessableEntityException} from "../../../lib/http/exception/http.exception";
import { Loader } from "../../../app-common/components/loader/loader";
import {Tab, TabContent, TabControl, TabNav} from "../../../app-common/components/tabs/tabs";
import {Categories} from "./categories";
import {Suppliers} from "./suppliers";
import {Brands} from "./brands";

export const Items = () => {
  const [modal, setModal] = useState(false);
  const [list, setList] = useState<Product[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [operation, setOperation] = useState('create');

  const loadItems = async (q?: string) => {
    // if (!q) {
      setLoading(true);
    // }

    try {
      const queryParams = new URLSearchParams({
        limit: '10',
        orderBy: 'id',
        orderMode: 'DESC'
      });

      if (q) {
        queryParams.append('q', q);
      }

      const response = await jsonRequest(PRODUCT_LIST + '?' + queryParams.toString());
      const json = await response.json();

      setList(json.list);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await jsonRequest(CATEGORY_LIST);
      const json = await response.json();

      setCategories(json.list);
    } catch (e) {

    } finally {

    }
  };

  useEffect(() => {
    if (modal) {
      loadItems();
      loadCategories();
    }

    resetForm();
  }, [modal]);

  const {register, handleSubmit, setError, formState: {errors}, reset, getValues} = useForm();
  const [creating, setCreating] = useState(false);

  const createProduct = async (values: any) => {
    setCreating(true);
    try {
      let url = '';
      if (values.id) {
        url = PRODUCT_GET.replace(':id', values.id);
      } else {
        url = PRODUCT_CREATE;
      }

      const response = await fetchJson(url, {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          uom: 'Unit',
          baseQuantity: 1,
          quantity: 1000,
          category: categories[0].id,
          isAvailable: true,
          isActive: true
        })
      });

      if (values.id) {
        await loadItems();
      } else {
        setList(prev => {
          return [response.product, ...prev];
        });
      }

      resetForm();
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

  const resetForm = () => {
    reset({
      barcode: null,
      basePrice: null,
      baseQuantity: null,
      category: null,
      cost: null,
      createdAt: null,
      id: null,
      isActive: null,
      isAvailable: null,
      name: null,
      prices: null,
      quantity: null,
      sku: null,
      uom: null,
      updatedAt: null,
      uuid: null,
      variants: null
    });
  };

  const [q, setQ] = useState('');

  return (
    <>
      <Button variant="primary" size="lg" onClick={() => {
        setModal(true);
      }} title="Items"><FontAwesomeIcon icon={faList} className="mr-3"/> Items</Button>

      <Modal shouldCloseOnEsc={false} open={modal} onClose={() => {
        setModal(false);
      }} title="Items">
        <TabControl
          defaultTab="list"
          render={({isTabActive, setActiveTab, activeTab}) => (
            <>
              <TabNav>
                <Tab isActive={isTabActive('list')} onClick={() => setActiveTab('list')}>Items list</Tab>
                <Tab isActive={isTabActive('form')} onClick={() => setActiveTab('form')}>{operation === 'create' ? 'Create item' : 'Update item'}</Tab>
                <Tab isActive={isTabActive('categories')} onClick={() => setActiveTab('categories')}>Categories</Tab>
                <Tab isActive={isTabActive('suppliers')} onClick={() => setActiveTab('suppliers')}>Suppliers</Tab>
                <Tab isActive={isTabActive('brands')} onClick={() => setActiveTab('brands')}>Brands</Tab>
                <Tab isActive={isTabActive('purchase')} onClick={() => setActiveTab('purchase')}>Purchase</Tab>
              </TabNav>
              <TabContent isActive={isTabActive('list')}>
                <>
                  <Input name="q"
                         type="search"
                         onChange={(e) => {
                           loadItems(e.target.value);
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
                        <th>Barcode</th>
                        <th>Sale Price</th>
                        <th>Purchase Price</th>
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
                              {row.barcode && (
                                <Highlighter
                                  highlightClassName="YourHighlightClass"
                                  searchWords={[q]}
                                  autoEscape={true}
                                  textToHighlight={row.barcode}
                                />
                              )}
                            </td>
                            <td>
                              <Highlighter
                                highlightClassName="YourHighlightClass"
                                searchWords={[q]}
                                autoEscape={true}
                                textToHighlight={row.basePrice.toString()}
                              />
                            </td>
                            <td>{row.cost}</td>
                            <td>
                              <Button type="button" variant="primary" className="w-[40px]" onClick={() => {
                                reset(row);
                                setOperation('update');
                                setActiveTab('form');
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
              </TabContent>
              <TabContent isActive={isTabActive('form')}>
                <form onSubmit={handleSubmit(createProduct)} className="mb-5">
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
                      <label htmlFor="barcode">Barcode</label>
                      <div className="relative">
                        <Input {...register('barcode')} id="barcode" className="pr-[36px] w-full"/>
                        <button onClick={() => {
                          reset({
                            ...getValues(),
                            barcode: Math.floor(Math.random() * 10000000000) + 1
                          });
                        }} className="bg-gray-100 absolute top-[2px] bottom-[2px] right-[2px] p-2 px-3 rounded-lg" type="button"
                                tabIndex={-1}>
                          <FontAwesomeIcon icon={faRefresh}/>
                        </button>
                      </div>
                      {errors.barcode && (
                        <div className="text-red-500 text-sm">
                          <Trans>
                            {errors.barcode.message}
                          </Trans>
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="basePrice">Sale price</label>
                      <Input {...register('basePrice')} id="basePrice" className="w-full"/>
                      {errors.basePrice && (
                        <div className="text-red-500 text-sm">
                          <Trans>
                            {errors.basePrice.message}
                          </Trans>
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="cost">Purchase price</label>
                      <Input {...register('cost')} id="cost" className="w-full"/>
                      {errors.cost && (
                        <div className="text-red-500 text-sm">
                          <Trans>
                            {errors.cost.message}
                          </Trans>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button variant="primary" size="lg" type="submit"
                          disabled={creating}>{creating ? 'Saving...' : (operation === 'create' ? 'Create new' : 'Update')}</Button>
                  {operation === 'update' && (
                    <Button
                      variant="secondary"
                      size="lg" className="ml-3"
                      type="button"
                      onClick={() => {
                        resetForm();
                        setOperation('create');
                        setActiveTab('list');
                      }}
                    >Cancel</Button>
                  )}
                  <div className="inline-flex justify-end float-right">
                    <span className="ml-3"><ImportItems/></span>
                    <span className="ml-3"><ExportItems/></span>
                  </div>
                </form>
              </TabContent>
              <TabContent isActive={isTabActive('categories')}>
                <Categories />
              </TabContent>
              <TabContent isActive={isTabActive('suppliers')}>
                <Suppliers />
              </TabContent>
              <TabContent isActive={isTabActive('brands')}>
                <Brands />
              </TabContent>
              <TabContent isActive={isTabActive('purchase')}>purchases</TabContent>
            </>
          )}
        />
      </Modal>
    </>
  );
};
