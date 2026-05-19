import React, {useEffect} from "react";
import {useForm} from "react-hook-form";
import {Modal} from "../../../app-common/components/modal/modal";
import {Input} from "../../../app-common/components/input/input";
import {Button} from "../../../app-common/components/input/button";
import {Product} from "../../../api/model/product";
import {ProductVariant} from "../../../api/model/product.variant";
import {
  CartInputMode,
  getDefaultUnitPrice,
  validateProductPrice,
} from "../../../lib/product/product.pricing";
import {notify} from "../../../app-common/components/confirm/notification";
import {withCurrency} from "../../../lib/currency/currency";

export interface CartAddPromptState {
  item: Product;
  variant?: ProductVariant;
  mode: Exclude<CartInputMode, 'none'>;
  defaultQuantity: number;
  defaultPrice: number;
}

interface CartAddPromptModalProps {
  state: CartAddPromptState | null;
  onConfirm: (quantity: number, price: number) => void;
  onCancel: () => void;
}

export const CartAddPromptModal = ({
  state,
  onConfirm,
  onCancel,
}: CartAddPromptModalProps) => {
  const {register, handleSubmit, reset} = useForm({
    defaultValues: {
      quantity: 1,
      price: 0,
    },
  });

  useEffect(() => {
    if (state) {
      reset({
        quantity: state.defaultQuantity,
        price: state.defaultPrice,
      });
    }
  }, [state, reset]);

  const submit = (values: { quantity: string | number; price: string | number }) => {
    if (!state) {
      return;
    }

    const quantity = Number(values.quantity);
    if (!quantity || quantity <= 0) {
      notify({
        type: 'error',
        description: 'Enter a valid quantity',
      });
      return;
    }

    let unitPrice = Number(values.price);
    if (state.mode === 'weight') {
      unitPrice = getDefaultUnitPrice(state.item, state.variant);
    }

    const validationError = validateProductPrice(state.item, unitPrice);
    if (validationError) {
      notify({
        type: 'error',
        description: validationError,
      });
      return;
    }

    onConfirm(quantity, unitPrice);
  };

  const unitLabel = state?.item.sale_unit ? ` (${state.item.sale_unit})` : '';

  return (
    <Modal
      open={!!state}
      onClose={onCancel}
      size="sm"
      title={
        state?.mode === 'weight'
          ? `Enter weight — ${state.item.name}`
          : `Enter price — ${state?.item.name}`
      }
    >
      {state && (
        <form onSubmit={handleSubmit(submit)}>
          {state.mode === 'weight' && (
            <div className="mb-4">
              <label htmlFor="cart-prompt-quantity">Weight{unitLabel}</label>
              <Input
                id="cart-prompt-quantity"
                type="number"
                step="any"
                className="w-full mousetrap"
                autoFocus
                enableKeyboard
                {...register('quantity', {required: true})}
              />
              <p className="text-sm text-gray-600 mt-1">
                Unit price: {withCurrency(getDefaultUnitPrice(state.item, state.variant))}
              </p>
            </div>
          )}
          {state.mode === 'price' && (
            <div className="mb-4">
              <label htmlFor="cart-prompt-price">Sale price</label>
              <Input
                id="cart-prompt-price"
                type="number"
                step="any"
                className="w-full mousetrap"
                autoFocus
                enableKeyboard
                {...register('price', {required: true})}
              />
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add to cart
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
