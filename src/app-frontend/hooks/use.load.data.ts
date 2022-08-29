import {useEffect, useState} from "react";
import {DEVICE_LIST, DISCOUNT_LIST, PAYMENT_TYPE_LIST, PRODUCT_LIST, TAX_LIST} from "../../api/routing/routes/backend.app";
import {HomeProps, initialData} from "../containers/dashboard/pos";
import localforage from '../../lib/localforage/localforage';
import {jsonRequest} from "../../api/request/request";

interface ReturnAction{
  load: () => void;
}

interface ReturnState{
  list: HomeProps['list'];
  discountList: HomeProps['discountList'];
  taxList: HomeProps['taxList'];
  paymentTypesList: HomeProps['paymentTypesList'];
  deviceList: HomeProps['deviceList']
}

export const useLoadData = (): [ReturnState, ReturnAction] => {
  const [list, setList] = useState<HomeProps['list']>(initialData);
  const [discountList, setDiscountList] = useState<HomeProps['discountList']>(initialData);
  const [taxList, setTaxList] = useState<HomeProps['taxList']>(initialData);
  const [paymentTypesList, setPaymentTypesList] = useState<HomeProps['paymentTypesList']>(initialData);
  const [deviceList, setDeviceList] = useState<HomeProps['deviceList']>(initialData);

  const loadData = async () => {
    const localList: HomeProps['list'] | null = await localforage.getItem('list');
    if (localList === null) {
      try {
        const res = await jsonRequest(PRODUCT_LIST);
        const json = await res.json();
        setList(json);

        localforage.setItem('list', json);
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
        localforage.setItem('discountList', discountList);
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

        localforage.setItem('taxList', json);
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
        localforage.setItem('paymentTypesList', json);
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
        localforage.setItem('deviceList', json);
      }catch (e) {
        throw e;
      }
    } else {
      setDeviceList(localDeviceList);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return [
    {
      list, discountList, paymentTypesList, taxList, deviceList
    }, {
      load: loadData
    }
  ];
};
