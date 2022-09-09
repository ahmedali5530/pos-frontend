import {Button} from "../button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faList} from "@fortawesome/free-solid-svg-icons";
import {Modal} from "../modal";
import React, {useState} from "react";
import {Tab, TabContent, TabControl, TabNav} from "../../../app-common/components/tabs/tabs";
import {Categories} from "./categories";
import {Suppliers} from "./suppliers";
import {Brands} from "./brands";
import {Items} from "./items";
import {CreateItem} from "./items.create";
import {Product} from "../../../api/model/product";

export const ItemsTabs = () => {
  const [modal, setModal] = useState(false);
  const [operation, setOperation] = useState('create');
  const [row, setRow] = useState<Product>();

  return (
    <>
      <Button variant="primary" size="lg" onClick={() => {
        setModal(true);
      }} title="Items"><FontAwesomeIcon icon={faList} className="mr-3"/> Items</Button>

      <Modal shouldCloseOnEsc={false} open={modal} onClose={() => {
        setModal(false);
      }} title="Items">
        <TabControl
          defaultTab="list"
          render={({isTabActive, setActiveTab, activeTab}) => (
            <>
              <TabNav>
                <Tab isActive={isTabActive('list')} onClick={() => setActiveTab('list')}>Items list</Tab>
                <Tab isActive={isTabActive('form')}
                     onClick={() => setActiveTab('form')}>{operation === 'create' ? 'Create item' : 'Update item'}</Tab>
                <Tab isActive={isTabActive('categories')} onClick={() => setActiveTab('categories')}>Categories</Tab>
                <Tab isActive={isTabActive('suppliers')} onClick={() => setActiveTab('suppliers')}>Suppliers</Tab>
                <Tab isActive={isTabActive('brands')} onClick={() => setActiveTab('brands')}>Brands</Tab>
                <Tab isActive={isTabActive('purchase')} onClick={() => setActiveTab('purchase')}>Purchase</Tab>
                <Tab isActive={isTabActive('transfer')} onClick={() => setActiveTab('transfer')}>Transfer Inventory</Tab>
                <Tab isActive={isTabActive('close_inventory')} onClick={() => setActiveTab('close_inventory')}>Close inventory</Tab>
              </TabNav>
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
