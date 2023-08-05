import {Button} from "../../../app-common/components/input/button";
import {Modal} from "../../../app-common/components/modal/modal";
import React, {FC, PropsWithChildren, useEffect, useState} from "react";
import {HomeProps} from "../../../api/hooks/use.load.data";
import localforage from "localforage";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle} from "@fortawesome/free-solid-svg-icons";
import {Category} from "../../../api/model/category";
import { Tooltip } from "antd";

interface SaleCategoriesProps extends PropsWithChildren{
  categories:  {[key: string]: Category} ;
  setCategories: (categories:  {[key: string]: Category} ) => void;
}

export const SaleCategories: FC<SaleCategoriesProps> = ({
  children, categories, setCategories
}) => {
  const [modal, setModal] = useState(false);
  const [list, setList] = useState<Category[]>([]);

  const loadCategoriesList = async () => {
    const list: HomeProps['list']|null = await localforage.getItem('list');
    let categories: {[key: string]: Category} = {};
    if(list !== null) {
      list.list.forEach(item => {
        item.categories.forEach(category => {
          categories[category.id] = category;
        });
      });
    }

    setList(Object.values(categories));
  };

  useEffect(() => {
    loadCategoriesList();
  }, [modal]);

  const addRemoveCategory = (category: Category) => {
    const newCategory = {...categories};

    if(newCategory[category.id] !== undefined){
      delete newCategory[category.id];
    }else {
      newCategory[category.id] = category;
    }

    setCategories(newCategory);
  };

  return (
    <>
      <Tooltip title="Filter by Categories">
        <Button
          className="block min-w-[48px]" variant="primary"
          onClick={() => {
            setModal(true);
          }}
          type="button"
          size="lg"
        >
          {children || 'Categories'}
          {Object.values(categories).length > 0 && (
            <span className="shrink-0 ml-1 bg-primary-500 text-white h-5 w-5 rounded-full text-sm font-bold">{Object.values(categories).length}</span>
          )}
        </Button>
      </Tooltip>
      <Modal open={modal} onClose={() => {
        setModal(false);
      }} title="Filter by categories">
        <div className="flex justify-center items-center gap-5">
          {list.map((category, index) => (
            <Button variant="primary"
                    key={index}
                    onClick={() => addRemoveCategory(category)}
                    className="mr-3 mb-3 h-[100px_!important] min-w-[150px] relative"
            >
              {category.name}
              {!!categories[category.id] && (
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
