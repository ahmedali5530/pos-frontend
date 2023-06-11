import React, {FC, useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCog} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../../../app-common/components/input/button";
import {Modal} from "../../../app-common/components/modal/modal";
import {Tax} from "../../../api/model/tax";
import {Discount} from "../../../api/model/discount";
import localforage from "../../../lib/localforage/localforage";
import {useDispatch, useSelector} from "react-redux";
import {getAuthorizedUser} from "../../../duck/auth/auth.selector";
import {Switch} from "../../../app-common/components/input/switch";
import {Tab, TabContent, TabControl, TabNav} from "../../../app-common/components/tabs/tabs";
import {ReactSelectOptionProps} from "../../../api/model/common";
import {ReactSelect} from "../../../app-common/components/input/custom.react.select";
import {useLoadData} from "../../../api/hooks/use.load.data";
import {Stores} from "./stores/stores";
import { Users } from "./users/users";
import {PaymentTypes} from "./payment-types/payment.types";
import {DiscountTypes} from "./discounts/discount.types";
import {TaxTypes} from "./taxes/tax.types";
import {displayShortcutAction, shortcutAction} from "../../../duck/shortcuts/shortcut.action";
import {touchAction} from "../../../duck/touch/touch.action";
import {Terminals} from "./terminals/terminals";
import {Departments} from "./departments/departments";
import {Items} from "./items/items";
import {Categories} from "./categories/categories";
import {Brands} from "./brands/brands";
import {useMediaQuery} from "react-responsive";
import {message as AntMessage} from "antd";
import {getProgress} from "../../../duck/progress/progress.selector";

interface Props{
  setTax: (data?: Tax) => void;
  setDiscount: (data?: Discount) => void;
}

