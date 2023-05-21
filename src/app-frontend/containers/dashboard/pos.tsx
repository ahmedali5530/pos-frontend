import React, {createRef, FC, useEffect, useMemo, useState} from "react";
import classNames from "classnames";
import {DateTime} from "luxon";
import {FixedSizeList} from "react-window";
import {Product} from "../../../api/model/product";
import {Discount, DiscountRate, DiscountScope} from "../../../api/model/discount";
import {Tax} from "../../../api/model/tax";
import {CartItem} from "../../../api/model/cart.item";
import {Customer} from "../../../api/model/customer";
import {ProductVariant} from "../../../api/model/product.variant";
import localforage from "../../../lib/localforage/localforage";
import SpeechSearch from "../../components/search/speech.search";
import {Input} from "../../../app-common/components/input/input";
import {SearchTable} from "../../components/search/search.table";
import {CartContainer, CartItemType} from "../../components/cart/cart.container";
import {Modal} from "../../../app-common/components/modal/modal";
import {SaleHistory} from "../../components/sale/sale.history";
import {Customers} from "../../components/sale/customers";
import {Logout} from "../../components/logout";
import {Expenses} from "../../components/sale/expenses";
import {More} from "../../components/settings/more";
import {HomeProps, initialData, useLoadData} from "../../../api/hooks/use.load.data";
import {SaleBrands} from "../../components/search/sale.brands";
import {Brand} from "../../../api/model/brand";
import {Category} from "../../../api/model/category";
import {SaleCategories} from "../../components/search/sale.categories";
import {SaleDepartments} from "../../components/search/sale.departments";
import {useSelector} from "react-redux";
import {getAuthorizedUser} from "../../../duck/auth/auth.selector";
import {CloseSaleInline} from "../../components/sale/sale.inline";
import {SaleClosing} from "../../components/sale/sale.closing";
import {Department} from "../../../api/model/department";
import {getStore} from "../../../duck/store/store.selector";
import {getTerminal} from "../../../duck/terminal/terminal.selector";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCubesStacked, faFlag, faIcons} from "@fortawesome/free-solid-svg-icons";
import {CartControls} from "../../components/cart/cart.controls";
import {PurchaseTabs} from "../../components/inventory/purchase.tabs";
import {notify} from "../../../app-common/components/confirm/notification";

const Mousetrap = require('mousetrap');

export const getRealProductPrice = (item: Product) => {
  let price = 0;

  if (!item) return price;

  if (item.basePrice) {
    price = item.basePrice;
  }

  if (item.prices.length > 0) {
    for (let index in item.prices) {
      const itemPrice = item.prices[index];

      if (!itemPrice.basePrice) {
        continue;
      }

      //based on date
      if (itemPrice.date) {
        if (DateTime.fromISO(itemPrice.date).toFormat('d') === DateTime.now().toFormat('d')) {
          price = itemPrice.basePrice;
          break;
        }
      }

      //based on time
      if (itemPrice.time && itemPrice.timeTo) {
        if (DateTime.fromISO(itemPrice.time).toFormat('HH:mm') >= DateTime.now().toFormat('HH:mm') &&
          DateTime.fromISO(itemPrice.timeTo).toFormat('HH:mm') <= DateTime.now().toFormat('HH:mm')) {
          price = itemPrice.basePrice;
          break;
        }
      }

      //based on day
      if (itemPrice.day) {
        if (itemPrice.day === DateTime.now().toFormat('cccc')) {
          price = itemPrice.basePrice;
          break;
        }
      }

      //based on week
      if (itemPrice.week) {
        if (itemPrice.week === +DateTime.now().toFormat('W')) {
          price = itemPrice.basePrice;
          break;
        }
      }

      //based on month
      if (itemPrice.month) {
        if (itemPrice.month === +DateTime.now().toFormat('L')) {
          price = itemPrice.basePrice;
          break;
        }
      }

      //based on quarter
      if (itemPrice.quarter) {
        if (itemPrice.quarter === +DateTime.now().toFormat('q')) {
          price = itemPrice.basePrice;
          break;
        }
      }
    }
  }

  return price;
};

export const getExclusiveRowTotal = (item: CartItem) => {
  const quantity = parseFloat(item.quantity as unknown as string);

  let total = item.price * quantity;
  if (item.discount) {
    total -= item.discount;
  }

  return total;
}

