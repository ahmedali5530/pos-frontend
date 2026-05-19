import React, {useMemo, useState} from "react";
import {Product} from "../../../api/model/product";
import {useAtom} from "jotai";
import {defaultState} from "../../../store/jotai";
import {Category} from "../../../api/model/category";
import {getRealProductPrice} from "../../containers/dashboard/pos";
import {Button} from "../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {toRecordId} from "../../../api/model/common";

interface SearchInlineProps {
  items: Product[];
  addItem: (item: Product, quantity: number, price?: number) => void;
  onClick?: () => void;
}

export const SearchInline = (props: SearchInlineProps) => {
  const {items, addItem} = props;

  const [{selectedCategory, quantity}, setAppState] = useAtom(defaultState);

  const categories: Category[] = useMemo(() => {
    const cats = new Set();
    items.forEach(item => {
      item.categories.forEach(cat => {
        cats.add(cat)
      })
    })

    return Array.from(cats.values());
  }, [items]);

  const categoryItems = useMemo(() => {
    if(!selectedCategory){
      return [];
    }

    return items.filter((item) => {
      if (item?.categories?.length > 0) {
        return item.categories.filter((c) => toRecordId(selectedCategory?.id).toString() === toRecordId(c.id).toString()).length > 0
      } else {
        return true;
      }
    });
  }, [items, selectedCategory])

  return (
    <>
      {!selectedCategory && (
        <>
          <div className="mb-5 text-xl">
            Choose a category
          </div>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((item, index) => (
              <div
                key={index}
                className="flex p-5 items-center justify-center border shadow-lg active:shadow-none rounded-lg"
                role="button"
                onClick={() => {
                  setAppState(prev => ({
                    ...prev,
                    selectedCategory: item
                  }))
                }}
              >
                {item.name}
              </div>
            ))}
          </div>
        </>
      )}

      {selectedCategory && (
        <>
          <div className="flex items-center gap-3 mb-5">
            <Button
              iconButton
              onClick={() => {
                setAppState(prev => ({
                  ...prev,
                  selectedCategory: undefined
                }))
              }}
              size="lg"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </Button>
            <span className="xl">{selectedCategory.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {categoryItems.map((item, index) => (
              <div
                key={index}
                className="flex p-5 items-center justify-center border shadow-lg active:shadow-none rounded-lg"
                role="button"
                onClick={() => {
                  addItem(item, quantity, getRealProductPrice(item));

                }}
              >
                {item.name}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};
