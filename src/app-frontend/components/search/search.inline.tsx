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
import classNames from "classnames";
import ScrollContainer from "react-indiana-drag-scroll";

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
      return items;
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
      <ScrollContainer>
        <div className="flex flex-row gap-3">
          {categories.map((item, index) => (
            <Button
              key={index}
              className={classNames(
                "btn",
                selectedCategory?.id === item.id ? "btn-primary active" : ""
              )}
              size="lg"
              role="button"
              onClick={() => {
                if(selectedCategory?.id === item.id) {
                  setAppState(prev => ({
                    ...prev,
                    selectedCategory: undefined
                  }))
                } else {
                  setAppState(prev => ({
                    ...prev,
                    selectedCategory: item
                  }))
                }
              }}
            >
              {item.name}
            </Button>
          ))}
        </div>
      </ScrollContainer>

      <div className="mt-3">
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
      </div>
    </>
  );
};
