import {Button} from "../../button";
import React, {FC, PropsWithChildren, useState} from "react";
import {Modal} from "../../modal";
import {Tab, TabContent, TabControl, TabNav} from "../../../../app-common/components/tabs/tabs";
import {Suppliers} from "./suppliers";
import {Purchase as CreatePurchase} from "./purchase";
import {PurchaseOrders} from "./purchase-orders/purchase.orders";
import {PreviousPurchases} from "./previous.purchases";

interface Props extends PropsWithChildren{
}

export const PurchaseTabs: FC<Props> = ({
  children
}) => {
  const [modal, setModal] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => {
        setModal(true);
      }} size="lg">
        {children || 'Inventory'}
      </Button>

      <Modal open={modal} onClose={() => {
        setModal(false);
      }} title={'Inventory'} size="full" transparentContainer={false}>
        <TabControl
          defaultTab="purchase"
          render={({isTabActive, setActiveTab, activeTab}) => (
            <>
              <TabNav>
                <Tab isActive={isTabActive('purchase')} onClick={() => setActiveTab('purchase')}>Purchase</Tab>
                <Tab isActive={isTabActive('previous')} onClick={() => setActiveTab('previous')}>Previous Purchases</Tab>
                <Tab isActive={isTabActive('purchase_orders')} onClick={() => setActiveTab('purchase_orders')}>Purchase Orders</Tab>
                <Tab isActive={isTabActive('suppliers')} onClick={() => setActiveTab('suppliers')}>Suppliers</Tab>
              </TabNav>
              <TabContent isActive={isTabActive('purchase')}>
                <CreatePurchase />
              </TabContent>
              <TabContent isActive={isTabActive('previous')}>
                <PreviousPurchases />
              </TabContent>
              <TabContent isActive={isTabActive('purchase_orders')}>
                <PurchaseOrders />
              </TabContent>
              <TabContent isActive={isTabActive('suppliers')}>
                <Suppliers />
              </TabContent>
            </>
          )}
        />
      </Modal>
    </>
  );
}
