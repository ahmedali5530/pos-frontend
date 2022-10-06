import {useEffect, useState} from "react";
import {
  DEVICE_LIST,
  DISCOUNT_LIST,
  PAYMENT_TYPE_LIST,
  PRODUCT_LIST,
  SETTING_LIST,
  TAX_LIST
} from "../routing/routes/backend.app";
import localforage from '../../lib/localforage/localforage';
import {jsonRequest} from "../request/request";
import {Product} from "../model/product";
import {Discount} from "../model/discount";
import {Tax} from "../model/tax";
import {PaymentType} from "../model/payment.type";
import {Device} from "../model/device";
import {Setting} from "../model/setting";

interface ReturnAction{
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

interface ReturnState{
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

  const loadProducts = async (offset = 0, limit = 100) => {
    let total: number;

    const res = await jsonRequest(`${PRODUCT_LIST}?limit=${limit}&offset=${offset}`);
    const l = await res.json();

    total = l.total;

    offset += l.count;

    setList(prev => {
      localforage.setItem('list', {
        list: [...prev.list, ...l.list]
      });

      return {
        ...prev,
        list: [...prev.list, ...l.list]
      }
    });

    if(total !== offset) {
      await loadProducts(offset);
    }
  };

  const loadData = async () => {
    const localList: HomeProps['list'] | null = await localforage.getItem('list');
    if (localList === null) {
      try {
        await loadProducts();
      }catch (e) {
        throw e;
      }
    } else {
      setList(localList);
    }

    const localDiscountList: HomeProps['discountList'] | null = await localforage.getItem('discountList');
    if (localDiscountList === null) {
      try {
        const discount = await jsonRequest(DISCOUNT_LIST);
        const discountList = await discount.json();

        setDiscountList(discountList);
        await localforage.setItem('discountList', discountList);
      }catch(e){
        throw e;
      }
    } else {
      setDiscountList(localDiscountList);
    }

    const localTaxList: HomeProps['taxList'] | null = await localforage.getItem('taxList');
    if (localTaxList === null) {
      try {
        const taxList = await jsonRequest(TAX_LIST);
        const json = await taxList.json();
        setTaxList(json);

        await localforage.setItem('taxList', json);
      }catch (e) {
        throw e;
      }
    } else {
      setTaxList(localTaxList);
    }

    const localPaymentTypesList: HomeProps['paymentTypesList'] | null = await localforage.getItem('paymentTypesList');
    if (localPaymentTypesList === null) {
      try {
        const paymentTypesList = await jsonRequest(PAYMENT_TYPE_LIST);
        const json = await paymentTypesList.json();

        setPaymentTypesList(json);
        await localforage.setItem('paymentTypesList', json);
      }catch (e) {
        throw e;
      }
    } else {
      setPaymentTypesList(localPaymentTypesList);
    }

    const localDeviceList: HomeProps['deviceList']|null = await localforage.getItem('deviceList');
    if (localDeviceList === null) {
      try {
        const deviceList = await jsonRequest(DEVICE_LIST);
        const json = await deviceList.json();

        setDeviceList(json);
        await localforage.setItem('deviceList', json);
      }catch (e) {
        throw e;
      }
    } else {
      setDeviceList(localDeviceList);
    }

    const localSettingList: HomeProps['settingList']|null = await localforage.getItem('settingList');
    if (localSettingList === null) {
      try {
        const settingList = await jsonRequest(SETTING_LIST);
        const json = await settingList.json();

        setSettingList(json);
        await localforage.setItem('settingList', json);
      }catch (e) {
        throw e;
      }
    } else {
      setSettingList(localSettingList);
    }
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
