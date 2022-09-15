import {Button} from "../../button";
import {Modal} from "../../modal";
import React, {FC, PropsWithChildren, useEffect, useState} from "react";
import {HomeProps} from "../../../../api/hooks/use.load.data";
import localforage from "localforage";
import {Brand} from "../../../../api/model/brand";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle} from "@fortawesome/free-solid-svg-icons";

interface SaleBrandsProps extends PropsWithChildren{
  brands:  {[key: string]: Brand} ;
  setBrands: (brands:  {[key: string]: Brand} ) => void;
}

export const SaleBrands: FC<SaleBrandsProps> = ({
  children, brands, setBrands
}) => {
  const [modal, setModal] = useState(false);
  const [list, setList] = useState<Brand[]>([]);

  const loadBrandsList = async () => {
    const list: HomeProps['list']|null = await localforage.getItem('list');
    let brands: {[key: string]: Brand} = {};
    if(list !== null) {
      list.list.forEach(item => {
        item.brands.forEach(brand => {
          brands[brand.id] = brand;
        });
      });
    }

    setList(Object.values(brands));
  };

  useEffect(() => {
    loadBrandsList();
  }, [modal]);

  const addRemoveBrand = (brand: Brand) => {
    const newBrand = {...brands};

    if(newBrand[brand.id] !== undefined){
      delete newBrand[brand.id];
    }else {
      newBrand[brand.id] = brand;
    }

    setBrands(newBrand);
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
        {children || 'Brands'}
        {Object.values(brands).length > 0 && (
          <span className="ml-3 bg-purple-500 text-white h-5 w-5 rounded-full text-sm font-bold">{Object.values(brands).length}</span>
        )}
      </Button>
      <Modal open={modal} onClose={() => {
        setModal(false);
      }} title="Filter by brands">
        <div className="flex justify-center items-center gap-5">
          {list.map((brand, index) => (
            <Button variant="primary"
                    key={index}
                    onClick={() => addRemoveBrand(brand)}
                    className="mr-3 mb-3 h-[100px_!important] min-w-[150px] relative"
            >
              {brand.name}
              {!!brands[brand.id] && (
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
