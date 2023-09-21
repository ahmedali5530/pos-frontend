import React, {useEffect, useMemo, useState} from "react";
import {CartItem} from "../../../api/model/cart.item";
import _ from "lodash";
import {scrollToBottom} from "../../containers/dashboard/pos";
import {Modal} from "../../../app-common/components/modal/modal";
import {Controller, useForm} from "react-hook-form";
import {Input} from "../../../app-common/components/input/input";
import {DiscountRate} from "../../../api/model/discount";
import {ReactSelect} from "../../../app-common/components/input/custom.react.select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faTrash } from "@fortawesome/free-solid-svg-icons";

interface CartControlsProps{
  added: CartItem[];
  setAdded: (items: CartItem[]) => void;
  containerRef: HTMLDivElement|null;
}

export const CartControls = ({
  added, setAdded, containerRef
}: CartControlsProps) => {
  const checkedCartItems = useMemo(() => {
    return added.filter(item => item.checked);
  }, [added]);

  const voidCartItems = () => {
    let copyAdded = [...added];
    if(checkedCartItems.length > 0) {
      copyAdded = copyAdded.filter(item => !checkedCartItems.includes(item));
    }else{
      //remove last item
      copyAdded.pop();
    }

    setAdded(copyAdded);

    scrollToBottom(containerRef);
  }

  const copyCartItems = () => {
    let newItems = _.concat(added, checkedCartItems);

    if(checkedCartItems.length === 0){
      //copy last item
      newItems = _.concat(added, [added[added.length - 1]]);
    }

    //uncheck all the items
    newItems = newItems.map(item => {
      item.checked = false;

      return item;
    });

    setAdded(JSON.parse(JSON.stringify(newItems)));

    scrollToBottom(containerRef);
  }

  const [qtyModal, setQtyModal] = useState(false);
  const {handleSubmit, control, reset} = useForm();
  const updateQuantity = (values: any) => {
    let newItems = _.concat(added);

    let checkedItems = _.concat(checkedCartItems);

    if(checkedItems.length === 0){
      //copy last item
      checkedItems = [added[added.length - 1]];
    }

    newItems = newItems.map(item => {
      if(checkedItems.find(checkedItem => checkedItem === item)){
        item.checked = false;
        item.quantity = values.quantity;
      }

      return item;
    });

    // set new items with updated quantity
    setAdded(JSON.parse(JSON.stringify(newItems)));

    // close the modal
    setQtyModal(false);
    reset({
      quantity: 1
    });
  }

  const openDiscount = () => {
    setDiscModal(true);

    resetDiscount({
      discount: 0,
      discountType: {label: DiscountRate['RATE_FIXED'], value: DiscountRate['RATE_FIXED']}
    })
  }
  const [discModal, setDiscModal] = useState(false);
  const {handleSubmit: handleSubmitDiscount, control: controlDiscount, reset: resetDiscount} = useForm();
  const updateDiscount = (values: any) => {
    let newItems = _.concat(added);
    let checkedItems = _.concat(checkedCartItems);

    if(checkedItems.length === 0){
      //copy last item
      checkedItems = [added[added.length - 1]];
    }

    newItems = newItems.map(item => {
      if(checkedItems.find(checkedItem => checkedItem === item)){
        item.checked = false;
        if(values.discountType.value === DiscountRate['RATE_FIXED']) {
          item.discount = values.discount;
        }else{
          item.discount = item.price * values.discount / 100;
        }

        item.discountIncluded = true;
      }

      return item;
    });

    // set new items with updated quantity
    setAdded(JSON.parse(JSON.stringify(newItems)));

    // close the modal
    setDiscModal(false);
  }

  const toggleTax = () => {
    let newItems = _.concat(added);
    let checkedItems = _.concat(checkedCartItems);

    if(checkedItems.length === 0){
      //copy last item
      checkedItems = [added[added.length - 1]];
    }

    newItems = newItems.map(item => {
      if(checkedItems.find(checkedItem => checkedItem === item)){
        item.checked = false;
          item.taxIncluded = !item.taxIncluded;
      }

      return item;
    });

    // set new items with updated info
    setAdded(JSON.parse(JSON.stringify(newItems)));
  }

  return (
    <>
      <div className="p-3 border-b flex gap-3 justify-end bg-white">
        <button tabIndex={-1} disabled={added.length === 0} type="button" className="btn btn-danger lg btn-square" onClick={voidCartItems}>
          <FontAwesomeIcon icon={faTrash} />
        </button>
        <button tabIndex={-1} disabled={added.length === 0} type="button" className="btn btn-secondary lg btn-square" onClick={copyCartItems}>
          <FontAwesomeIcon icon={faCopy} />
        </button>
        <button tabIndex={-1} disabled={added.length === 0} type="button" className="btn btn-secondary lg" onClick={() => setQtyModal(true) }>QTY</button>
        <button tabIndex={-1} disabled={added.length === 0} type="button" className="btn btn-secondary lg" onClick={openDiscount}>Disc.</button>
        <button tabIndex={-1} disabled={added.length === 0} type="button" className="btn btn-secondary lg" onClick={toggleTax}>Toggle Tax</button>
      </div>

      <Modal open={qtyModal} title="Update quantity" size="sm" onClose={() => setQtyModal(false)}>
        <form onSubmit={handleSubmit(updateQuantity)}>
          <div className="mb-3">
            <label htmlFor="qty">Quantity</label>
            <Controller
              name="quantity"
              render={(props) => (
                <Input
                  type="number"
                  className="input w-full"
                  value={props.field.value}
                  onChange={props.field.onChange}
                  selectable={true}
                  autoFocus={true}
                />
              )}
              control={control}
              defaultValue={1}
            />

          </div>
          <button className="btn btn-primary" type="submit">Update Quantity</button>
        </form>
      </Modal>

      <Modal open={discModal} title="Update discount" size="sm" onClose={() => setDiscModal(false)}>
        <form onSubmit={handleSubmitDiscount(updateDiscount)} className="h-48">
          <div className="mb-3">
            <label htmlFor="discount">Discount</label>
            <div className="input-group">
              <Controller
                name="discountType"
                render={(props) => (
                  <ReactSelect
                    className="w-full rs-__container"
                    value={props.field.value}
                    onChange={props.field.onChange}
                    options={[
                      {label: DiscountRate.RATE_FIXED, value: DiscountRate.RATE_FIXED},
                      {label: DiscountRate.RATE_PERCENT, value: DiscountRate.RATE_PERCENT},
                    ]}
                  />
                )}
                control={controlDiscount}
              />
              <Controller
                name="discount"
                render={(props) => (
                  <Input
                    type="number"
                    className="input w-full"
                    value={props.field.value}
                    onChange={props.field.onChange}
                    selectable={true}
                    autoFocus={true}
                    id="discount"
                  />
                )}
                control={controlDiscount}
                rules={{required: true}}
              />
            </div>
          </div>
          <button className="btn btn-primary" type="submit">Apply discount</button>
        </form>
      </Modal>
    </>
  );
}
