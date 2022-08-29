import React, {createRef, FC, useEffect, useMemo, useState} from "react";
import classNames from "classnames";
import {DateTime} from "luxon";
import {FixedSizeList} from "react-window";
import {Product} from "../../../api/model/product";
import {Discount, DiscountRate, DiscountScope} from "../../../api/model/discount";
import {Tax} from "../../../api/model/tax";
import {PaymentType} from "../../../api/model/payment.type";
import {Device} from "../../../api/model/device";
import {CartItem} from "../../../api/model/cart.item";
import {useSelector} from "react-redux";
import { useLoadData } from "../../hooks/use.load.data";
import {Customer} from "../../../api/model/customer";
import {ProductVariant} from "../../../api/model/product.variant";
import localforage from "../../../lib/localforage/localforage";
import SpeechSearch from "../../components/sale/speech.search";
import {Input} from "../../components/input";
import {SearchTable} from "../../components/sale/search.table";
import {CartContainer} from "../../components/sale/cart/cart.container";
import {Modal} from "../../components/modal";
import {CloseSale} from "../../components/sale/sale";
import {ClearSale} from "../../components/sale/clear.sale";
import {SaleHistory} from "../../components/sale/sale.history";
import {Customers} from "../../components/sale/customers";
import {Logout} from "../../components/logout";
import {Expenses} from "../../components/sale/expenses";
import {Items} from "../../components/sale/items";
import {More} from "../../components/sale/more";
import {OrderTotals} from "../../components/sale/cart/order.totals";
import {getAuthorizedUser} from "../../../duck/auth/auth.selector";

export interface HomeProps {
  list: {
    list: Product[];
    count: number;
    total: number;
  },
  discountList: {
    list: Discount[];
    count: number;
    total: number;
  },
  taxList: {
    list: Tax[];
    count: number;
    total: number;
  },
  paymentTypesList: {
    list: PaymentType[];
    count: number;
    total: number;
  },
  deviceList: {
    list: Device[];
    count: number;
    total: number;
  }
}

export const initialData = {
  list: [],
  count: 0,
  total: 0
};

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

export const getRowTotal = (item: CartItem) => {
  let total = item.price * item.quantity;
  if (item.discount) {
    total -= item.discount;
  }

  return total;
};

