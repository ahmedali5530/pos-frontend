import React, {FC, useState} from "react";
import {Button} from "../../../app-common/components/input/button";
import {Modal} from "../../../app-common/components/modal/modal";
import {Tab, TabContent, TabControl, TabNav,} from "../../../app-common/components/tabs/tabs";
import {Stores} from "./stores/stores";
import {Users} from "./users/users";
import {PaymentTypes} from "./payment-types/payment.types";
import {DiscountTypes} from "./discounts/discount.types";
import {TaxTypes} from "./taxes/tax.types";
import {Terminals} from "./terminals/terminals";
import {Departments} from "./departments/departments";
import {Items} from "./items/items";
import {Categories} from "./categories/categories";
import {Brands} from "./brands/brands";
import {useMediaQuery} from "react-responsive";
import {message as AntMessage, Tooltip} from "antd";
import {Printers} from "./printers";
import {PrintSettings} from "./prints";

interface Props {
}

export const More: FC<Props> = ({}) => {
  const [modal, setModal] = useState(false);
  const [, contextHolder] = AntMessage.useMessage();

  const isMobile = useMediaQuery({
    query: "(max-width: 1224px)",
  });

  const sidebarItems = [
    {
      key: 'stores',
      title: 'Stores',
      component: <Stores/>
    }, {
      key: 'users',
      title: 'Users',
      component: <Users/>
    }, {
      key: 'brands',
      title: 'Brands',
      component: <Brands/>
    }, {
      key: 'categories',
      title: 'Categories',
      component: <Categories/>
    }, {
      key: 'departments',
      title: 'Departments',
      component: <Departments/>
    }, {
      key: 'list',
      title: 'Items list',
      component: <Items/>
    },
    {
      key: 'payments',
      title: 'Payment types',
      component: <PaymentTypes/>
    }, {
      key: 'discounts',
      title: 'Discount types',
      component: <DiscountTypes/>
    }, {
      key: 'taxes',
      title: 'Taxes',
      component: <TaxTypes/>
    }, {
      key: 'terminals',
      title: 'Terminals',
      component: <Terminals/>
    }, {
      key: 'printers',
      title: 'Printers',
      component: <Printers/>
    }, {
      key: 'print_settings',
      title: 'Print settings',
      component: <PrintSettings/>
    }
  ];

  return (
    <>
      {contextHolder}
      <Tooltip title="Control panel">
        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            setModal(true);
          }}
          tabIndex={-1}
        >
          Control panel
        </Button>
      </Tooltip>

      {modal && (
        <Modal
          open={modal}
          onClose={() => {
            setModal(false);
          }}
          title="Control panel"
          size="full"
          transparentContainer={false}>
          <TabControl
            defaultTab="stores"
            position={isMobile ? "top" : "left"}
            render={({isTabActive, setActiveTab}) => (
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
      )}
    </>
  );
};
