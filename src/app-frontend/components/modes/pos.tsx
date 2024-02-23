import { useEffect, useMemo, useRef, useState, } from "react";
import { HomeProps, initialData, useLoadData, } from "../../../api/hooks/use.load.data";
import { getStore } from "../../../duck/store/store.selector";
import { getTerminal } from "../../../duck/terminal/terminal.selector";
import { useSelector } from "react-redux";
import { defaultData, defaultState } from "../../../store/jotai";
import { faBarcode, faCubesStacked, faFlag, faIcons, faReply, faRotateRight, } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAtom } from "jotai";
import localforage from "localforage";
import { Controller, useForm } from "react-hook-form";
import { CartItem } from "../../../api/model/cart.item";
import { fetchJson } from "../../../api/request/request";
import { BARCODE_LIST, } from "../../../api/routing/routes/backend.app";
import { notify } from "../../../app-common/components/confirm/notification";
import { getRealProductPrice, scrollToBottom, } from "../../containers/dashboard/pos";
import { CartContainer } from "../cart/cart.container";
import { CartControls } from "../cart/cart.controls";
import { SaleFind } from "../sale/sale.find";
import { CloseSaleInline } from "../sale/sale.inline";
import { SaleBrands } from "../search/sale.brands";
import { SaleCategories } from "../search/sale.categories";
import { SaleDepartments } from "../search/sale.departments";
import { SearchTable } from "../search/search.table";
import { Product } from "../../../api/model/product";
import { ProductVariant } from "../../../api/model/product.variant";
import { Brand } from "../../../api/model/brand";
import { Category } from "../../../api/model/category";
import { Department } from "../../../api/model/department";
import { Barcode } from "../../../api/model/barcode";
import Mousetrap from "mousetrap";
import { Order } from "../../../api/model/order";
import { Tooltip } from "antd";
import { Button } from "../../../app-common/components/input/button";
import { Input } from "../../../app-common/components/input/input";
import { TopbarRight } from "./topbar.right";
import { Footer } from "./footer";
import { TrapFocus } from "../../../app-common/components/container/trap.focus";
import { SearchVariants } from "../search/search.variants";

enum SearchModes {
  sale = "sale",
  refund = "refund",
  reorder = "reorder",
}