const Pos: FC = () => {

  const user = useSelector(getAuthorizedUser);

  const [list, setList] = useState<HomeProps['list']>(initialData);
  const [discountList, setDiscountList] = useState<HomeProps['discountList']>(initialData);
  const [taxList, setTaxList] = useState<HomeProps['taxList']>(initialData);
  const [paymentTypesList, setPaymentTypesList] = useState<HomeProps['paymentTypesList']>(initialData);

  const [state, action] = useLoadData();

  useEffect(() => {
    setList(state.list);
    // setDiscountList(state.discountList);
    // setTaxList(state.taxList);
    setPaymentTypesList(state.paymentTypesList);
  }, [state.list, state.discountList, state.taxList, state.paymentTypesList]);

  const [q, setQ] = useState<string>('');
  const [added, setAdded] = useState<CartItem[]>([]);
  const [selected, setSelected] = useState(0);
  const searchField = createRef<HTMLInputElement>();
  const containerRef = createRef<HTMLDivElement>();
  const [latest, setLatest] = useState<Product>();
  const [quantity, setQuantity] = useState(1);
  const [rate, setRate] = useState(0);
  const [discount, setDiscount] = useState<Discount>();
  const [discountAmount, setDiscountAmount] = useState<number>();
  const [discountRateType, setDiscountRateType] = useState<string>();
  const [tax, setTax] = useState<Tax>();
  const [coupon, setCoupon] = useState();
  const [discountModal, setDiscountModal] = useState(false);
  const [taxModal, setTaxModal] = useState(false);
  const [askDiscount, setAskDiscount] = useState(false);
  const [customer, setCustomer] = useState<Customer>();
  const [refundingFrom, setRefundingFrom] = useState<number>();
  const [closeSale, setCloseSale] = useState(false);

  const subTotal = useMemo(() => {
    return added.reduce((prev, item) => prev + getRowTotal(item), 0);
  }, [added]);

  const taxTotal = useMemo(() => {
    if (!tax) return 0;

    return tax.rate * subTotal / 100;
  }, [tax, subTotal]);

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

  const items = useMemo(() => {
    return list?.list?.filter(item => {
      if (item.shortCode && item.shortCode.toLowerCase().startsWith(q.toLowerCase())) {
        return true;
      }

      if (item.barcode && item.barcode.toLowerCase().startsWith(q.toLowerCase())) {
        return true;
      }

      return item.name.toLowerCase().indexOf(q.toLowerCase()) !== -1;
    })
  }, [list.list, q]);

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
        discount: 0
      });
    }

    setAdded(oldItems);

    setSelected(items.findIndex(i => i.id === item.id));
    setQuantity(1);
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
        discount: 0
      });
    }

    setLatest(item);

    setAdded(oldItems);
    setModal(false);
    setVariants([]);
    setSelected(items.findIndex(i => i.id === item.id));
    setQuantity(1);
  };

  const onQuantityChange = (item: CartItem, newQuantity: number) => {
    const oldItems = [...added];
    let index = oldItems.findIndex(addItem => addItem.item.id === item.item.id && item.variant === addItem.variant);
    if (index !== -1) {
      if (newQuantity === 0) {
        oldItems.splice(index, 1);
      } else {
        oldItems[index].quantity = newQuantity;
      }
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
    if (newDiscount >= oldItems[index].price * oldItems[index].quantity) {
      newDiscount = oldItems[index].price * oldItems[index].quantity;
    }

    if (index !== -1) {
      oldItems[index].discount = newDiscount;
    }

    setAdded(oldItems);
  };

  const deleteItem = (index: number) => {
    if (!window.confirm('Delete item?')) return false;

    const oldItems = [...added];

    oldItems.splice(index, 1);
    setAdded(oldItems);
  };

  const setFocus = (event: any, element: any) => {
    if (document.body.classList.contains('ReactModal__Body--open')) return;

    const inputNodes = [
      'INPUT', 'SELECT', 'TEXTAREA'
    ];

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

  const scrollCartToBottom = () => {
    if (containerRef && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

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
    //load previously added discont
    localforage.getItem('discount').then((data: any) => setDiscount(data));
    localforage.getItem('customer').then((data: any) => setCustomer(data));
  }, []);

  const setDefaultOptions = () => {
    localforage.getItem('defaultDiscount').then((data: any) => setDiscount(data));
    localforage.getItem('defaultTax').then((data: any) => setTax(data));
  };

  return (
    <>
      <div className="grid gap-4 grid-cols-12 h-[calc(100vh_-_290px)] max-h-full">
        <div className="col-span-4 bg-gray-50 p-3" onClick={(event) => setFocus(event, searchField)}
             onKeyUp={(event) => moveCursor(event)}>
          <div className="flex flex-column mb-1">
            <SpeechSearch />
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
              className="search-field relative mousetrap"
            />
            <Input placeholder="QTY"
                   className="w-24 mousetrap" value={quantity}
                   onChange={(event) => setQuantity(+event.currentTarget.value)}
                   selectable={true}
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
        <div className="col-span-8 bg-gray-50" onClick={(event) => setFocus(event, searchField)}>
          <div className="overflow-auto block p-3 pt-0" ref={containerRef}>
            <CartContainer
              added={added}
              onQuantityChange={onQuantityChange}
              onDiscountChange={onDiscountChange}
              onPriceChange={onPriceChange}
              deleteItem={deleteItem}
              subTotal={subTotal}
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
                  <div className="table-cell p-2 text-left font-bold">Item</div>
                  <div className="table-cell p-2 text-left font-bold">Attribute</div>
                  <div className="table-cell p-2 text-left font-bold">Value</div>
                  <div className="table-cell p-2 text-right font-bold">Rate</div>
                </div>
              </div>
              <div className="table-row-group">
                {variants.map((item, index) => (
                  <div className={
                    classNames(
                      'table-row hover:bg-gray-200 cursor-pointer'
                    )
                  } onClick={() => addItemVariant(latest!, item, quantity)} key={index}>
                    <div className="table-cell p-2">
                      {item.name}
                      {item.barcode && (
                        <div className="text-gray-400">{item.barcode}</div>
                      )}
                    </div>
                    <div className="table-cell p-5">{item.attributeName}</div>
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
      </div>
      <div className="bg-gray-100 h-[280px]">
        <div className="grid gap-4 grid-cols-5 border border-x-0 border-b-0 border-gray-300">
          <div className="col-span-3 p-3 flex flex-wrap flex-row justify-between">
            keyboard will appear here
          </div>
          <div className="col-span-1 p-3 flex flex-wrap flex-row justify-between">
            <CloseSale
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
            />
            <ClearSale
              added={added}
              setAdded={setAdded}
              setDiscount={setDiscount}
              setTax={setTax}
              setDiscountAmount={setDiscountAmount}
            />
            <div className="w-full"></div>
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
            <Logout/>
            <Expenses/>
            <Items/>
            <More
              setList={setList}
              setDiscountList={setDiscountList}
              setTaxList={setTaxList}
              setPaymentTypesList={setPaymentTypesList}
              setTax={setTax}
              setDiscount={setDiscount}
            />
          </div>
          <div className="col-span-1 p-3">
            <OrderTotals
              subTotal={subTotal}
              setTax={setTax}
              taxTotal={taxTotal}
              setDiscount={setDiscount}
              setDiscountAmount={setDiscountAmount}
              discountTotal={discountTotal}
              couponTotal={couponTotal}
              finalTotal={finalTotal}
              discountAmount={discountAmount}
              added={added}
              discountRateType={discountRateType}
              setDiscountRateType={setDiscountRateType}
            />
          </div>
        </div>
      </div>
    </>
  )
};

export default Pos;
