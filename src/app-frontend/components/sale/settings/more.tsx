import React, {FC, useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCog} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../../button";
import {Modal} from "../../modal";
import {Tax} from "../../../../api/model/tax";
import {Discount} from "../../../../api/model/discount";
import localforage from "../../../../lib/localforage/localforage";
import {useDispatch, useSelector} from "react-redux";
import {getAuthorizedUser} from "../../../../duck/auth/auth.selector";
import {Switch} from "../../../../app-common/components/input/switch";
import {Tab, TabContent, TabControl, TabNav} from "../../../../app-common/components/tabs/tabs";
import {ReactSelectOptionProps} from "../../../../api/model/common";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {HomeProps, useLoadData} from "../../../../api/hooks/use.load.data";
import {Stores} from "./stores";
import { Users } from "./users";
import {PaymentTypes} from "./payment.types";
import {DiscountTypes} from "./discount.types";
import {TaxTypes} from "./tax.types";
import {shortcutAction} from "../../../../duck/shortcuts/shortcut.action";

interface Props{
  setList: (list: HomeProps['list']) => void;
  setPaymentTypesList: (list: HomeProps['paymentTypesList']) => void;
  setTax: (data?: Tax) => void;
  setDiscount: (data?: Discount) => void;
}

export const More: FC<Props> = ({
  setList, setPaymentTypesList, setTax, setDiscount
}) => {
  const [modal, setModal] = useState(false);
  const [state, action] = useLoadData();

  const dispatch = useDispatch();

  useEffect(() => {
    setList(state.list);
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

  const [displayVariants, setDisplayVariants] = useState(false);
  const [displayShortcuts, setDisplayShortcuts] = useState(false);


  useEffect(() => {
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

    localforage.getItem('displayVariants').then((data: any) => {
      if(data){
        setDisplayVariants(data);
      }else{
        setDisplayVariants(false);
      }
    });
    localforage.getItem('displayShortcuts').then((data: any) => {
      if(data){
        setDisplayShortcuts(data);
        dispatch(shortcutAction(data));
      }else{
        setDisplayShortcuts(false);
        dispatch(shortcutAction(false));
      }
    });
  }, []);

  const user = useSelector(getAuthorizedUser);

  return (
    <>
      <Button variant="secondary" className="w-auto" size="lg" onClick={() => {
        setModal(true);
      }} title="Settings"><FontAwesomeIcon icon={faCog} className="mr-3"/> Settings</Button>

      <Modal open={modal} onClose={() => {
        setModal(false);
      }} title="Settings" full>
        <TabControl
          defaultTab="general"
          render={({isTabActive, setActiveTab, activeTab}) => (
            <>
              <TabNav>
                <Tab isActive={isTabActive('general')} onClick={() => setActiveTab('general')}>General</Tab>
                <Tab isActive={isTabActive('profile')} onClick={() => setActiveTab('profile')}>Profile</Tab>
                <Tab isActive={isTabActive('users')} onClick={() => setActiveTab('users')}>Users</Tab>
                <Tab isActive={isTabActive('defaults')} onClick={() => setActiveTab('defaults')}>Default options</Tab>
                <Tab isActive={isTabActive('payments')} onClick={() => setActiveTab('payments')}>Payment types</Tab>
                <Tab isActive={isTabActive('discounts')} onClick={() => setActiveTab('discounts')}>Discounts</Tab>
                <Tab isActive={isTabActive('taxes')} onClick={() => setActiveTab('taxes')}>Taxes</Tab>
                <Tab isActive={isTabActive('stores')} onClick={() => setActiveTab('stores')}>Stores</Tab>
              </TabNav>
              <TabContent isActive={isTabActive('general')}>
                <div className="inline-flex flex-col gap-5 justify-start">
                  <Button variant="success" onClick={() => {
                    clearCache();
                  }} className="mr-3 flex-grow-0" size="lg" disabled={isLoading}>
                    {isLoading ? 'Clearing...' : 'Refresh Cache'}
                  </Button>

                  <Switch checked={displayShortcuts} onChange={(value) => {
                    localforage.setItem('displayShortcuts', value.target.checked);
                    setDisplayShortcuts(value.target.checked);
                    dispatch(shortcutAction(value.target.checked));
                  }}>Enable shortcuts?</Switch>
                </div>
              </TabContent>
              <TabContent isActive={isTabActive('profile')}>
                <div className="border flex justify-center items-center mb-5 border-purple-500 text-purple-500 w-full font-bold p-5">
                  Logged in as {user?.displayName}
                </div>
              </TabContent>
              <TabContent isActive={isTabActive('defaults')}>
                <div className="grid grid-cols-4 gap-5">
                  <div>
                    <h3 className="text-xl">Set Default tax</h3>
                    <ReactSelect
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
                          setDefaultTax(undefined);
                        }
                      }}
                      value={defaultTax}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl">Set Default discount</h3>
                    <ReactSelect
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
                          setDefaultDiscount(undefined);
                        }
                      }}
                      value={defaultDiscount}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl">Set Default payment type</h3>
                    <ReactSelect
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
                          setDefaultPaymentType(undefined);
                        }
                      }}
                      value={defaultPaymentType}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl">Set Default Printer</h3>
                    <ReactSelect
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
                          setDefaultDevice(undefined);
                        }
                      }}
                      value={defaultDevice}
                    />
                  </div>
                </div>
              </TabContent>
              <TabContent isActive={isTabActive('payments')}>
                <PaymentTypes />
              </TabContent>
              <TabContent isActive={isTabActive('discounts')}>
                <DiscountTypes />
              </TabContent>
              <TabContent isActive={isTabActive('taxes')}>
                <TaxTypes />
              </TabContent>
              <TabContent isActive={isTabActive('stores')}>
                <Stores />
              </TabContent>
              <TabContent isActive={isTabActive('users')}>
                <Users />
              </TabContent>
            </>
          )}
        />
      </Modal>
    </>
  );
};
