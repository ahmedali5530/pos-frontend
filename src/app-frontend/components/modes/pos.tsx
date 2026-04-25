import {useCallback, useEffect, useMemo, useRef, useState,} from "react";
import {HomeProps, initialData, useLoadData,} from "../../../api/hooks/use.load.data";
import {appState as AppState, defaultData, defaultState as defaultAppState} from "../../../store/jotai";
import {
  faCubesStacked,
  faFlag,
  faIcons,
  faMagnifyingGlass,
  faReply,
  faRotateRight,
  faTableCells
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useAtom} from "jotai";
import localforage from "localforage";
import {Controller, useForm} from "react-hook-form";
import {CartItem} from "../../../api/model/cart.item";
import {notify} from "../../../app-common/components/confirm/notification";
import {getRealProductPrice, scrollToBottom,} from "../../containers/dashboard/pos";
import {CartContainer, CartItemType} from "../cart/cart.container";
import {CartControls} from "../cart/cart.controls";
import {SaleFind} from "../sale/sale.find";
import {CloseSaleInline} from "../sale/sale.inline";
import {RefundOrder} from "../sale/refund.order";
import {SaleBrands} from "../search/sale.brands";
import {SaleCategories} from "../search/sale.categories";
import {SaleDepartments} from "../search/sale.departments";
import {SearchTable} from "../search/search.table";
import {Product} from "../../../api/model/product";
import {ProductVariant} from "../../../api/model/product.variant";
import {Brand} from "../../../api/model/brand";
import {Category} from "../../../api/model/category";
import {Department} from "../../../api/model/department";
import Mousetrap from "mousetrap";
import "mousetrap/plugins/global-bind/mousetrap-global-bind";
import {Order} from "../../../api/model/order";
import {Tooltip} from "antd";
import {Button} from "../../../app-common/components/input/button";
import {Input} from "../../../app-common/components/input/input";
import {TopbarRight} from "./topbar.right";
import {Footer} from "./footer";
import {TrapFocus} from "../../../app-common/components/container/trap.focus";
import {SearchVariants} from "../search/search.variants";
import {RecordId} from "surrealdb";
import {toRecordId} from "../../../api/model/common";
import {Tables} from "../../../api/db/tables";
import {useDB} from "../../../api/db/db";
import {Shortcut} from "../../../app-common/components/input/shortcut";
import {formatNumber} from "../../../lib/currency/currency";
import classNames from "classnames";
import {SearchInline} from "../search/search.inline";

enum SearchModes {
  sale = "sale",
  refund = "refund",
  reorder = "reorder",
}

