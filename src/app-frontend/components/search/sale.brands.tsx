import {Button} from "../../../app-common/components/input/button";
import {Modal} from "../../../app-common/components/modal/modal";
import React, {FC, PropsWithChildren, useEffect, useState} from "react";
import {HomeProps} from "../../../api/hooks/use.load.data";
import localforage from "localforage";
import {Brand} from "../../../api/model/brand";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle} from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "antd";
import {toRecordId} from "../../../api/model/common";

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
    const l: HomeProps['list']|null = await localforage.getItem('list');
    let brands: {[key: string]: Brand} = {};

    if(l !== null) {
      l?.list.forEach(item => {
        item.brands.forEach(brand => {
          brands[toRecordId(brand.id).toString()] = brand;
        });
      });
    }

    setList(Object.values(brands));
  };

  useEffect(() => {
    if(modal) {
      loadBrandsList();
    }
  }, [modal]);

  const toggleBrand = (brand: Brand) => {
    const newBrand = {...brands};

    if(newBrand[toRecordId(brand.id).toString()] !== undefined){
      delete newBrand[toRecordId(brand.id).toString()];
    }else {
      newBrand[toRecordId(brand.id).toString()] = brand;
    }

    setBrands(newBrand);
  };

  return (
    <>
      <Tooltip title="Filter by Brands">
        <Button
          className="block min-w-[48px]" variant="primary"
          onClick={() => {
            setModal(true);
          }}
          type="button"
          size="lg"
        >
          {children || 'Brands'}
          {Object.values(brands).length > 0 && (
            <span className="inline-block shrink-0 ml-1 bg-primary-500 text-white h-5 w-5 rounded-full text-sm font-bold">{Object.values(brands).length}</span>
          )}
        </Button>
      </Tooltip>
      <Modal
        open={modal}
        onClose={() => {
          setModal(false);
        }}
        title="Filter by brands"
        shouldCloseOnOverlayClick={true}
      >
        <div className="flex justify-center items-center gap-5">
          {list.map((brand, index) => (
            <Button variant="primary"
                    key={index}
                    onClick={() => toggleBrand(brand)}
                    className="mr-3 mb-3 h-[100px_!important] min-w-[150px] relative"
            >
              {brand.name}
              {!!brands[toRecordId(brand.id).toString()] && (
                <span className="absolute top-1 right-1">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-primary-500" size="lg" />
                </span>
              )}
            </Button>
          ))}
        </div>
      </Modal>
    </>
  );
};
