import React, {FC, useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCog} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../button";
import {Modal} from "../modal";
import Select from "react-select";
import {Tax} from "../../../api/model/tax";
import {Discount} from "../../../api/model/discount";
import {HomeProps} from "../../containers/dashboard/pos";
import {useLoadData} from "../../hooks/use.load.data";
import localforage from "../../../lib/localforage/localforage";
import {useSelector} from "react-redux";
import {getAuthorizedUser} from "../../../duck/auth/auth.selector";

interface Props{
  setList: (list: HomeProps['list']) => void;
  setDiscountList: (list: HomeProps['discountList']) => void;
  setTaxList: (list: HomeProps['taxList']) => void;
  setPaymentTypesList: (list: HomeProps['paymentTypesList']) => void;
  setTax: (data?: Tax) => void;
  setDiscount: (data?: Discount) => void;
}

export interface ReactSelectOptionProps{
  value: string;
  label: string;
}

export const More: FC<Props> = ({
  setList, setDiscountList, setTaxList, setPaymentTypesList, setTax, setDiscount
}) => {
  const [modal, setModal] = useState(false);
  const [state, action] = useLoadData();

  useEffect(() => {
    setList(state.list);
    setDiscountList(state.discountList);
    setTaxList(state.taxList);
    setPaymentTypesList(state.paymentTypesList);
  }, [state.list, state.discountList, state.taxList, state.paymentTypesList]);

  const [isLoading, setLoading] = useState(false);

  const clearCache = async () => {
    setLoading(true);
    await localforage.setItem('list', null);
    await localforage.setItem('deviceList', null);
    await localforage.setItem('discountList', null);
    await localforage.setItem('taxList', null);
    await localforage.setItem('paymentTypesList', null);
    await localforage.setItem('defaultTax', null);
    await localforage.setItem('defaultDiscount', null);
    await localforage.setItem('defaultPaymentType', null);
    await action.load();

    setLoading(false);

    window.location.reload();
  };

  const [defaultTax, setDefaultTax] = useState<ReactSelectOptionProps>();
  const [defaultDiscount, setDefaultDiscount] = useState<ReactSelectOptionProps>();
  const [defaultPaymentType, setDefaultPaymentType] = useState<ReactSelectOptionProps>();
  const [defaultDevice, setDefaultDevice] = useState<ReactSelectOptionProps>();


  useEffect(() => {
    if(modal){
      localforage.getItem('defaultTax').then((data: any) => {
        if(data) {
          setDefaultTax({
            label: data?.name + ' ' + data?.rate,
            value: JSON.stringify(data)
          });

          setTax(data);
        }
      });

      localforage.getItem('defaultDiscount').then((data: any) => {
        if(data) {
          setDefaultDiscount({
            label: data?.name,
            value: JSON.stringify(data)
          });

          setDiscount(data);
        }
      });

      localforage.getItem('defaultPaymentType').then((data: any) => {
        if(data) {
          setDefaultPaymentType({
            label: data?.name,
            value: JSON.stringify(data)
          });
        }
      });

      localforage.getItem('defaultDevice').then((data: any) => {
        if(data) {
          setDefaultDevice({
            label: data?.name,
            value: JSON.stringify(data)
          });
        }
      });
    }
  }, [modal]);

  const user = useSelector(getAuthorizedUser);

  return (
    <>
      <Button variant="secondary" className="w-auto" size="lg" onClick={() => {
        setModal(true);
      }} title="Settings"><FontAwesomeIcon icon={faCog} className="mr-3"/> Settings</Button>

      <Modal open={modal} onClose={() => {
        setModal(false);
      }} title="Settings">
        <div className="border flex justify-center items-center mb-5 border-purple-500 text-purple-500 w-full font-bold p-5">
          Logged in as {user?.displayName}
        </div>
        <div className="w-full"/>

        <Button variant="success" onClick={() => {
          clearCache();
        }} className="mr-3 mb-3" size="lg" disabled={isLoading}>
          {isLoading ? 'Clearing...' : 'Refresh Cache'}
        </Button>
        <hr className="my-5"/>
        <div className="grid grid-cols-4 gap-5">
          <div>
            <h3 className="text-xl">Set Default tax</h3>
            <Select
              options={state.taxList.list.map(item => {
                return {
                  label: item.name + ' ' + item.rate,
                  value: JSON.stringify(item)
                };
              })}
              isClearable
              onChange={(value: any) => {
                if(value) {
                  localforage.setItem('defaultTax', JSON.parse(value.value));
                  setTax(JSON.parse(value.value));
                }else{
                  localforage.removeItem('defaultTax');
                  setTax(undefined);
                }
              }}
              value={defaultTax}
            />
          </div>
          <div>
            <h3 className="text-xl">Set Default discount</h3>
            <Select
              options={state.discountList.list.map(item => {
                return {
                  label: item.name,
                  value: JSON.stringify(item)
                };
              })}
              isClearable
              onChange={(value: any) => {
                if(value) {
                  localforage.setItem('defaultDiscount', JSON.parse(value.value));
                  setDiscount(JSON.parse(value.value));
                }else{
                  localforage.removeItem('defaultDiscount');
                  setDiscount(undefined);
                }

              }}
              value={defaultDiscount}
            />
          </div>
          <div>
            <h3 className="text-xl">Set Default payment type</h3>
            <Select
              options={state.paymentTypesList.list.map(item => {
                return {
                  label: item.name,
                  value: JSON.stringify(item)
                };
              })}
              isClearable
              onChange={(value: any) => {
                if(value) {
                  localforage.setItem('defaultPaymentType', JSON.parse(value.value));
                }else{
                  localforage.removeItem('defaultPaymentType');
                }
              }}
              value={defaultPaymentType}
            />
          </div>
          <div>
            <h3 className="text-xl">Set Default Printer</h3>
            <Select
              options={state.deviceList.list.map(item => {
                return {
                  label: item.name,
                  value: JSON.stringify(item)
                };
              })}
              isClearable
              onChange={(value: any) => {
                if(value) {
                  localforage.setItem('defaultDevice', JSON.parse(value.value));
                }else{
                  localforage.removeItem('defaultDevice');
                }
              }}
              value={defaultDevice}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};
