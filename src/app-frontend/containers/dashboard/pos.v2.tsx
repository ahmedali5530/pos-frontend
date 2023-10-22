import React, {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Button } from "../../../app-common/components/input/button";
import { Input } from "../../../app-common/components/input/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBarcode,
  faCubesStacked,
  faFlag,
  faIcons,
  faReply,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "antd";
import { CartContainer } from "../../components/cart/cart.container";
import { CartItem } from "../../../api/model/cart.item";
import { notify } from "../../../app-common/components/confirm/notification";
import {
  getExclusiveRowTotal,
  getRealProductPrice,
  getRowTotal,
  scrollToBottom,
} from "./pos";
import { CloseSaleInline } from "../../components/sale/sale.inline";
import {
  HomeProps,
  initialData,
  useLoadData,
} from "../../../api/hooks/use.load.data";
import { useSelector } from "react-redux";
import { getStore } from "../../../duck/store/store.selector";
import { getTerminal } from "../../../duck/terminal/terminal.selector";
import { Product } from "../../../api/model/product";
import { DiscountRate, DiscountScope } from "../../../api/model/discount";
import { ProductVariant } from "../../../api/model/product.variant";
import { Brand } from "../../../api/model/brand";
import { Category } from "../../../api/model/category";
import { Department } from "../../../api/model/department";
import { QueryString } from "../../../lib/location/query.string";
import { fetchJson, jsonRequest } from "../../../api/request/request";
import {
  BARCODE_LIST,
  PRODUCT_QUANTITIES,
} from "../../../api/routing/routes/backend.app";
import localforage from "../../../lib/localforage/localforage";
import Mousetrap from "mousetrap";
import { getAuthorizedUser } from "../../../duck/auth/auth.selector";
import { CartControls } from "../../components/cart/cart.controls";
import { Controller, useForm } from "react-hook-form";
import classNames from "classnames";
import { Modal } from "../../../app-common/components/modal/modal";
import { SaleBrands } from "../../components/search/sale.brands";
import { SaleCategories } from "../../components/search/sale.categories";
import { SaleDepartments } from "../../components/search/sale.departments";
import { SaleHistory } from "../../components/sale/sale.history";
import { Expenses } from "../../components/sale/expenses";
import { More } from "../../components/settings/more";
import { SaleClosing } from "../../components/sale/sale.closing";
import { Logout } from "../../components/logout";
import { PurchaseTabs } from "../../components/inventory/purchase.tabs";
import { Barcode } from "../../../api/model/barcode";
import { SearchTable } from "../../components/search/search.table";
import { SaleFind } from "../../components/sale/sale.find";
import { Order } from "../../../api/model/order";
import { useAtom } from "jotai";
import { defaultState } from "../../../store/jotai";

enum SearchModes {
  sale = "sale",
  refund = "refund",
  reorder = "reorder",
}

