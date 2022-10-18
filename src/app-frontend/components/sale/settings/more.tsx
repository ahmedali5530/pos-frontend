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
import {touchAction} from "../../../../duck/touch/touch.action";
import {Terminals} from "./terminals";
import {Departments} from "./departments";
import {Items} from "./items/items";
import {CreateItem} from "./items/items.create";
import {Categories} from "./items/categories";
import {Suppliers} from "./items/suppliers";
import {Brands} from "./items/brands";
import {Product} from "../../../../api/model/product";

interface Props{
  setTax: (data?: Tax) => void;
  setDiscount: (data?: Discount) => void;
}

export const More: FC<Props> = ({
  setTax, setDiscount
}) => {
  const [modal, setModal] = useState(false);
  const [state, action] = useLoadData();
  const [operation, setOperation] = useState('create');
  const [row, setRow] = useState<Product>();

  const dispatch = useDispatch();

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

    localforage.getItem('displayShortcuts').then((data: any) => {
      if(data){
        setDisplayShortcuts(data);
        dispatch(shortcutAction(data));
      }else{
        setDisplayShortcuts(false);
        dispatch(shortcutAction(false));
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
                <Tab isActive={isTabActive('payments')} onClick={() => setActiveTab('payments')}>Payment types</Tab>
                <Tab isActive={isTabActive('discounts')} onClick={() => setActiveTab('discounts')}>Discounts</Tab>
                <Tab isActive={isTabActive('taxes')} onClick={() => setActiveTab('taxes')}>Taxes</Tab>
                <Tab isActive={isTabActive('stores')} onClick={() => setActiveTab('stores')}>Stores</Tab>
                <Tab isActive={isTabActive('terminals')} onClick={() => setActiveTab('terminals')}>Terminals</Tab>
                <Tab isActive={isTabActive('departments')} onClick={() => setActiveTab('departments')}>Departments</Tab>
                <Tab isActive={isTabActive('list')} onClick={() => setActiveTab('list')}>Items list</Tab>
                <Tab isActive={isTabActive('form')}
                     onClick={() => setActiveTab('form')}>{operation === 'create' ? 'Create item' : 'Update item'}</Tab>
                <Tab isActive={isTabActive('categories')} onClick={() => setActiveTab('categories')}>Categories</Tab>
                <Tab isActive={isTabActive('suppliers')} onClick={() => setActiveTab('suppliers')}>Suppliers</Tab>
                <Tab isActive={isTabActive('brands')} onClick={() => setActiveTab('brands')}>Brands</Tab>
                {/*<Tab isActive={isTabActive('purchase')} onClick={() => setActiveTab('purchase')}>Purchase</Tab>
                <Tab isActive={isTabActive('transfer')} onClick={() => setActiveTab('transfer')}>Transfer Inventory</Tab>
                <Tab isActive={isTabActive('close_inventory')} onClick={() => setActiveTab('close_inventory')}>Close inventory</Tab>*/}
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

                  <Switch checked={enableTouch} onChange={(value) => {
                    localforage.setItem('enableTouch', value.target.checked);
                    setEnableTouch(value.target.checked);
                    dispatch(touchAction(value.target.checked));
                  }}>Enable Touch?</Switch>
                </div>
                <div className="grid grid-cols-6 gap-5">
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
                <div className="border flex justify-center items-center mb-5 border-blue-500 text-blue-500 w-full font-bold p-5">
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
                <Items setActiveTab={setActiveTab} setOperation={setOperation} setRow={setRow}/>
              </TabContent>
              <TabContent isActive={isTabActive('form')}>
                <CreateItem
                  setActiveTab={setActiveTab}
                  operation={operation}
                  setOperation={setOperation}
                  row={row}
                  setRow={setRow}
                />
              </TabContent>
              <TabContent isActive={isTabActive('categories')}>
                <Categories/>
              </TabContent>
              <TabContent isActive={isTabActive('suppliers')}>
                <Suppliers/>
              </TabContent>
              <TabContent isActive={isTabActive('brands')}>
                <Brands/>
              </TabContent>
              <TabContent isActive={isTabActive('purchase')}>purchases</TabContent>
              <TabContent isActive={isTabActive('transfer')}>transfer inventory</TabContent>
              <TabContent isActive={isTabActive('close_inventory')}>close inventory</TabContent>
            </>
          )}
        />
      </Modal>
    </>
  );
};
