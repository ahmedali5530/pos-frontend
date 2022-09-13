import {Button} from "../button";
import {Modal} from "../modal";
import React, {FC, PropsWithChildren, useEffect, useState} from "react";
import {HomeProps} from "../../../api/hooks/use.load.data";
import localforage from "localforage";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle} from "@fortawesome/free-solid-svg-icons";
import {Supplier} from "../../../api/model/supplier";

interface SaleSuppliersProps extends PropsWithChildren{
  suppliers:  {[key: string]: Supplier} ;
  setSuppliers: (suppliers:  {[key: string]: Supplier} ) => void;
}

export const SaleSuppliers: FC<SaleSuppliersProps> = ({
  children, suppliers, setSuppliers
}) => {
  const [modal, setModal] = useState(false);
  const [list, setList] = useState<Supplier[]>([]);

  const loadSuppliersList = async () => {
    const list: HomeProps['list']|null = await localforage.getItem('list');
    let suppliers: {[key: string]: Supplier} = {};
    if(list !== null) {
      list.list.forEach(item => {
        item.suppliers.forEach(category => {
          suppliers[category.id] = category;
        });
      });
    }

    setList(Object.values(suppliers));
  };

  useEffect(() => {
    loadSuppliersList();
  }, [modal]);

  const addRemoveSupplier = (category: Supplier) => {
    const newSupplier = {...suppliers};

    if(newSupplier[category.id] !== undefined){
      delete newSupplier[category.id];
    }else {
      newSupplier[category.id] = category;
    }

    setSuppliers(newSupplier);
  };

  return (
    <>
      <Button
        className="block w-full" variant="primary"
        onClick={() => {
          setModal(true);
        }}
        type="button"
      >
        {children || 'Suppliers'}
        {Object.values(suppliers).length > 0 && (
          <span className="ml-3 bg-purple-500 text-white h-5 w-5 rounded-full text-sm font-bold">{Object.values(suppliers).length}</span>
        )}
      </Button>
      <Modal open={modal} onClose={() => {
        setModal(false);
      }} title="Filter by suppliers">
        <div className="flex justify-center items-center gap-5">
          {list.map((category, index) => (
            <Button variant="primary"
                    key={index}
                    onClick={() => addRemoveSupplier(category)}
                    className="mr-3 mb-3 h-[100px_!important] min-w-[150px] relative"
            >
              {category.name}
              {!!suppliers[category.id] && (
                <span className="absolute top-1 right-1">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-purple-500" size="lg" />
                </span>
              )}
            </Button>
          ))}
        </div>
      </Modal>
    </>
  );
};