export const PosV2 = () => {
  const [mode, setMode] = useState(SearchModes.sale);

  const [list, setList] = useState<HomeProps["list"]>(initialData);
  const [paymentTypesList, setPaymentTypesList] =
    useState<HomeProps["paymentTypesList"]>(initialData);
  const store = useSelector(getStore);
  const terminal = useSelector(getTerminal);

  const [state] = useLoadData();

  const [appState, setAppState] = useAtom(defaultState);

  const {
    q,
    added,
    selected,
    selectedVariant,
    latest,
    quantity,
    rate,
    discount,
    discountAmount,
    discountRateType,
    tax,
    coupon,
  } = appState;

  useEffect(() => {
    setList(state.list);
    setPaymentTypesList(state.paymentTypesList);
  }, [state.list, state.paymentTypesList]);

  const searchField = createRef<HTMLInputElement>();
  const containerRef = createRef<HTMLDivElement>();
  const [closeSale, setCloseSale] = useState(false);
  const [itemsMeta, setItemsMeta] = useState<Product[]>([]);

  const subTotal = useMemo(() => {
    return added.reduce((prev, item) => prev + getRowTotal(item), 0);
  }, [added]);

  const exclusiveSubTotal = useMemo(() => {
    return added.reduce((prev, item) => prev + getExclusiveRowTotal(item), 0);
  }, [added]);

  const taxTotal = useMemo(() => {
    if (!tax) return 0;

    return (Number(tax.rate) * exclusiveSubTotal) / 100;
  }, [tax, exclusiveSubTotal]);

  const discountTotal = useMemo<number>(() => {
    if (discountAmount) {
      //calculate based on open discount
      if (discountRateType) {
        if (discountRateType === "fixed") {
          return discountAmount;
        } else {
          return ((subTotal + taxTotal) * discountAmount) / 100;
        }
      }
      return discountAmount;
    }

    if (!discount) return 0;

    if (discount.rateType === DiscountRate.RATE_FIXED && discount.rate) {
      return discount.rate;
    } else if (
      discount.rateType === DiscountRate.RATE_PERCENT &&
      discount.rate
    ) {
      return ((subTotal + taxTotal) * Number(discount?.rate)) / 100;
    } else {
      if (discount.scope === DiscountScope.SCOPE_EXACT && discount.rate) {
        return discount.rate || 0;
      } else {
        //ask for discount
        return 0;
      }
    }
  }, [subTotal, discount, taxTotal, discountAmount, discountRateType]);

  const couponTotal = useMemo(() => 0, [coupon]);

  const finalTotal = useMemo(() => {
    return subTotal + taxTotal - discountTotal - couponTotal;
  }, [subTotal, taxTotal, discountTotal, couponTotal]);

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

    if (!filtered) {
      return [];
    }

    // filter products by store
    if (store && filtered) {
      filtered = filtered.filter((item) => {
        if (item?.stores?.length > 0) {
          const stores = item.stores.map((item) => {
            if (item.store) {
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
    if (terminal && filtered) {
      filtered = filtered.filter((item) => {
        if (item?.terminals?.length > 0) {
          const terminals = item.terminals.map((item) => item.id);

          return terminals.includes(terminal.id);
        } else {
          return true;
        }
      });
    }

    const brandIds = Object.keys(brands);
    if (brandIds.length > 0) {
      filtered = filtered.filter((item) => {
        if (item?.brands?.length > 0) {
          const brandsFilter = item.brands.filter((b) => {
            return brandIds.includes(b.id.toString());
          });

          return brandsFilter.length > 0;
        }

        return false;
      });
    }

    const categoryIds = Object.keys(categories);
    if (categoryIds.length > 0) {
      filtered = filtered.filter((item) => {
        if (item?.categories?.length > 0) {
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
    if (departmentIds.length > 0) {
      filtered = filtered.filter((item) => {
        if (item?.department) {
          return departmentIds.includes(item.department.id.toString());
        }

        return false;
      });
    }

    if (filtered) {
      filtered = filtered.filter((item) => {
        if (
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

  const getItemsMetadata = useCallback(
    async (itemId: number, variantId?: number) => {
      try {
        const search = QueryString.stringify({
          itemId,
          variantId,
          store: store?.id,
        });
        const response = await jsonRequest(`${PRODUCT_QUANTITIES}?${search}`);
        const json = await response.json();

        if (json.quantity) {
          setAppState((prev) => ({
            ...prev,
            added: prev.added.map((item) => {
              if (!variantId) {
                if (item.item.id === itemId && item.item.manageInventory) {
                  item.stock = Number(json.quantity);
                }
              } else if (variantId) {
                if (
                  item.item.id === itemId &&
                  item.item.manageInventory &&
                  item.variant?.id === variantId
                ) {
                  item.stock = Number(json.quantity);
                }
              }

              return item;
            }),
          }));
        }
      } catch (e) {
        throw e;
      }
    },
    []
  );

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

      if (item.variants.length > 0) {
        item.variants.forEach((variant) => {
          if (variant.barcode) {
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

    if (item === undefined) {
      // check in DB for dynamic barcode item
      try {
        const response = await fetchJson(`${BARCODE_LIST}?barcode=${values.q}`);
        if (response["hydra:member"].length > 0) {
          const item: Barcode = response["hydra:member"][0];
          if (item.variant) {
            await addItemVariant(
              item.item,
              item.variant,
              Number(item.measurement),
              Number(item.price)
            );
          }

          if (!item.variant) {
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
      } catch (e) {
        console.log(e);
      }
    }

    if (item !== undefined) {
      // if main item, add it
      if (!item.isVariant) {
        await addItem(item.item, Number(values.quantity));
      }

      // if variant add it
      if (item.isVariant) {
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
    if (item.basePrice) {
      newPrice = item.basePrice;
    }

    if (price) {
      newPrice = price;
    }

    if (rate) {
      newPrice = rate;
    }

    setAppState((prev) => ({
      ...prev,
      latest: item,
    }));

    if (item.variants.length > 0) {
      //choose from variants
      setModal(true);
      setModalTitle(`Choose a variant for ${item.name}`);
      setVariants(item.variants);

      setAppState((prev) => ({
        ...prev,
        selectedVariant: 0,
      }));

      return false;
    }

    const oldItems = [...added];
    let index = oldItems.findIndex((addItem) => addItem.item.id === item.id);
    if (index !== -1) {
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
      selected: items.findIndex((i) => i.id === item.id),
    }));

    scrollToBottom(containerRef.current);

    await getItemsMetadata(item.id);
  };

  const addItemVariant = async (
    item: Product,
    variant: ProductVariant,
    quantity: number,
    price?: number
  ) => {
    const oldItems = [...added];
    let index = oldItems.findIndex((addItem) => {
      return addItem.item.id === item.id && addItem.variant === variant;
    });

    if (index !== -1) {
      oldItems[index].quantity += quantity;
    } else {
      oldItems.push({
        quantity: quantity,
        item: item,
        price: variant.price ? variant.price : getRealProductPrice(item),
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
    }));

    setModal(false);
    setVariants([]);

    scrollToBottom(containerRef.current);

    await getItemsMetadata(item.id, variant.id);
  };

  const onQuantityChange = (item: CartItem, newQuantity: number) => {
    const oldItems = [...added];
    let index = oldItems.findIndex(
      (addItem) =>
        addItem.item.id === item.item.id && item.variant === addItem.variant
    );
    if (index !== -1) {
      if (newQuantity < 0) {
        notify({
          type: "error",
          description: "Quantity cannot be less then 0",
        });
        return false;
      }

      oldItems[index].quantity = Number(newQuantity);
    }

    setAppState((prev) => ({
      ...prev,
      added: oldItems,
    }));
  };

  const onPriceChange = (item: CartItem, newPrice: number) => {
    const oldItems = [...added];
    let index = oldItems.findIndex(
      (addItem) =>
        addItem.item.id === item.item.id && item.variant === addItem.variant
    );
    if (index !== -1) {
      oldItems[index].price = newPrice;
    }

    setAppState((prev) => ({
      ...prev,
      added: oldItems,
    }));
  };

  const onDiscountChange = (item: CartItem, newDiscount: number) => {
    const oldItems = [...added];
    let index = oldItems.findIndex(
      (addItem) =>
        addItem.item.id === item.item.id && item.variant === addItem.variant
    );

    //discount cannot exceed price
    const quantity = parseFloat(oldItems[index].quantity as unknown as string);

    if (newDiscount >= oldItems[index].price * quantity) {
      newDiscount = oldItems[index].price * quantity;
    }

    if (index !== -1) {
      oldItems[index].discount = newDiscount;
    }

    setAppState((prev) => ({
      ...prev,
      added: oldItems,
    }));
  };

  const deleteItem = (index: number) => {
    const oldItems = [...added];

    oldItems.splice(index, 1);

    setAppState((prev) => ({
      ...prev,
      added: oldItems,
    }));
  };

  const setFocus = (event: any, element: any) => {
    if (document.body.classList.contains("ReactModal__Body--open")) return;

    const inputNodes = ["INPUT", "SELECT", "TEXTAREA"];

    // skip input nodes and retain focus in them
    if (
      inputNodes.includes(event.target.nodeName) &&
      event.target !== element
    ) {
      return;
    }

    if (element.current !== null) {
      element.current.focus();
    }
  };

  const moveVariantsCursor = async (event: any) => {
    const itemsLength = variants.length;
    if (event.key === "ArrowDown") {
      let newSelected = selectedVariant + 1;
      if (newSelected === itemsLength) {
        newSelected = 0;
        setAppState((prev) => ({
          ...prev,
          selectedVariant: newSelected,
        }));
      } else {
        setAppState((prev) => ({
          ...prev,
          selectedVariant: newSelected,
        }));
      }
    } else if (event.key === "ArrowUp") {
      let newSelected = selectedVariant - 1;
      if (newSelected === -1) {
        newSelected = itemsLength - 1;
      }
      setAppState((prev) => ({
        ...prev,
        selectedVariant: newSelected,
      }));
    } else if (event.key === "Enter") {
      await addItemVariant(
        items[selected],
        items[selected].variants[selectedVariant],
        1
      );
    }
  };

  useEffect(() => {
    if (added.length === 0) {
      setAppState((prev) => ({
        ...prev,
        adjustment: 0,
      }));
    }
  }, [added]);

  // useEffect(() => {
  //   localforage.setItem("discount", discount);
  // }, [discount]);

  // useEffect(() => {
  //   localforage.setItem("tax", tax);
  // }, [tax]);

  // useEffect(() => {
  //   localforage.setItem("customer", customer);
  // }, [customer]);

  useEffect(() => {
    //set default discount, tax
    setDefaultOptions();

    // localforage.getItem("data").then((data: any) => {
    //   if (data) {
    //     setAppState((prev) => ({
    //       ...prev,
    //       added: oldItems,
    //     }));
    //     setAdded(data);
    //   }
    // });
    // localforage.getItem("list").then((data: any) => {
    //   setList(data);
    // });
    // localforage.getItem("tax").then((data: any) => setTax(data));
    // //load previously added discount
    // localforage.getItem("discount").then((data: any) => setDiscount(data));
    // localforage.getItem("customer").then((data: any) => setCustomer(data));
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

  useEffect(() => {
    Mousetrap.bind(["up", "down", "enter"], function (e: Event) {
      // e.preventDefault();
      if (modal) {
        //move cursor in variant chooser modal
        moveVariantsCursor(e);
      } else {
        //skip if some other modal is open
        // if( !document.body.classList.contains('ReactModal__Body--open') ) {
        //   //move cursor in items
        //   moveCursor(e);
        // }
      }
    });
  }, [modal, selected, selectedVariant, variants, items, added, quantity]);

  useEffect(() => {
    Mousetrap.bind(["f3", "/"], function (e: any) {
      e.preventDefault();
      if (searchField.current !== null) {
        searchField.current.focus();
      }
    });
  }, [searchField]);

  const onCheckAll = (e: any) => {
    const newAdded = [...added];
    newAdded.map((item) => (item.checked = e.target.checked));

    setAppState((prev) => ({
      ...prev,
      added: newAdded,
    }));
  };

  const onCheck = (state: boolean, index: number) => {
    const items = [...added];

    items[index].checked = state;

    setAppState((prev) => ({
      ...prev,
      added: items,
    }));
  };

  const user = useSelector(getAuthorizedUser);

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
      <div
        className="flex flex-col"
        onClick={(event) => setFocus(event, searchField)}>
        <div className="flex flex-row gap-5 p-2 bg-white">
          <div className="gap-2 flex">
            <div className="input-group">
              <SaleBrands brands={brands} setBrands={setBrands}>
                <FontAwesomeIcon icon={faFlag} />
              </SaleBrands>
              <SaleCategories
                categories={categories}
                setCategories={setCategories}>
                <FontAwesomeIcon icon={faCubesStacked} />
              </SaleCategories>
              <SaleDepartments
                departments={departments}
                setDepartments={setDepartment}>
                <FontAwesomeIcon icon={faIcons} />
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
                  <FontAwesomeIcon icon={faBarcode} />
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
                // active={mode === SearchModes.refund}
                // onClick={() => setMode(SearchModes.refund)}
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
                // active={mode === SearchModes.reorder}
                // onClick={() => setMode(SearchModes.reorder)}
              />
            </div>
            <form className="flex gap-3" onSubmit={handleSubmit(searchAction)}>
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
                />
              </div>
              <button className="hidden">submit</button>
            </form>
            {/*<Input placeholder="Enter customer name" className="lg" />*/}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 p-3">
          <div className="col-span-3">
            <CartControls containerRef={containerRef.current} />
            <div
              className="block overflow-auto h-[calc(100vh_-_300px)] bg-white"
              ref={containerRef}>
              <CartContainer
                onQuantityChange={onQuantityChange}
                onDiscountChange={onDiscountChange}
                onPriceChange={onPriceChange}
                deleteItem={deleteItem}
                subTotal={subTotal}
                onCheckAll={onCheckAll}
                onCheck={onCheck}
              />
            </div>
            <div className="flex gap-4 mt-3 items-center h-[120px]">
              <Expenses />
              <PurchaseTabs />
              <More />
              <span className="w-[2px] bg-gray-200"></span>
              <SaleHistory />
              <SaleClosing />
              <span className="w-[2px] bg-gray-200"></span>
              <Logout />
            </div>
          </div>
          <div className="col-span-1 bg-white p-3">
            <CloseSaleInline
              finalTotal={finalTotal}
              paymentTypesList={paymentTypesList.list}
              subTotal={subTotal}
              taxTotal={taxTotal}
              couponTotal={couponTotal}
              discountTotal={discountTotal}
              setCloseSale={setCloseSale}
              closeSale={closeSale}
              isInline={true}
            />
          </div>
        </div>
      </div>
      <Modal
        open={modal}
        onClose={() => {
          setModal(false);
          setVariants([]);
        }}
        title={modalTitle}
        shouldCloseOnEsc={true}>
        {variants.length > 0 && (
          <div className="table w-full">
            <div className="table-header-group">
              <div className="table-row">
                <div className="table-cell p-5 text-left font-bold">Item</div>
                <div className="table-cell p-5 text-left font-bold">
                  Variant
                </div>
                <div className="table-cell p-5 text-right font-bold">Rate</div>
              </div>
            </div>
            <div className="table-row-group">
              {variants.map((item, index) => (
                <div
                  className={classNames(
                    "table-row hover:bg-gray-200 cursor-pointer",
                    selectedVariant === index ? "bg-gray-300" : ""
                  )}
                  onClick={() => addItemVariant(latest!, item, quantity)}
                  key={index}>
                  <div className="table-cell p-5">
                    {item.name}
                    {item.barcode && (
                      <div className="text-gray-400">{item.barcode}</div>
                    )}
                  </div>
                  <div className="table-cell p-5">{item.attributeValue}</div>
                  <div className="table-cell p-5 text-right">
                    {item.price === null ? (
                      <>{getRealProductPrice(latest!)}</>
                    ) : (
                      <>{item.price}</>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
