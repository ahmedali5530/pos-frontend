import React, {FC, PropsWithChildren, useEffect, useState} from "react";
import {Button} from "../../../app-common/components/input/button";
import {CartItem} from "../../../api/model/cart.item";
import {Discount, DiscountScope} from "../../../api/model/discount";
import {Input} from "../../../app-common/components/input/input";
import {Modal} from "../../../app-common/components/modal/modal";
import {Controller, useForm} from "react-hook-form";
import {Trans} from "react-i18next";
import {useLoadData} from "../../../api/hooks/use.load.data";
import {Shortcut} from "../../../app-common/components/input/shortcut";


interface Props extends PropsWithChildren {
  added: CartItem[];
  setDiscount: (discount?: Discount) => void;
  setDiscountAmount: (amount?: number) => void;
  discount?: Discount;
  discountAmount?: number;
  setDiscountRateType: (string?: string) => void;
  discountRateType: string | undefined;
}

export const ApplyDiscount: FC<Props> = ({
  added, setDiscount, setDiscountAmount, discount, discountAmount,
  setDiscountRateType, discountRateType, children
}) => {
  const [modal, setModal] = useState(false);
  const [askDiscount, setAskDiscount] = useState(false);
  const {register, handleSubmit, reset, control, formState: {errors}} = useForm();
  const [discountList, setDiscountList] = useState<Discount[]>([]);

  const [state]  = useLoadData();

  const loadDiscounts = async () => {
    if (state.discountList.list) {
      setDiscountList(state.discountList.list);
    }
  };

  useEffect(() => {
    loadDiscounts();
  }, [state.discountList]);

  const submitForm = (values: any) => {
    setDiscountAmount(Number(values.discountAmount));
    setDiscountRateType(values.rateType);
    setModal(false);
  };

  useEffect(() => {
    if (modal) {
      reset({
        discountAmount
      });
    }
  }, [modal, discountAmount, reset]);

  return (
    <>
      <button className="block w-full text-left"
              disabled={added.length === 0}
              onClick={() => {
                setModal(true);
              }}
              type="button"
      >
        {children || 'Discounts'}
        <Shortcut shortcut="ctrl+d" handler={() => setModal(true)} />
      </button>

      <Modal open={modal} onClose={() => {
        setModal(false);
      }} title="Apply Discount">
        <Button variant="danger" onClick={() => {
          setDiscount(undefined);
          setAskDiscount(false);
          setDiscountAmount(undefined);
          setModal(false);
        }} className="mr-3 mb-3" size="lg" type="button">Clear Discount</Button>
        {discountList.map((discountItem, index) => (
          <Button
            variant="primary" key={index} onClick={() => {
            setDiscount(discountItem);

            if (discountItem.scope === DiscountScope.SCOPE_OPEN) {
              setAskDiscount(true);
            } else {
              setModal(false);
              setAskDiscount(false);
              setDiscountAmount(undefined);
            }
          }}
            className="mr-3 mb-3"
            active={discountItem.id === discount?.id}
            size="lg"
            type="button"
          >{discountItem.name}</Button>
        ))}

        {(askDiscount || discountAmount) && (
          <form onSubmit={handleSubmit(submitForm)}>
            <div className="mt-5">
              <div className="grid grid-cols-7 gap-4">
                <div className="col-span-2">
                  <select
                    {...register('rateType')}
                    className="form-control lg w-full"
                    value={discountRateType}
                    onChange={(value) => setDiscountRateType(value.target.value)}
                  >
                    {[
                      {label: 'Fixed', value: 'fixed'},
                      {label: 'Percent', value: 'percent'}
                    ].map(item => (
                      <option value={item.value} key={item.value}>{item.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-4">
                  <Controller
                    name="discountAmount"
                    control={control}
                    rules={{required: true, pattern: /[0-9]/}}
                    render={(props: any) => (
                      <>
                        <Input
                          placeholder="Enter discount amount"
                          autoFocus
                          value={props.field.value}
                          onChange={props.field.onChange}
                          inputSize="lg"
                          selectable
                          className="input w-full"
                        />
                        {errors.discountAmount && (
                          <span className="text-danger-500 text-sm">
                            <Trans>
                              {errors.discountAmount.message}
                            </Trans>
                          </span>
                        )}
                      </>
                    )}
                  />
                </div>
                <div className="col-span-1">
                  <Button variant="primary" type="submit" size="lg" className="w-full">Apply discount</Button>
                </div>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
};