export const getRowTotal = (item: CartItem) => {
  const quantity = parseFloat(item.quantity as unknown as string);

  let total = item.price * quantity;
  if (item.discount) {
    total -= item.discount;
  }

  //add taxes
  if(item.taxIncluded) {
    total += item.taxes.reduce((prev, tax) => prev + (tax.rate * (item.price * quantity) / 100), 0);
  }

  return total;
};

export const scrollToBottom = (container: HTMLDivElement|null) => {
  container?.scrollTo(0, container?.scrollHeight * 1.5);
}

const Pos: FC = () => {

  const [list, setList] = useState<HomeProps['list']>(initialData);
  const [paymentTypesList, setPaymentTypesList] = useState<HomeProps['paymentTypesList']>(initialData);
  const store = useSelector(getStore);
  const terminal = useSelector(getTerminal);

  const [state] = useLoadData();

  useEffect(() => {
    setList(state.list);
    setPaymentTypesList(state.paymentTypesList);
  }, [state.list, state.paymentTypesList]);

  const [q, setQ] = useState<string>('');
  const [added, setAdded] = useState<CartItem[]>([]);
  const [selected, setSelected] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const searchField = createRef<HTMLInputElement>();
  const containerRef = createRef<HTMLDivElement>();
  const [latest, setLatest] = useState<Product>();
  const [quantity, setQuantity] = useState(1);
  const [rate, setRate] = useState(0);
  const [discount, setDiscount] = useState<Discount>();
  const [discountAmount, setDiscountAmount] = useState<number>();
  const [discountRateType, setDiscountRateType] = useState<string>();
  const [tax, setTax] = useState<Tax>();
  const [coupon] = useState();
  const [customer, setCustomer] = useState<Customer>();
  const [refundingFrom, setRefundingFrom] = useState<number>();
  const [closeSale, setCloseSale] = useState(false);
  const [adjustment, setAdjustment] = useState(0);
  const [cartItem, setCartItem] = useState<number>(0);
  const [cartItemType, setCartItemType] = useState<CartItemType>(CartItemType.quantity);

  const subTotal = useMemo(() => {
    return added.reduce((prev, item) => prev + getRowTotal(item), 0);
  }, [added]);

  const exclusiveSubTotal = useMemo(() => {
    return added.reduce((prev, item) => prev + getExclusiveRowTotal(item), 0);
  }, [added])

  const taxTotal = useMemo(() => {
    if (!tax) return 0;

    return tax.rate * exclusiveSubTotal / 100;
  }, [tax, exclusiveSubTotal]);

  const discountTotal = useMemo(() => {
    if (discountAmount) {

      //calculate based on open discount
      if (discountRateType) {
        if (discountRateType === 'fixed') {
          return discountAmount;
        } else {
          return (subTotal + taxTotal) * discountAmount / 100;
        }
      }
      return discountAmount
    }

    if (!discount) return 0;

    if (discount.rateType === DiscountRate.RATE_FIXED && discount.rate) {
      return discount.rate;
    } else if (discount.rateType === DiscountRate.RATE_PERCENT && discount.rate) {
      return (subTotal + taxTotal) * discount?.rate / 100;
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
  const [modalTitle, setModalTitle] = useState('');
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [brands, setBrands] = useState<{ [key: string]: Brand }>({});
  const [categories, setCategories] = useState<{ [key: string]: Category }>({});
  const [departments, setDepartment] = useState<{ [key: string]: Department }>({});

  const items = useMemo(() => {
    let filtered = list?.list;

    if (!filtered) {
      return [];
    }

    // filter products by store
    if (store) {
      filtered = filtered?.filter(item => {
        if (item?.stores?.length > 0) {
          const stores = item.stores.map(item => item.id);

          return stores.includes(store?.id);
        } else {
          return true;
        }
      });
    }

    //filter products by terminal
    if (terminal) {
      filtered = filtered?.filter(item => {
        if (item?.terminals?.length > 0) {
          const terminals = item.terminals.map(item => item.id);

          return terminals.includes(terminal?.id);
        } else {
          return true;
        }
      });
    }


    const brandIds = Object.keys(brands);
    if (brandIds.length > 0) {
      filtered = filtered.filter(item => {
        if (item?.brands?.length > 0) {
          const brandsFilter = item.brands.filter(b => {
            return brandIds.includes(b.id.toString())
          });

          return brandsFilter.length > 0;
        }

        return false;
      });
    }

    const categoryIds = Object.keys(categories);
    if (categoryIds.length > 0) {
      filtered = filtered.filter(item => {
        if (item?.categories?.length > 0) {
          const categoriesFilter = item.categories.filter(c => {
            return categoryIds.includes(c.id.toString())
          });

          return categoriesFilter.length > 0;
        } else {
          return true;
        }
      });
    }

    const departmentIds = Object.keys(departments);
    if (departmentIds.length > 0) {
      filtered = filtered.filter(item => {
        if (item?.department) {
          return departmentIds.includes(item?.department?.id?.toString());
        }

        return false;
      });
    }

    filtered = filtered?.filter(item => {
      if (item?.barcode && item?.barcode.toLowerCase().startsWith(q.toLowerCase())) {
        return true;
      }

      return item?.name?.toLowerCase().indexOf(q.toLowerCase()) !== -1;
    });

    return filtered;
  }, [list?.list, q, brands, categories, departments, terminal, store]);

  const addItem = (item: Product, quantity: number, price?: number) => {
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

    setLatest(item);

    if (item.variants.length > 0) {
      //choose from variants
      setModal(true);
      setModalTitle(`Choose a variant for ${item.name}`);
      setVariants(item.variants);
      setSelectedVariant(0); // reset variants selector

      return false;
    }

    const oldItems = [...added];
    let index = oldItems.findIndex(addItem => addItem.item.id === item.id);
    if (index !== -1) {
      oldItems[index].quantity += quantity;
    } else {
      oldItems.push({
        quantity: quantity,
        item: item,
        price: newPrice,
        discount: 0,
        taxes: item.taxes,
        taxIncluded: true
      });
    }

    setAdded(oldItems);
    setQ('');

    setSelected(items.findIndex(i => i.id === item.id));
    setQuantity(1);

    scrollToBottom(containerRef.current);
  };

  const addItemVariant = (item: Product, variant: ProductVariant, quantity: number) => {
    const oldItems = [...added];
    let index = oldItems.findIndex(addItem => {
      return addItem.item.id === item.id && addItem.variant === variant
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
        taxIncluded: true
      });
    }

    setLatest(item);

    setAdded(oldItems);
    setModal(false);
    setVariants([]);
    setSelected(items.findIndex(i => i.id === item.id));
    setQuantity(1);
    setSelectedVariant(0);

    setQ('');

    scrollToBottom(containerRef.current);
  };

  const onQuantityChange = (item: CartItem, newQuantity: any) => {
    const oldItems = [...added];
    let index = oldItems.findIndex(addItem => addItem.item.id === item.item.id && item.variant === addItem.variant);
    if (index !== -1) {
      if(newQuantity < 0) {
        notify({
          type: 'error',
          description: 'Quantity cannot be less then 0'
        });
        return false;
      }

      oldItems[index].quantity = newQuantity;
    }

    setAdded(oldItems);
  };

  const onPriceChange = (item: CartItem, newPrice: number) => {
    const oldItems = [...added];
    let index = oldItems.findIndex(addItem => addItem.item.id === item.item.id && item.variant === addItem.variant);
    if (index !== -1) {
      oldItems[index].price = newPrice;
    }

    setAdded(oldItems);
  };

  const onDiscountChange = (item: CartItem, newDiscount: number) => {
    const oldItems = [...added];
    let index = oldItems.findIndex(addItem => addItem.item.id === item.item.id && item.variant === addItem.variant);

    //discount cannot exceed price
    const quantity = parseFloat(oldItems[index].quantity as unknown as string);

    if (newDiscount >= oldItems[index].price * quantity) {
      newDiscount = oldItems[index].price * quantity;
    }

    if (index !== -1) {
      oldItems[index].discount = newDiscount;
    }

    setAdded(oldItems);
  };

  const deleteItem = (index: number) => {
    const oldItems = [...added];

    oldItems.splice(index, 1);
    setAdded(oldItems);
  };

  const setFocus = (event: any, element: any) => {
    if (document.body.classList.contains('ReactModal__Body--open')) return;

    const inputNodes = [
      'INPUT', 'SELECT', 'TEXTAREA'
    ];

    // skip input nodes and retain focus in them
    if (inputNodes.includes(event.target.nodeName) && event.target !== element) {
      return;
    }

    if (element.current !== null) {
      element.current.focus();
    }
  };

  const searchScrollContainer = createRef<FixedSizeList>();

  const moveCursor = (event: any) => {
    const itemsLength = items.length;
    if (event.key === 'ArrowDown') {
      let newSelected = selected + 1;
      if ((newSelected) === itemsLength) {
        newSelected = 0;
        setSelected(newSelected);
      }
      setSelected(newSelected);

      moveSearchList(newSelected);
      setRate(getRealProductPrice(items[newSelected]));
    } else if (event.key === 'ArrowUp') {
      let newSelected = selected - 1;
      if ((newSelected) === -1) {
        newSelected = itemsLength - 1;
      }
      setSelected(newSelected);

      moveSearchList(newSelected);
      setRate(getRealProductPrice(items[newSelected]));
    } else if (event.key === 'Enter') {
      setRate(getRealProductPrice(items[selected]));
      addItem(items[selected], quantity);
    }
  };

  const moveVariantsCursor = (event: any) => {
    const itemsLength = variants.length;
    if (event.key === 'ArrowDown') {
      let newSelected = selectedVariant + 1;
      if ((newSelected) === itemsLength) {
        newSelected = 0;
        setSelectedVariant(newSelected);
      }
      setSelectedVariant(newSelected);
    } else if (event.key === 'ArrowUp') {
      let newSelected = selectedVariant - 1;
      if ((newSelected) === -1) {
        newSelected = itemsLength - 1;
      }
      setSelectedVariant(newSelected);
    } else if (event.key === 'Enter') {
      addItemVariant(items[selected], items[selected].variants[selectedVariant], 1);
    }
  };

  const moveSearchList = (index: number) => {
    if (searchScrollContainer && searchScrollContainer.current) {
      searchScrollContainer.current.scrollToItem(index, 'center');
    }
  };

  useEffect(() => {
    if (searchField && searchField.current) {
      // searchField.current.focus();
    }
  }, [searchField]);

  useEffect(() => {
    localforage.setItem('data', added);

    if(added.length === 0){
      setAdjustment(0);
    }
  }, [added]);

  useEffect(() => {
    localforage.setItem('discount', discount);
  }, [discount]);

  useEffect(() => {
    localforage.setItem('tax', tax);
  }, [tax]);

  useEffect(() => {
    localforage.setItem('customer', customer);
  }, [customer]);

  useEffect(() => {
    //set default discount, tax
    setDefaultOptions();

    localforage.getItem('data').then((data: any) => {
      if (data) {
        setAdded(data);
      }
    });
    localforage.getItem('list').then((data: any) => {
      setList(data);
    });
    localforage.getItem('tax').then((data: any) => setTax(data));
    //load previously added discount
    localforage.getItem('discount').then((data: any) => setDiscount(data));
    localforage.getItem('customer').then((data: any) => setCustomer(data));
  }, []);

  const setDefaultOptions = () => {
    localforage.getItem('defaultDiscount').then((data: any) => setDiscount(data));
    localforage.getItem('defaultTax').then((data: any) => setTax(data));
  };

  useEffect(() => {
    Mousetrap.bind(['up', 'down', 'enter'], function (e: Event) {
      e.preventDefault();
      if (modal) {
        //move cursor in variant chooser modal
        moveVariantsCursor(e);
      } else {
        //skip if some other modal is open
        if (!document.body.classList.contains('ReactModal__Body--open')) {
          //move cursor in items
          moveCursor(e);
        }
      }
    });
  }, [modal, selected, selectedVariant, variants, items, added, quantity]);

  Mousetrap.bind('/', function(){
    if (searchField.current !== null) {
      searchField.current.focus();
    }
  });

  const onCheckAll = (e: any) => {
    const newAdded = [...added];
    newAdded.map(item => item.checked = e.target.checked);

    setAdded(newAdded);
  }

  const onCheck = (state: boolean, index: number) => {
    const items = [...added];

    items[index].checked = state;

    setAdded(items);
  }

  const user = useSelector(getAuthorizedUser);

  return (
    <>
      <div className="grid gap-1 grid-cols-12 max-h-full" onClick={(event) => setFocus(event, searchField)}>
        <div className="col-span-3 p-3 bg-white">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <SaleBrands brands={brands} setBrands={setBrands}>
              <FontAwesomeIcon icon={faFlag} />
            </SaleBrands>
            <SaleCategories categories={categories} setCategories={setCategories}>
              <FontAwesomeIcon icon={faCubesStacked} />
            </SaleCategories>
            <SaleDepartments departments={departments} setDepartments={setDepartment}>
              <FontAwesomeIcon icon={faIcons} />
            </SaleDepartments>
          </div>
          <div className="mb-1 input-group">
            <SpeechSearch setQ={setQ} setQuantity={setQuantity}/>
            <Input
              placeholder="Search items"
              type="search"
              onChange={(value) => {
                setQ(value.currentTarget.value);
                setSelected(0);
              }}
              autoFocus
              ref={searchField}
              selectable
              className="search-field relative mousetrap flex-1 lg w-full"
              value={q}
              onFocus={() => searchField.current?.select()}
              tabIndex={0}
            />
            <Input placeholder="QTY"
                   className="w-24 mousetrap lg"
                   value={quantity}
                   onChange={(event) => setQuantity(+event.currentTarget.value)}
                   selectable={true}
                   tabIndex={0}
            />
          </div>

          <SearchTable
            searchScrollContainer={searchScrollContainer}
            items={items}
            selected={selected}
            setSelected={setSelected}
            setRate={setRate}
            addItem={addItem}
            quantity={quantity}
            q={q}
          />
        </div>
        <div className="col-span-6 bg-white">
          <CartControls added={added} setAdded={setAdded} containerRef={containerRef.current}/>
          <div className="overflow-auto block h-[calc(100vh_-_250px)]" ref={containerRef}>
            <CartContainer
              added={added}
              onQuantityChange={onQuantityChange}
              onDiscountChange={onDiscountChange}
              onPriceChange={onPriceChange}
              deleteItem={deleteItem}
              subTotal={subTotal}
              onCheckAll={onCheckAll}
              onCheck={onCheck}
              setAdded={setAdded}
              cartItemType={cartItemType}
              cartItem={cartItem}
              setCartItem={setCartItem}
              setCartItemType={setCartItemType}
            />
          </div>
          <div className="bg-gray-100 h-[180px]">
            <div className="grid gap-4 grid-cols-3 border border-x-0 border-b-0 border-gray-300">
              <div className="col-span-1 grid grid-cols-2 font-bold gap-0 auto-rows-min">
                <span>User</span><span className="text-primary-500">{user?.displayName}</span>
                <span>Store</span><span className="text-primary-500">{store?.name}</span>
                <span>Terminal</span><span className="text-primary-500">{terminal?.code}</span>
              </div>
              <div className="col-span-2 p-3 flex flex-wrap flex-row justify-between gap-3 items-end">
                <SaleHistory
                  setAdded={setAdded}
                  setDiscount={setDiscount}
                  setTax={setTax}
                  setCustomer={setCustomer}
                  setDiscountAmount={setDiscountAmount}
                  customer={customer}
                  setRefundingFrom={setRefundingFrom}
                />
                <Customers customer={customer} setCustomer={setCustomer}/>
                <Expenses/>
                <PurchaseTabs />
                <More
                  setTax={setTax}
                  setDiscount={setDiscount}
                />
                <SaleClosing/>
                <Logout/>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-3 p-3 bg-white">
          <CloseSaleInline
            added={added}
            setAdded={setAdded}
            finalTotal={finalTotal}
            paymentTypesList={paymentTypesList.list}
            setDiscount={setDiscount}
            setTax={setTax}
            setDiscountAmount={setDiscountAmount}
            subTotal={subTotal}
            taxTotal={taxTotal}
            couponTotal={couponTotal}
            discountTotal={discountTotal}
            discount={discount}
            tax={tax}
            customer={customer}
            setCustomer={setCustomer}
            discountAmount={discountAmount}
            refundingFrom={refundingFrom}
            setRefundingFrom={setRefundingFrom}
            setCloseSale={setCloseSale}
            closeSale={closeSale}
            setDiscountRateType={setDiscountRateType}
            discountRateType={discountRateType}
            isInline={true}
            adjustment={adjustment}
            setAdjustment={setAdjustment}
          />
        </div>
      </div>
      <Modal open={modal} onClose={() => {
        setModal(false);
        setVariants([]);
      }} title={modalTitle}>
        {variants.length > 0 && (
          <div className="table w-full">
            <div className="table-header-group">
              <div className="table-row">
                <div className="table-cell p-5 text-left font-bold">Item</div>
                <div className="table-cell p-5 text-left font-bold">Variant</div>
                <div className="table-cell p-5 text-right font-bold">Rate</div>
              </div>
            </div>
            <div className="table-row-group">
              {variants.map((item, index) => (
                <div className={
                  classNames(
                    'table-row hover:bg-gray-200 cursor-pointer',
                    selectedVariant === index ? 'bg-gray-300' : ''
                  )
                } onClick={() => addItemVariant(latest!, item, quantity)} key={index}>
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
                      <>
                        {item.price}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  )
};

export default Pos;