export const PosMode = () => {
  const [mode, setMode] = useState(SearchModes.sale);

  const [list, setList] = useState<HomeProps["list"]>(initialData);
  const [paymentTypesList, setPaymentTypesList] =
    useState<HomeProps["paymentTypesList"]>(initialData);
  const store = useSelector(getStore);
  const terminal = useSelector(getTerminal);

  const [state] = useLoadData();
  const [appState, setAppState] = useAtom(defaultState);

  const [appSettings] = useAtom(defaultData);
  const {
    customerBox
  } = appSettings;

  const {
    q,
    added,
    rate,
    customerName
  } = appState;

  useEffect(() => {
    setList(state.list);
    setPaymentTypesList(state.paymentTypesList);
  }, [state.list, state.paymentTypesList]);

  const searchField = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [modal, setModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [brands, setBrands] = useState<{ [key: string]: Brand }>({});
  const [categories, setCategories] = useState<{ [key: string]: Category }>({});
  const [departments, setDepartment] = useState<{ [key: string]: Department }>(
    {}
  );

  const items = useMemo(() => {
    let filtered = list?.list || [];

    if( !filtered ) {
      return [];
    }

    // filter products by store
    if( store && filtered ) {
      filtered = filtered.filter((item) => {
        if( item?.stores?.length > 0 ) {
          const stores = item.stores.map((item) => {
            if( item.store ) {
              return item.store.id;
            }
          });

          return stores.includes(store.id);
        } else {
          return true;
        }
      });
    }

    //filter products by terminal
    if( terminal && filtered ) {
      filtered = filtered.filter((item) => {
        if( item?.terminals?.length > 0 ) {
          const terminals = item.terminals.map((item) => item.id);

          return terminals.includes(terminal.id);
        } else {
          return true;
        }
      });
    }

    const brandIds = Object.keys(brands);
    if( brandIds.length > 0 ) {
      filtered = filtered.filter((item) => {
        if( item?.brands?.length > 0 ) {
          const brandsFilter = item.brands.filter((b) => {
            return brandIds.includes(b.id.toString());
          });

          return brandsFilter.length > 0;
        }

        return false;
      });
    }

    const categoryIds = Object.keys(categories);
    if( categoryIds.length > 0 ) {
      filtered = filtered.filter((item) => {
        if( item?.categories?.length > 0 ) {
          const categoriesFilter = item.categories.filter((c) => {
            return categoryIds.includes(c.id.toString());
          });

          return categoriesFilter.length > 0;
        } else {
          return true;
        }
      });
    }

    const departmentIds = Object.keys(departments);
    if( departmentIds.length > 0 ) {
      filtered = filtered.filter((item) => {
        if( item?.department ) {
          return departmentIds.includes(item.department.id.toString());
        }

        return false;
      });
    }

    if( filtered ) {
      filtered = filtered.filter((item) => {
        if(
          item?.barcode &&
          item?.barcode.toLowerCase().startsWith(q.toLowerCase())
        ) {
          return true;
        }

        return item?.name?.toLowerCase().indexOf(q.toLowerCase()) !== -1;
      });
    }

    return filtered;
  }, [list?.list, q, brands, categories, departments, terminal, store]);

  const itemsMap = useMemo(() => {
    const newItems = [...items];
    const map = new Map();
    newItems.forEach((item) => {
      const i = {
        item,
        isVariant: false,
        variant: undefined,
      };
      map.set(item.barcode, i);
      map.set(item.name, i);

      if( item.variants.length > 0 ) {
        item.variants.forEach((variant) => {
          if( variant.barcode ) {
            const v = {
              isVariant: true,
              variant,
              item,
            };

            map.set(variant.barcode, v);
          }
        });
      }
    });

    return map;
  }, [items]);

  const { handleSubmit, control, reset } = useForm();

  const searchAction = async (values: any) => {

    const item = itemsMap.get(values.q);

    if( item === undefined ) {
      // check in DB for dynamic barcode item
      try {
        const response = await fetchJson(`${BARCODE_LIST}?barcode=${values.q}`);
        if( response["hydra:member"].length > 0 ) {
          const item: Barcode = response["hydra:member"][0];
          if( item.variant ) {
            await addItemVariant(
              item.item,
              item.variant,
              Number(item.measurement),
              Number(item.price)
            );
          }

          if( !item.variant ) {
            await addItem(
              item.item,
              Number(item.measurement),
              Number(item.price)
            );
          }
        } else {
          notify({
            type: "error",
            description: `${values.q} not found`,
            placement: "top",
            duration: 1,
          });
        }
      } catch ( e ) {
        console.log(e);
      }
    }

    if( item !== undefined ) {
      // if main item, add it
      if( !item.isVariant ) {
        await addItem(item.item, Number(values.quantity));
      }

      // if variant add it
      if( item.isVariant ) {
        await addItemVariant(item.item, item.variant, Number(values.quantity));
      }
    }

    reset({
      q: "",
      quantity: 1,
    });
  };

  const addItem = async (item: Product, quantity: number, price?: number) => {
    let newPrice = 0;
    if( item.basePrice ) {
      newPrice = item.basePrice;
    }

    if( price ) {
      newPrice = price;
    }

    if( rate ) {
      newPrice = rate;
    }

    setAppState((prev) => ({
      ...prev,
      latest: item,
      quantity: quantity,
      latestVariant: undefined
    }));

    if( item.variants.length > 0 ) {
      //choose from variants
      setModal(true);
      setModalTitle(`Choose a variant for ${item.name}`);
      setVariants(item.variants);

      setAppState((prev) => ({
        ...prev,
        selectedVariant: 0,
        quantity: quantity,
      }));

      return false;
    }


    const oldItems = added;
    let index = oldItems.findIndex((addItem) => addItem.item.id === item.id);
    if( index !== -1 ) {
      oldItems[index].quantity += quantity;
      setAppState((prev) => ({
        ...prev,
        latestIndex: index,
      }));
    } else {
      oldItems.push({
        quantity: quantity,
        item: item,
        price: newPrice,
        discount: 0,
        taxes: item.taxes,
        taxIncluded: true,
        stock: 0,
      });

      setAppState((prev) => ({
        ...prev,
        latestIndex: oldItems.length - 1,
      }));
    }

    setAppState((prev) => ({
      ...prev,
      added: oldItems,
      q: "",
      quantity: 1,
      // selected: items.findIndex((i) => i.id === item.id),
    }));

    scrollToBottom(containerRef.current);
  };

  const addItemVariant = async (
    item: Product,
    variant: ProductVariant,
    quantity: number,
    price?: number
  ) => {
    const oldItems = added;
    let index = oldItems.findIndex((addItem) => {
      return addItem.item.id === item.id && addItem.variant === variant;
    });

    const variantPrice = price ? price : (variant?.price
      ? variant.price
      : getRealProductPrice(item));

    if( index !== -1 ) {
      oldItems[index].quantity += quantity;
    } else {
      oldItems.push({
        quantity: quantity,
        item: item,
        price: variantPrice,
        variant: variant,
        discount: 0,
        taxes: item.taxes,
        taxIncluded: true,
        stock: 0,
      });
    }

    setAppState((prev) => ({
      ...prev,
      latest: item,
      added: oldItems,
      selected: items.findIndex((i) => i.id === item.id),
      quantity: 1,
      selectedVariant: 0,
      q: "",
      latestQuantity: quantity,
      latestRate: variantPrice,
      latestVariant: variant,
    }));

    setModal(false);
    setVariants([]);

    scrollToBottom(containerRef.current);
  };

  useEffect(() => {
    if( added.length === 0 ) {
      setAppState((prev) => ({
        ...prev,
        adjustment: 0,
      }));
    }
  }, [added]);

  useEffect(() => {
    //set default discount, tax
    setDefaultOptions();
  }, []);

  const setDefaultOptions = () => {
    localforage.getItem("defaultDiscount").then((data: any) => {
      setAppState((prev) => ({
        ...prev,
        discount: data,
      }));
    });
    localforage.getItem("defaultTax").then((data: any) => {
      setAppState((prev) => ({
        ...prev,
        tax: data,
      }));
    });
  };

  // useEffect(() => {

  // }, [modal, selected, selectedVariant, variants, items, added, quantity]);

  // useEffect(() => {
  Mousetrap.bind("f3", function (e: any) {
    e.preventDefault();
    if( searchField.current !== null ) {
      searchField.current.focus();
    }
  });
  // }, [searchField.current]);

  const refundOrder = async (order: Order) => {
    const items: CartItem[] = [];
    order.items.forEach((item) => {
      items.push({
        quantity: -1 * item.quantity,
        price: item.price,
        discount: 0,
        variant: item.variant,
        item: item.product,
        taxes: item.taxes,
        taxIncluded: true,
      });
    });

    setAppState((prev) => ({
      ...prev,
      added: items,
      discount: order.discount?.type,
      tax: order.tax?.type,
      discountAmount: order.discount?.amount,
      customer: order?.customer,
      refundingFrom: Number(order.id),
    }));
  };

  const reOrder = async (order: Order) => {
    const items: CartItem[] = [];
    order.items.forEach((item) => {
      items.push({
        quantity: item.quantity,
        price: item.price,
        discount: 0,
        variant: item.variant,
        item: item.product,
        taxes: item.taxes,
        taxIncluded: true,
      });
    });

    setAppState((prev) => ({
      ...prev,
      added: items,
      discount: order.discount?.type,
      tax: order.tax?.type,
      discountAmount: order.discount?.amount,
      customer: order?.customer,
    }));
  };

  return (
    <>
      <TrapFocus inputRef={searchField.current}>
        <div className="flex flex-col">
          <div className="flex flex-row gap-5 p-2 bg-white">
            <div className="gap-2 flex">
              <div className="input-group">
                <SaleBrands brands={brands} setBrands={setBrands}>
                  <FontAwesomeIcon icon={faFlag}/>
                </SaleBrands>
                <SaleCategories
                  categories={categories}
                  setCategories={setCategories}>
                  <FontAwesomeIcon icon={faCubesStacked}/>
                </SaleCategories>
                <SaleDepartments
                  departments={departments}
                  setDepartments={setDepartment}>
                  <FontAwesomeIcon icon={faIcons}/>
                </SaleDepartments>
              </div>
            </div>
            <div className="flex flex-1 gap-3">
              <div className="input-group">
                <Tooltip title="Barcode search">
                  <Button
                    variant="primary"
                    className="btn-square"
                    type="button"
                    active={mode === SearchModes.sale}
                    size="lg"
                    onClick={() => setMode(SearchModes.sale)}>
                    <FontAwesomeIcon icon={faBarcode}/>
                  </Button>
                </Tooltip>
                <SearchTable
                  items={items}
                  addItem={addItem}
                  onClick={() => setMode(SearchModes.sale)}
                />
              </div>
              <div className="input-group">
                {/*TODO: add voice search here*/}
                <SaleFind
                  icon={faReply}
                  title="Refund"
                  variant="danger"
                  onSuccess={refundOrder}
                  onError={() => {
                    notify({
                      title: "Not found",
                      description: "Order not found",
                      type: "error",
                      placement: "top",
                    });
                  }}
                  displayLabel
                />
                <SaleFind
                  icon={faRotateRight}
                  title="Re Order"
                  variant="success"
                  onSuccess={reOrder}
                  onError={() => {
                    notify({
                      title: "Not found",
                      description: "Order not found",
                      type: "error",
                      placement: "top",
                    });
                  }}
                  displayLabel
                />
              </div>
              <form
                className="flex gap-3"
                onSubmit={handleSubmit(searchAction)}>
                <div className="input-group">
                  <Controller
                    render={({ field }) => (
                      <Input
                        placeholder="Scan barcode or search by name"
                        ref={searchField}
                        autoFocus
                        type="search"
                        className="search-field mousetrap lg w-72"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                    name="q"
                    control={control}
                    rules={{ required: true }}
                    defaultValue=""
                  />

                  <Controller
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Quantity"
                        className="w-28 mousetrap lg"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                    name="quantity"
                    control={control}
                    defaultValue={1}
                    rules={{ required: true }}
                  />
                </div>
                <button className="hidden">submit</button>
              </form>
              {customerBox && (
                <Input
                  placeholder="Enter customer name"
                  className="lg mousetrap"
                  onChange={(event) => {
                    setAppState(prev => ({
                      ...prev,
                      customerName: event.target.value
                    }))
                  }}
                  value={customerName}
                />
              )}

            </div>
            <div className="mr-auto">
              <TopbarRight/>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 p-3">
            <div className="col-span-3">
              <CartControls containerRef={containerRef.current}/>
              <div
                className="block overflow-auto h-[calc(100vh_-_230px)] bg-white"
                ref={containerRef}>
                <CartContainer/>
              </div>
              <div className="flex gap-4 mt-3 items-center h-[50px]">
                <Footer/>
              </div>
            </div>
            <div className="col-span-1 bg-white p-3">
              <CloseSaleInline
                paymentTypesList={paymentTypesList.list}
                isInline={true}
              />
            </div>
          </div>
        </div>
      </TrapFocus>
      <SearchVariants
        modal={modal}
        onClose={() => {
          setModal(false);
          setVariants([]);
        }}
        variants={variants}
        addItemVariant={addItemVariant}
        items={items}
      />
    </>
  );
};
