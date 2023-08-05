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
import { message as AntMessage} from 'antd';
import {useDispatch} from "react-redux";
import {progressAction} from "../../duck/progress/progress.action";

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
  const dispatch = useDispatch();

  const loadProducts = async (offset = 1, limit = 100) => {
    const res = await jsonRequest(`${PRODUCT_LIST}?itemsPerPage=${limit}&page=${offset}&isActive=true`);
    const l = await res.json();

    offset += 1;

    setList(prev => {
      localforage.setItem('list', {
        list: [...prev.list, ...l['hydra:member']]
      });

      return {
        ...prev,
        list: [...prev.list, ...l['hydra:member']]
      }
    });

    if(l['hydra:member'].length > 0) {
      await loadProducts(offset);
    }
  };

  const loadData = async () => {
    const localList: HomeProps['list'] | null = await localforage.getItem('list');
    if (localList === null) {
      dispatch(progressAction('Products'))
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
      dispatch(progressAction('Discounts'))
      try {
        const discount = await jsonRequest(`${DISCOUNT_LIST}?isActive=true`);
        const discountList = await discount.json();

        discountList.list = discountList['hydra:member'];
        delete discountList['hydra:member'];

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
      dispatch(progressAction('Taxes'))
      try {
        const taxList = await jsonRequest(`${TAX_LIST}?isActive=true`);
        const json = await taxList.json();

        json.list = json['hydra:member'];
        delete json['hydra:member'];
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
      dispatch(progressAction('Payment types'))
      try {
        const paymentTypesList = await jsonRequest(`${PAYMENT_TYPE_LIST}?isActive=true`);
        const json = await paymentTypesList.json();

        json.list = json['hydra:member'];
        delete json['hydra:member'];

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
      dispatch(progressAction('Devices'))
      try {
        const deviceList = await jsonRequest(`${DEVICE_LIST}?isActive=true`);
        const json = await deviceList.json();

        json.list = json['hydra:member'];
        delete json['hydra:member'];

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
      dispatch(progressAction('Settings'))
      try {
        const settingList = await jsonRequest(SETTING_LIST);
        const json = await settingList.json();

        json.list = json['hydra:member'];
        delete json['hydra:member'];

        setSettingList(json);
        await localforage.setItem('settingList', json);
      }catch (e) {
        throw e;
      }
    } else {
      setSettingList(localSettingList);
    }

    dispatch(progressAction('Done'))
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
