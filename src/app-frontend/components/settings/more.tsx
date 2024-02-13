import React, { FC, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../../../app-common/components/input/button";
import { Modal } from "../../../app-common/components/modal/modal";
import localforage from "../../../lib/localforage/localforage";
import { useDispatch, useSelector } from "react-redux";
import { getAuthorizedUser } from "../../../duck/auth/auth.selector";
import { Switch } from "../../../app-common/components/input/switch";
import { Tab, TabContent, TabControl, TabNav, } from "../../../app-common/components/tabs/tabs";
import { ReactSelect } from "../../../app-common/components/input/custom.react.select";
import { useLoadData } from "../../../api/hooks/use.load.data";
import { Stores } from "./stores/stores";
import { Users } from "./users/users";
import { PaymentTypes } from "./payment-types/payment.types";
import { DiscountTypes } from "./discounts/discount.types";
import { TaxTypes } from "./taxes/tax.types";
import { Terminals } from "./terminals/terminals";
import { Departments } from "./departments/departments";
import { Items } from "./items/items";
import { Categories } from "./categories/categories";
import { Brands } from "./brands/brands";
import { useMediaQuery } from "react-responsive";
import { message as AntMessage, Tooltip } from "antd";
import { getProgress } from "../../../duck/progress/progress.selector";
import { getStore } from "../../../duck/store/store.selector";
import { getTerminal } from "../../../duck/terminal/terminal.selector";
import { DynamicBarcodes } from "./dynamic-barcodes";
import { useAtom } from "jotai";
import { defaultData, defaultState } from "../../../store/jotai";

interface Props {
}

export const More: FC<Props> = ({}) => {
  const [appState, setAppState] = useAtom(defaultState);
  const [defaultOptions, setDefaultOptions] = useAtom(defaultData);
  const {
    defaultDiscount,
    defaultPaymentType,
    defaultTax,
    enableTouch,
  } = defaultOptions;
  const [modal, setModal] = useState(false);
  const [state, action] = useLoadData();
  const [messageApi, contextHolder] = AntMessage.useMessage();

  const dispatch = useDispatch();

  const user = useSelector(getAuthorizedUser);
  const store = useSelector(getStore);
  const terminal = useSelector(getTerminal);

  const progress = useSelector(getProgress);

  useEffect(() => {
    if( progress === "Done" ) {
      messageApi.open({
        key: "loading",
        type: "success",
        content: `${progress}`,
      });

      setTimeout(() => messageApi.destroy(), 1000);
    } else {
      messageApi.open({
        key: "loading",
        type: "loading",
        content: `Loading ${progress}`,
        duration: 120,
      });
    }
  }, [progress]);

  const [isLoading, setLoading] = useState(false);

  const clearCache = async () => {
    setLoading(true);
    await localforage.removeItem("list");
    await localforage.removeItem("deviceList");
    await localforage.removeItem("discountList");
    await localforage.removeItem("taxList");
    await localforage.removeItem("paymentTypesList");
    // await action.load();

    setLoading(false);

    window.location.reload();
  };

  const isMobile = useMediaQuery({
    query: "(max-width: 1224px)",
  });

  return (
    <>
      {contextHolder}
      <Tooltip title="Settings">
        <Button
          variant="secondary"
          iconButton
          size="lg"
          onClick={() => {
            setModal(true);
          }}
          tabIndex={-1}>
          <FontAwesomeIcon icon={faCog}/>
        </Button>
      </Tooltip>

      <Modal
        open={modal}
        onClose={() => {
          setModal(false);
        }}
        title="Settings"
        size="full"
        transparentContainer={false}>
        <TabControl
          defaultTab="profile"
          position={isMobile ? "top" : "left"}
          render={({ isTabActive, setActiveTab }) => (
            <>
              <TabNav position={isMobile ? "top" : "left"}>
                <Tab
                  isActive={isTabActive("profile")}
                  onClick={() => setActiveTab("profile")}>
                  Profile
                </Tab>
                <Tab
                  isActive={isTabActive("general")}
                  onClick={() => setActiveTab("general")}>
                  General
                </Tab>
                <Tab
                  isActive={isTabActive("stores")}
                  onClick={() => setActiveTab("stores")}>
                  Stores
                </Tab>
                <Tab
                  isActive={isTabActive("users")}
                  onClick={() => setActiveTab("users")}>
                  Users
                </Tab>
                <Tab
                  isActive={isTabActive("brands")}
                  onClick={() => setActiveTab("brands")}>
                  Brands
                </Tab>
                <Tab
                  isActive={isTabActive("categories")}
                  onClick={() => setActiveTab("categories")}>
                  Categories
                </Tab>
                <Tab
                  isActive={isTabActive("payments")}
                  onClick={() => setActiveTab("payments")}>
                  Payment types
                </Tab>
                <Tab
                  isActive={isTabActive("discounts")}
                  onClick={() => setActiveTab("discounts")}>
                  Discounts
                </Tab>
                <Tab
                  isActive={isTabActive("taxes")}
                  onClick={() => setActiveTab("taxes")}>
                  Taxes
                </Tab>
                <Tab
                  isActive={isTabActive("departments")}
                  onClick={() => setActiveTab("departments")}>
                  Departments
                </Tab>
                <Tab
                  isActive={isTabActive("list")}
                  onClick={() => setActiveTab("list")}>
                  Items list
                </Tab>
                <Tab
                  isActive={isTabActive("barcodes")}
                  onClick={() => setActiveTab("barcodes")}>
                  Barcodes
                </Tab>
                <Tab
                  isActive={isTabActive("terminals")}
                  onClick={() => setActiveTab("terminals")}>
                  Terminals
                </Tab>
              </TabNav>
              <TabContent isActive={isTabActive("general")}>
                <div className="inline-flex flex-col gap-5 justify-start">
                  <Button
                    variant="success"
                    onClick={() => {
                      clearCache();
                    }}
                    className="mr-3 flex-grow-0"
                    size="lg"
                    disabled={isLoading}>
                    {isLoading ? "Clearing..." : "Refresh Cache"}
                  </Button>

                  <Switch
                    checked={enableTouch}
                    onChange={(value) => {
                      setDefaultOptions((prev) => ({
                        ...prev,
                        enableTouch: value.target.checked,
                      }));
                    }}>
                    Enable Touch support? <span
                    className="badge rounded-full bg-primary-500 text-primary-100 p-1 px-2 uppercase text-xs">Experimental</span>
                  </Switch>
                </div>
                <h3 className="text-xl my-3">Default options</h3>
                <div className="grid grid-cols-4 gap-5 mt-3">
                  <div>
                    <label>Tax</label>
                    <ReactSelect
                      options={state.taxList.list.map((item) => {
                        return {
                          label: item.name + " " + item.rate,
                          value: JSON.stringify(item),
                        };
                      })}
                      isClearable
                      onChange={(value: any) => {
                        if( value ) {
                          setAppState((prev) => ({
                            ...prev,
                            tax: JSON.parse(value.value),
                          }));

                          setDefaultOptions((prev) => ({
                            ...prev,
                            defaultTax: JSON.parse(value.value),
                          }));
                        } else {
                          setAppState((prev) => ({
                            ...prev,
                            tax: undefined,
                          }));

                          setDefaultOptions((prev) => ({
                            ...prev,
                            defaultTax: undefined,
                          }));
                        }
                      }}
                      value={
                        defaultTax
                          ? {
                            label: defaultTax?.name + " " + defaultTax?.rate,
                            value: JSON.stringify(defaultTax),
                          }
                          : null
                      }
                    />
                  </div>
                  <div>
                    <label>Discount</label>
                    <ReactSelect
                      options={state.discountList.list.map((item) => {
                        return {
                          label: item.name,
                          value: JSON.stringify(item),
                        };
                      })}
                      isClearable
                      onChange={(value: any) => {
                        if( value ) {
                          setAppState((prev) => ({
                            ...prev,
                            discount: JSON.parse(value.value),
                          }));

                          setDefaultOptions((prev) => ({
                            ...prev,
                            defaultDiscount: JSON.parse(value.value),
                          }));
                        } else {
                          setAppState((prev) => ({
                            ...prev,
                            discount: undefined,
                          }));

                          setDefaultOptions((prev) => ({
                            ...prev,
                            defaultDiscount: undefined,
                          }));
                        }
                      }}
                      value={
                        defaultDiscount
                          ? {
                            label: defaultDiscount?.name,
                            value: JSON.stringify(defaultDiscount),
                          }
                          : null
                      }
                    />
                  </div>
                  <div>
                    <label>Payment type</label>
                    <ReactSelect
                      options={state.paymentTypesList.list.map((item) => {
                        return {
                          label: item.name,
                          value: JSON.stringify(item),
                        };
                      })}
                      isClearable
                      onChange={(value: any) => {
                        if( value ) {
                          setDefaultOptions((prev) => ({
                            ...prev,
                            defaultPaymentType: JSON.parse(value.value),
                          }));
                        } else {
                          setDefaultOptions((prev) => ({
                            ...prev,
                            defaultPaymentType: undefined,
                          }));
                        }
                      }}
                      value={
                        defaultPaymentType
                          ? {
                            label: defaultPaymentType?.name,
                            value: JSON.stringify(defaultPaymentType),
                          }
                          : null
                      }
                    />
                  </div>
                  <div>
                    {/* <h3 className="text-xl">Set Default Printer</h3>
                    <ReactSelect
                      options={state.deviceList.list.map((item) => {
                        return {
                          label: item.name,
                          value: JSON.stringify(item),
                        };
                      })}
                      isClearable
                      onChange={(value: any) => {
                        if (value) {
                          localforage.setItem(
                            "defaultDevice",
                            JSON.parse(value.value)
                          );
                        } else {
                          localforage.removeItem("defaultDevice");
                          setDefaultDevice(undefined);
                        }
                      }}
                      value={defaultDevice}
                    /> */}
                  </div>
                </div>
              </TabContent>
              <TabContent isActive={isTabActive("profile")}>
                <table className="table">
                  <tbody>
                  <tr>
                    <th className="text-end">User</th>
                    <td>{user?.displayName}</td>
                  </tr>
                  <tr>
                    <th className="text-end">Store</th>
                    <td>{store?.name}</td>
                  </tr>
                  <tr>
                    <th className="text-end">Terminal</th>
                    <td>{terminal?.code}</td>
                  </tr>
                  </tbody>
                </table>
              </TabContent>
              <TabContent isActive={isTabActive("payments")}>
                <PaymentTypes/>
              </TabContent>
              <TabContent isActive={isTabActive("discounts")}>
                <DiscountTypes/>
              </TabContent>
              <TabContent isActive={isTabActive("taxes")}>
                <TaxTypes/>
              </TabContent>
              <TabContent isActive={isTabActive("stores")}>
                <Stores/>
              </TabContent>
              <TabContent isActive={isTabActive("users")}>
                <Users/>
              </TabContent>
              <TabContent isActive={isTabActive("terminals")}>
                <Terminals/>
              </TabContent>
              <TabContent isActive={isTabActive("departments")}>
                <Departments/>
              </TabContent>
              <TabContent isActive={isTabActive("list")}>
                <Items/>
              </TabContent>
              <TabContent isActive={isTabActive("barcodes")}>
                <DynamicBarcodes/>
              </TabContent>
              <TabContent isActive={isTabActive("categories")}>
                <Categories/>
              </TabContent>
              <TabContent isActive={isTabActive("brands")}>
                <Brands/>
              </TabContent>
            </>
          )}
        />
      </Modal>
    </>
  );
};