export const PosMode = () => {
  const [mode, setMode] = useState(SearchModes.sale);

  const [list, setList] = useState<HomeProps["list"]>(initialData);
  const [paymentTypesList, setPaymentTypesList] = useState<HomeProps["paymentTypesList"]>(initialData);

  const [state] = useLoadData();
  const [defaultState, setDefaultState] = useAtom(defaultAppState);

  const [{user, store, terminal, appConnected, inlineSearch}, setAppState] = useAtom(AppState);

  const [appSettings] = useAtom(defaultData);
  const {
    customerBox,
  } = appSettings;

  const {
    q,
    added,
    rate,
    customerName,
    disableEdit,
    cartItemType, cartItem,
  } = defaultState;

  useEffect(() => {
    setList(state.list);
    setPaymentTypesList(state.paymentTypesList);
  }, [state.list, state.paymentTypesList]);

  const searchField = useRef<HTMLInputElement | null>(null);
  const quantityField = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
          const stores = item.stores.map((s) => {
            return new RecordId(s.store.id.tb, s.store.id.id).toString();
          });

          return stores.includes(store.id.toString());
        } else {
          return true;
        }
      });
    }

    //filter products by terminal
    if (terminal && filtered) {
      filtered = filtered.filter((item) => {
        if (item?.terminals?.length > 0) {
          const terminals = item.terminals.map((item) => {
            return new RecordId(item.id.tb, item.id.id).toString()
          });

          return terminals.includes(terminal.id.toString());
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

  const {handleSubmit, control, reset} = useForm();

  const searchAction = async (values: any) => {
    const item = itemsMap.get(values.q);

    if (item === undefined) {
      // check in DB for dynamic barcode item
      // direct product not found, try with dynamic barcode
      // parse barcode for dynamic item
      try {
        const prefix = Number(values.q.substring(0, 2));
        if (prefix >= 20 && prefix <= 29) {
          // dynamic barcode
          const itemId = values.q.substring(2, 7);
          const item = itemsMap.get(itemId || '');
          const qty = Number(values.q.substring(7, 12).padStart(5, '0')) / 1000;

          if (item) {
            if (item.isVariant) {
              await addItemVariant(
                item.item,
                item.variant,
                Number(qty),
                Number(item.price)
              );
            }

            if (!item.variant) {
              await addItem(
                item.item,
                Number(qty),
                Number(item.price)
              );
            }
          }
        } else {
          const [items] = await db.query(`SELECT *
                                          FROM ${Tables.barcode}
                                          where barcode = $barcode FETCH item, variant`, {
            barcode: values.q
          });

          if (items.length > 0) {
            const item = items[0];

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

            return;
          } else {
            notify({
              type: "error",
              description: `${values.q} not found`,
              placement: "top",
              duration: 1,
            });
          }
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
    if (item.base_price) {
      newPrice = item.base_price;
    }

    if (price) {
      newPrice = price;
    }

    if (rate) {
      newPrice = rate;
    }

    setDefaultState((prev) => ({
      ...prev,
      latest: item,
      quantity: quantity,
      latestVariant: undefined
    }));

    if (item.variants.length > 0) {
      //choose from variants
      setModal(true);
      setModalTitle(`Choose a variant for ${item.name}`);
      setVariants(item.variants);

      setDefaultState((prev) => ({
        ...prev,
        selectedVariant: 0,
        quantity: quantity,
      }));

      return;
    }

    setDefaultState(prev => {
      const otherState = {
        q: "",
        quantity: 1,
      };

      const exists = prev.added.find(i => toRecordId(i.item.id).toString() === toRecordId(item.id).toString());
      let index = prev.added.findIndex((addItem) => toRecordId(addItem.item.id).toString() === toRecordId(item.id).toString());
      if (exists) {
        return {
          ...prev,
          ...otherState,
          latestIndex: index,
          added: prev.added.map(a => {
            if (toRecordId(a.item.id).toString() === toRecordId(item.id).toString()) {
              return {...a, quantity: formatNumber(Number(a.quantity) + Number(quantity))};
            } else {
              return a;
            }
          })
        };
      }

      return {
        ...prev,
        ...otherState,
        added: [...prev.added, {
          quantity: formatNumber(quantity),
          item: item,
          price: newPrice,
          discount: 0,
          taxes: item.taxes,
          taxIncluded: true,
          stock: 0,
        }],
        latestIndex: prev.added.length - 1,
      };
    });

    scrollToBottom(containerRef.current);
  };

  const addItemVariant = async (
    item: Product,
    variant: ProductVariant,
    quantity: number,
    price?: number
  ) => {
    const variantPrice = price ? price : (
      variant?.price
        ? variant.price
        : getRealProductPrice(item)
    );

    setDefaultState(prev => {
      const otherState = {
        selected: items.findIndex((i) => i.id.toString() === item.id.toString()),
        quantity: 1,
        selectedVariant: 0,
        q: "",
        latestQuantity: quantity,
        latestRate: variantPrice,
        latestVariant: variant,
      };

      const exists = prev.added.find(i => toRecordId(i.item.id).toString() === toRecordId(item.id).toString() && toRecordId(variant.id).toString() === toRecordId(i.variant?.id)?.toString());
      if (exists) {
        return {
          ...prev,
          ...otherState,
          added: prev.added.map(i => {
            if (toRecordId(i.item.id).toString() === toRecordId(item.id).toString() && toRecordId(variant.id).toString() === toRecordId(i.variant?.id)?.toString()) {
              return {
                ...i,
                quantity: formatNumber(Number(i.quantity) + Number(quantity))
              }
            }

            return i;
          })
        };
      }

      return {
        ...prev,
        ...otherState,
        added: [...prev.added, {
          quantity: formatNumber(quantity),
          item: item,
          price: variantPrice,
          variant: variant,
          discount: 0,
          taxes: item.taxes,
          taxIncluded: true,
          stock: 0,
        }]
      };
    })

    setModal(false);
    setVariants([]);

    scrollToBottom(containerRef.current);
  };

  const db = useDB();

  useEffect(() => {
    let isMounted = true;
    let queryId: any = null;

    const runLiveQuery = async () => {
      try {
        const result = await db.live(Tables.cart, async (action: string, result) => {
          if (!isMounted) return;

          if (
            result.store.toString() === store?.id.toString() &&
            result.terminal.toString() === terminal?.id?.toString() &&
            result.user.toString() === user?.id?.toString()
          ) {
            // Only process CREATE actions for new orders
            if (action === "CREATE") {
              const [item] = await db.query<Product>(`SELECT *
                                                      FROM ONLY ${Tables.product}
                                                      where id = $barcode LIMIT 1 fetch department, categories, suppliers, brands, variants, taxes, terminals, stores, stores.store`, {
                barcode: toRecordId(result.item)
              });

              if (result.variant) {
                const [variant] = await db.query<ProductVariant>(`SELECT *
                                                                  FROM ONLY ${Tables.product_variant}
                                                                  where id = $variant LIMIT 1 fetch department, categories, suppliers, brands, variants, taxes, terminals, stores, stores.store`, {
                  variant: toRecordId(result.variant)
                });

                await addItemVariant(item, variant, result.quantity, result.price)
              } else {
                await addItem(item, result.quantity, result.price);
              }

              // remove from cart db
              await db.delete(result.id);
            }
          }
        });

        if (isMounted) {
          queryId = result;
          // setLiveQuery(result);
        }
      } catch (error) {
        console.error("Error setting up live query:", error);
      }
    };

    runLiveQuery();

    return () => {
      isMounted = false;
      if (queryId) {
        db.db.kill(queryId).catch(console.error);
      }
    };
  }, [appConnected]);

  useEffect(() => {
    if (added.length === 0) {
      setDefaultState((prev) => ({
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
      setDefaultState((prev) => ({
        ...prev,
        discount: data,
      }));
    });
    localforage.getItem("defaultTax").then((data: any) => {
      setDefaultState((prev) => ({
        ...prev,
        tax: data,
      }));
    });
  };

  useEffect(() => {
    if (!modal) {
      setVariants([]);
      setDefaultState(prev => ({
        ...prev,
        selectedVariant: 0,
        latestVariant: undefined
      }))
    }
  }, [modal]);

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

    setDefaultState((prev) => ({
      ...prev,
      added: items,
      discount: order.discount?.type,
      tax: order.tax?.type,
      discountAmount: order.discount?.amount,
      customer: order?.customer,
    }));
  };

  const copyLastItem = useCallback(() => {
    setDefaultState((prev) => {
      const lastItem = prev.added[prev.added.length - 1];
      if (lastItem) {
        return {
          ...prev,
          added: [...prev.added, {...lastItem}],
          cartItem: prev.added.length,
        };
      }

      return prev;
    });
  }, [setDefaultState]);

  const updateCartItemType = useCallback(
    (direction: "left" | "right") => {
      if (cartItemType === CartItemType.quantity) {
        if (direction === "right") {
          setDefaultState((prev) => ({
            ...prev,
            cartItemType: CartItemType.discount,
          }));
        } else {
          setDefaultState((prev) => ({
            ...prev,
            cartItemType: CartItemType.discount,
          }));
        }
      }
      if (cartItemType === CartItemType.discount) {
        if (direction === "right") {
          setDefaultState((prev) => ({
            ...prev,
            cartItemType: CartItemType.quantity,
          }));
        } else {
          setDefaultState((prev) => ({
            ...prev,
            cartItemType: CartItemType.quantity,
          }));
        }
      }
    },
    [cartItemType]
  );

  const updateCartItem = useCallback(
    (direction: "up" | "down") => {
      console.log(direction)
      const addedItems = added.length;
      let newCartItem = cartItem;
      if (!newCartItem) {
        newCartItem = 0;
      }

      if (direction === "up") {
        if (cartItem !== 0) {
          setDefaultState((prev) => ({
            ...prev,
            cartItem: Number(newCartItem) - 1,
          }));
        } else if (cartItem === 0) {
          setDefaultState((prev) => ({
            ...prev,
            cartItem: addedItems - 1,
          }));
        }
      }
      if (direction === "down") {
        if (newCartItem + 1 < addedItems) {
          setDefaultState((prev) => ({
            ...prev,
            cartItem: Number(newCartItem) + 1,
          }));
        } else if (newCartItem + 1 >= addedItems) {
          setDefaultState((prev) => ({
            ...prev,
            cartItem: 0,
          }));
        }
      }
    },
    [cartItem, added]
  );

  useEffect(() => {
    (Mousetrap as any).bindGlobal(
      ["ctrl+up", "ctrl+down", "ctrl+left", "ctrl+right", "del", "ctrl+shift+down"],
      function (e: KeyboardEvent) {
        if (document.body.classList.contains("ReactModal__Body--open")) return;

        e.preventDefault();

        if (e.key === "Delete") {
          setDefaultState((prev) => ({
            ...prev,
            added: prev.added.filter((_, index) => index !== prev.cartItem),
          }));
        }

        //update quantity of last added item
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          updateCartItemType(e.key === "ArrowLeft" ? "left" : "right");
        }

        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          if (e.ctrlKey && !e.shiftKey) {
            updateCartItem(e.key === "ArrowDown" ? "down" : "up");
          }
        }

        if (e.key === "ArrowDown" && e.ctrlKey && e.shiftKey) {
          copyLastItem();
        }
      }
    );

    return () => {
      (Mousetrap as any).unbind(["ctrl+up", "ctrl+down", "ctrl+left", "ctrl+right", "del", "ctrl+shift+down"]);
    };
  }, [updateCartItem, updateCartItemType, copyLastItem]);

  const customerInputRef = useRef<HTMLInputElement | null>(null);
  const [searchModal, setSearchModal] = useState(false);

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
                {/*<Tooltip title="Barcode search">*/}
                {/*  <Button*/}
                {/*    variant="primary"*/}
                {/*    className="btn-square"*/}
                {/*    type="button"*/}
                {/*    active={mode === SearchModes.sale}*/}
                {/*    size="lg"*/}
                {/*    onClick={() => setMode(SearchModes.sale)}*/}
                {/*  >*/}
                {/*    <FontAwesomeIcon icon={faBarcode}/>*/}
                {/*  </Button>*/}
                {/*</Tooltip>*/}
                <Tooltip title="Search by name">
                  <Button
                    variant="primary"
                    iconButton
                    type="button"
                    size="lg"
                    onClick={() => setSearchModal(true)}
                    disabled={disableEdit}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass}/>
                    <Shortcut
                      shortcut="ctrl+f"
                      handler={() => setSearchModal(true)}
                      invisible={true}
                      disabled={disableEdit}
                    />
                  </Button>
                </Tooltip>
                <Tooltip title="Display grid">
                  <Button
                    variant="primary"
                    iconButton
                    type="button"
                    size="lg"
                    onClick={() => setAppState(prev => ({
                      ...prev,
                      inlineSearch: !prev.inlineSearch
                    }))}
                    disabled={disableEdit}
                    active={inlineSearch}
                  >
                    <FontAwesomeIcon icon={faTableCells}/>
                  </Button>
                </Tooltip>
              </div>
              <div className="input-group">
                {/*TODO: add voice search here*/}
                <RefundOrder
                  icon={faReply}
                  title="Refund"
                  variant="danger"
                  paymentTypesList={paymentTypesList.list}
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
                    render={({field}) => (
                      <Input
                        placeholder="Scan barcode or search by name"
                        ref={searchField}
                        autoFocus
                        type="search"
                        className="search-field mousetrap lg w-72"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={disableEdit}
                      />
                    )}
                    name="q"
                    control={control}
                    rules={{required: true}}
                    defaultValue={""}
                  />

                  <Shortcut
                    shortcut="f2"
                    handler={() => {
                      if (searchField.current !== null) {
                        searchField.current.select();

                        return false;
                      }
                    }}
                    invisible={true}
                    disabled={disableEdit}
                  />

                  <Controller
                    render={({field}) => (
                      <Input
                        ref={quantityField}
                        type="number"
                        placeholder="Quantity"
                        className="w-28 mousetrap lg"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={disableEdit}
                      />
                    )}
                    name="quantity"
                    control={control}
                    defaultValue={1}
                    rules={{required: true}}
                  />
                  <Shortcut
                    shortcut="f4"
                    handler={() => {
                      if (quantityField.current !== null) {
                        quantityField.current.focus();

                        return false;
                      }
                    }}
                    invisible={true}
                    disabled={disableEdit}
                  />
                </div>
                <button type="submit" className="hidden">submit</button>
              </form>
              {customerBox && (
                <>
                  <Input
                    placeholder="Enter customer name"
                    className="lg mousetrap"
                    onChange={(event) => {
                      setDefaultState(prev => ({
                        ...prev,
                        customerName: event.target.value
                      }))
                    }}
                    value={customerName}
                    ref={customerInputRef}
                    disabled={disableEdit}
                  />
                  <Shortcut
                    shortcut="f7"
                    handler={() => {
                      if (customerInputRef.current !== null) {
                        customerInputRef.current.focus();

                        return false;
                      }
                    }}
                    invisible={true}
                    disabled={disableEdit}
                  />
                </>
              )}

            </div>
            <div className="mr-auto">
              <TopbarRight/>
            </div>
          </div>
          <div className={
            classNames(
              "grid gap-3 p-3",
              inlineSearch ? 'grid-cols-[350px_minmax(0,1fr)_440px]' : 'grid-cols-[minmax(0,1fr)_440px]'
            )
          }>
            {inlineSearch && (
              <div className="bg-white p-3">
                <SearchInline
                  items={items}
                  addItem={addItem}
                  onClick={() => setMode(SearchModes.sale)}
                />
              </div>
            )}
            <div className="min-w-0">
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
            <div className="bg-white p-3">
              <CloseSaleInline
                paymentTypesList={paymentTypesList.list}
                isInline={true}
                customerInput={customerInputRef}
              />
            </div>
          </div>
        </div>
      </TrapFocus>
      {searchModal && (
        <SearchTable
          items={items}
          addItem={addItem}
          onClick={() => setMode(SearchModes.sale)}
          onClose={() => setSearchModal(false)}
        />
      )}

      {modal && (
        <SearchVariants
          modal={true}
          onClose={() => {
            setModal(false);
          }}
          variants={variants}
          addItemVariant={addItemVariant}
        />
      )}
    </>
  );
};
