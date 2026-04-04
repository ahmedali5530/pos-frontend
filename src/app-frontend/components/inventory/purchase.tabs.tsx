import { Button } from "../../../app-common/components/input/button";
import React, { FC, PropsWithChildren, useState } from "react";
import { Modal } from "../../../app-common/components/modal/modal";
import {
  Tab,
  TabContent,
  TabControl,
  TabNav,
} from "../../../app-common/components/tabs/tabs";
import { Suppliers } from "./supplier/suppliers";
import { PurchaseOrders } from "./purchase-orders/purchase.orders";
import { Purchases } from "./purchase/purchases";
import { PurchaseReturns } from "./purchase-returns/purchase.returns";
import {InventoryDetails} from "./inventory";
import {Wastes} from "./waste/wastes";
import {useMediaQuery} from "react-responsive";

interface Props extends PropsWithChildren {}

export const PurchaseTabs: FC<Props> = ({ children }) => {
  const [modal, setModal] = useState(false);

  const isMobile = useMediaQuery({
    query: "(max-width: 1224px)",
  });

  const sidebarItems = [{
    key: 'inventory',
    title: 'Current inventory',
    component: <InventoryDetails />
  }, {
    key: 'purchases',
    title: 'Purchases',
    component: <Purchases />
  }, {
    key: 'purchase_returns',
    title: 'Purchase returns',
    component: <PurchaseReturns />
  }, {
    key: 'purchase_orders',
    title: 'Purchase orders',
    component: <PurchaseOrders />
  }, {
    key: 'wastes',
    title: 'Wastes',
    component: <Wastes />
  }, {
    key: 'suppliers',
    title: 'Suppliers',
    component: <Suppliers />
  }];

  return (
    <>
      <Button
        variant="primary"
        onClick={() => {
          setModal(true);
        }}
        size="lg"
        tabIndex={-1}>
        {children || "Inventory"}
      </Button>

      <Modal
        open={modal}
        onClose={() => {
          setModal(false);
        }}
        title={"Inventory"}
        size="full"
        transparentContainer={false}>
        <TabControl
          defaultTab="inventory"
          position={isMobile ? "top" : "left"}
          render={({ isTabActive, setActiveTab }) => (
            <>
              <TabNav position={isMobile ? "top" : "left"}>
                {sidebarItems.map(item => (
                  <Tab
                    key={item.key}
                    isActive={isTabActive(item.key)}
                    onClick={() => setActiveTab(item.key)}>
                    {item.title}
                  </Tab>
                ))}
              </TabNav>

              {sidebarItems.map(item => (
                <TabContent
                  holdState={false}
                  key={item.key}
                  isActive={isTabActive(item.key)}
                >
                  {item.component}
                </TabContent>
              ))}
            </>
          )}
        />
      </Modal>
    </>
  );
};
