import {useEffect, useState} from "react";
import localforage from '../../lib/localforage/localforage';
import {ITEM_FETCHES, Product} from "../model/product";
import {Discount} from "../model/discount";
import {Tax} from "../model/tax";
import {PaymentType} from "../model/payment.type";
import {Device} from "../model/device";
import {Setting} from "../model/setting";
import {useAtom} from "jotai";
import {appState as AppState} from "../../store/jotai";
import {useDB} from "../db/db";
import {Tables} from "../db/tables";

interface ReturnAction {
  load: () => void;
}

export interface HomeProps {
  list: {
    list: Product[];
  },
  discountList: {
    list: Discount[];
  },
  taxList: {
    list: Tax[];
  },
  paymentTypesList: {
    list: PaymentType[];
  },
  deviceList: {
    list: Device[];
  },
  settingList: {
    list: Setting[];
  }
}

interface ReturnState {
  list: HomeProps['list'];
  discountList: HomeProps['discountList'];
  taxList: HomeProps['taxList'];
  paymentTypesList: HomeProps['paymentTypesList'];
  deviceList: HomeProps['deviceList'];
  settingList: HomeProps['settingList']
}

export const initialData = {
  list: []
};

export const useLoadData = (): [ReturnState, ReturnAction] => {
  const [list, setList] = useState<HomeProps['list']>(initialData);
  const [discountList, setDiscountList] = useState<HomeProps['discountList']>(initialData);
  const [taxList, setTaxList] = useState<HomeProps['taxList']>(initialData);
  const [paymentTypesList, setPaymentTypesList] = useState<HomeProps['paymentTypesList']>(initialData);
  const [deviceList, setDeviceList] = useState<HomeProps['deviceList']>(initialData);
  const [settingList, setSettingList] = useState<HomeProps['settingList']>(initialData);
  const [, setAppSt] = useAtom(AppState);
  const db = useDB();

  // const dispatch = useDispatch();

  const loadProducts = async (offset = 1, limit = 100) => {
    // const res = await jsonRequest(`${PRODUCT_LIST}?itemsPerPage=${limit}&page=${offset}&isActive=true`);
    // const l = await res.json();

    const [products] = await db.query<Product[]>(`SELECT * FROM ${Tables.product} fetch ${ITEM_FETCHES.join(', ')} `);

    setList(prev => {
      localforage.setItem('list', {
        list: products
      });

      return {
        ...prev,
        list: products
      }
    });
  };

  const loadData = async () => {
    const localList: HomeProps['list'] | null = await localforage.getItem('list');
    if (localList === null) {
      setAppSt(prev => ({
        ...prev,
        progress: 'Products'
      }))
      try {
        await loadProducts();
      } catch (e) {
        throw e;
      }
    } else {
      setList(localList);
    }

    const localDiscountList: HomeProps['discountList'] | null = await localforage.getItem('discountList');
    if (localDiscountList === null) {
      setAppSt(prev => ({
        ...prev,
        progress: 'Discounts'
      }))
      try {

        const [discounts] = await db.query<Discount[]>(`SELECT * FROM ${Tables.discount}`);

        setDiscountList({list: discounts});
        await localforage.setItem('discountList', {list: discounts});
      } catch (e) {
        throw e;
      }
    } else {
      setDiscountList(localDiscountList);
    }

    const localTaxList: HomeProps['taxList'] | null = await localforage.getItem('taxList');
    if (localTaxList === null) {
      setAppSt(prev => ({
        ...prev,
        progress: 'Taxes'
      }));

      try {
        const [taxes] = await db.query<Tax[]>(`SELECT * FROM ${Tables.tax}`);

        setTaxList({list: taxes});
        await localforage.setItem('taxList', {list: taxes});
      } catch (e) {
        throw e;
      }
    } else {
      setTaxList(localTaxList);
    }

    const localPaymentTypesList: HomeProps['paymentTypesList'] | null = await localforage.getItem('paymentTypesList');
    if (localPaymentTypesList === null) {
      setAppSt(prev => ({
        ...prev,
        progress: 'Payment types'
      }));

      try {
        const [paymentTypes] = await db.query<PaymentType[]>(`SELECT * FROM ${Tables.payment}`);

        setPaymentTypesList({list: paymentTypes});
        await localforage.setItem('paymentTypesList', {list: paymentTypes});
      } catch (e) {
        throw e;
      }
    } else {
      setPaymentTypesList(localPaymentTypesList);
    }

    const localDeviceList: HomeProps['deviceList'] | null = await localforage.getItem('deviceList');
    if (localDeviceList === null) {
      setAppSt(prev => ({
        ...prev,
        progress: 'Devices'
      }));

      try {
        const [devices] = await db.query<Device[]>(`SELECT * FROM ${Tables.device}`);

        setDeviceList({list: devices});
        await localforage.setItem('deviceList', {list: devices});
      } catch (e) {
        throw e;
      }
    } else {
      setDeviceList(localDeviceList);
    }

    const localSettingList: HomeProps['settingList'] | null = await localforage.getItem('settingList');
    if (localSettingList === null) {
      setAppSt(prev => ({
        ...prev,
        progress: 'Settings'
      }))

      try {
        const [settings] = await db.query<Setting[]>(`SELECT * FROM ${Tables.setting}`);

        setSettingList({list: settings});
        await localforage.setItem('settingList', {list: settings});
      } catch (e) {
        throw e;
      }
    } else {
      setSettingList(localSettingList);
    }

    setAppSt(prev => ({
      ...prev,
      progress: 'Done'
    }))
  };

  useEffect(() => {
    loadData();
  }, []);

  return [
    {
      list, discountList, paymentTypesList, taxList, deviceList, settingList
    }, {
      load: loadData
    }
  ];
};