export const More: FC<Props> = ({
  setTax, setDiscount
}) => {
  const [modal, setModal] = useState(false);
  const [state, action] = useLoadData();
  const [messageApi, contextHolder] = AntMessage.useMessage();

  const dispatch = useDispatch();

  const progress = useSelector(getProgress);

  useEffect(() => {
    if(progress === 'Done'){
      messageApi.open({
        key: 'loading',
        type: 'success',
        content: `${progress}`,
      });

      setTimeout(() => messageApi.destroy(), 1000);
    }else{
      messageApi.open({
        key: 'loading',
        type: 'loading',
        content: `Loading ${progress}`,
        duration: 30
      });
    }
  }, [progress]);

  const [isLoading, setLoading] = useState(false);

  const clearCache = async () => {
    setLoading(true);
    await localforage.removeItem('list');
    await localforage.removeItem('deviceList');
    await localforage.removeItem('discountList');
    await localforage.removeItem('taxList');
    await localforage.removeItem('paymentTypesList');
    await localforage.removeItem('defaultTax');
    await localforage.removeItem('defaultDiscount');
    await localforage.removeItem('defaultPaymentType');
    // await action.load();

    setLoading(false);

    window.location.reload();
  };

  const [defaultTax, setDefaultTax] = useState<ReactSelectOptionProps>();
  const [defaultDiscount, setDefaultDiscount] = useState<ReactSelectOptionProps>();
  const [defaultPaymentType, setDefaultPaymentType] = useState<ReactSelectOptionProps>();
  const [defaultDevice, setDefaultDevice] = useState<ReactSelectOptionProps>();

  const [displayVariants, setDisplayVariants] = useState(false);
  const [enableShortcuts, setEnableShortcuts] = useState(false);
  const [displayShortcuts, setDisplayShortcuts] = useState(false);
  const [enableTouch, setEnableTouch] = useState(false);


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

    localforage.getItem('enableShortcuts').then((data: any) => {
      if(data){
        setEnableShortcuts(data);
        dispatch(shortcutAction(data));
      }else{
        setEnableShortcuts(false);
        dispatch(shortcutAction(false));
      }
    });

    localforage.getItem('displayShortcuts').then((data: any) => {
      if(data){
        setDisplayShortcuts(data);
        dispatch(displayShortcutAction(data));
      }else{
        setDisplayShortcuts(false);
        dispatch(displayShortcutAction(false));
      }
    });

    localforage.getItem('enableTouch').then((data: any) => {
      if(data){
        setEnableTouch(data);
        dispatch(touchAction(data));
      }else{
        setEnableTouch(false);
        dispatch(touchAction(false));
      }
    });
  }, []);

  const user = useSelector(getAuthorizedUser);

  const isMobile = useMediaQuery({
    query: '(max-width: 1224px)'
  });

  return (
    <>
      {contextHolder}
      <Button variant="secondary" className="w-auto" size="lg" onClick={() => {
        setModal(true);
      }} title="Settings" tabIndex={-1}><FontAwesomeIcon icon={faCog} className="mr-2"/> Settings</Button>

      <Modal open={modal} onClose={() => {
        setModal(false);
      }} title="Settings" size="full" transparentContainer={false}>
        <TabControl
          defaultTab="general"
          position={isMobile ? 'top' : 'left'}
          render={({isTabActive, setActiveTab}) => (
            <>
              <TabNav position={isMobile ? 'top' : 'left'} >
                <Tab isActive={isTabActive('general')} onClick={() => setActiveTab('general')}>General</Tab>
                <Tab isActive={isTabActive('profile')} onClick={() => setActiveTab('profile')}>Profile</Tab>
                <Tab isActive={isTabActive('stores')} onClick={() => setActiveTab('stores')}>Stores</Tab>
                <Tab isActive={isTabActive('users')} onClick={() => setActiveTab('users')}>Users</Tab>
                <Tab isActive={isTabActive('brands')} onClick={() => setActiveTab('brands')}>Brands</Tab>
                <Tab isActive={isTabActive('categories')} onClick={() => setActiveTab('categories')}>Categories</Tab>
                <Tab isActive={isTabActive('payments')} onClick={() => setActiveTab('payments')}>Payment types</Tab>
                <Tab isActive={isTabActive('discounts')} onClick={() => setActiveTab('discounts')}>Discounts</Tab>
                <Tab isActive={isTabActive('taxes')} onClick={() => setActiveTab('taxes')}>Taxes</Tab>
                <Tab isActive={isTabActive('departments')} onClick={() => setActiveTab('departments')}>Departments</Tab>
                <Tab isActive={isTabActive('list')} onClick={() => setActiveTab('list')}>Items list</Tab>
                <Tab isActive={isTabActive('terminals')} onClick={() => setActiveTab('terminals')}>Terminals</Tab>
              </TabNav>
              <TabContent isActive={isTabActive('general')}>
                <div className="inline-flex flex-col gap-5 justify-start">
                  <Button variant="success" onClick={() => {
                    clearCache();
                  }} className="mr-3 flex-grow-0" size="lg" disabled={isLoading}>
                    {isLoading ? 'Clearing...' : 'Refresh Cache'}
                  </Button>

                  <Switch checked={enableShortcuts} onChange={(value) => {
                    localforage.setItem('enableShortcuts', value.target.checked);
                    setEnableShortcuts(value.target.checked);
                    dispatch(shortcutAction(value.target.checked));
                  }}>Enable shortcuts?</Switch>

                  {enableShortcuts && (
                    <Switch checked={displayShortcuts} onChange={(value) => {
                      localforage.setItem('displayShortcuts', value.target.checked);
                      setDisplayShortcuts(value.target.checked);
                      dispatch(displayShortcutAction(value.target.checked));
                    }}>Display shortcut texts?</Switch>
                  )}

                  <Switch checked={enableTouch} onChange={(value) => {
                    localforage.setItem('enableTouch', value.target.checked);
                    setEnableTouch(value.target.checked);
                    dispatch(touchAction(value.target.checked));
                  }}>Enable Touch support?</Switch>
                </div>
                <div className="grid grid-cols-4 gap-5 mt-3">
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
              <TabContent isActive={isTabActive('profile')}>
                <div className="border flex justify-center items-center mb-5 border-primary-500 text-primary-500 w-full font-bold p-5">
                  Logged in as {user?.displayName}
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
              <TabContent isActive={isTabActive('terminals')}>
                <Terminals />
              </TabContent>
              <TabContent isActive={isTabActive('departments')}>
                <Departments />
              </TabContent>
              <TabContent isActive={isTabActive('list')}>
                <Items />
              </TabContent>
              <TabContent isActive={isTabActive('categories')}>
                <Categories/>
              </TabContent>
              <TabContent isActive={isTabActive('brands')}>
                <Brands/>
              </TabContent>
              <TabContent isActive={isTabActive('transfer')}>transfer inventory</TabContent>
              <TabContent isActive={isTabActive('close_inventory')}>close inventory</TabContent>
            </>
          )}
        />
      </Modal>
    </>
  );
};
