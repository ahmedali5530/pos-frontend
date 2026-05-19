import React, {useEffect, useState} from "react";
import {Modal} from "../../../app-common/components/modal/modal";
import {Input} from "../../../app-common/components/input/input";
import {Button} from "../../../app-common/components/input/button";
import {CartItem} from "../../../api/model/cart.item";
import {
  getProductPriceBounds,
  validateProductPrice,
} from "../../../lib/product/product.pricing";
import {withCurrency} from "../../../lib/currency/currency";
import classNames from "classnames";

export interface CartPriceEditState {
  line: CartItem;
  index: number;
}

interface CartPriceEditModalProps {
  state: CartPriceEditState | null;
  onConfirm: (price: number) => void;
  onCancel: () => void;
}

export const CartPriceEditModal = ({
  state,
  onConfirm,
  onCancel,
}: CartPriceEditModalProps) => {
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);

  const bounds = state ? getProductPriceBounds(state.line.item) : {};

  useEffect(() => {
    if (state) {
      setPrice(String(state.line.price));
      setError(null);
    }
  }, [state]);

  const validate = (value: string): string | null => {
    if (value.trim() === "") {
      return "Enter a price";
    }
    const num = Number(value);
    if (Number.isNaN(num)) {
      return "Enter a valid price";
    }
    return validateProductPrice(state!.line.item, num);
  };

  const submit = () => {
    const validationError = validate(price);
    if (validationError) {
      setError(validationError);
      return;
    }
    onConfirm(Number(price));
  };

  const rangeLabel =
    bounds.min != null && bounds.max != null
      ? `${withCurrency(bounds.min)} – ${withCurrency(bounds.max)}`
      : bounds.min != null
        ? `from ${withCurrency(bounds.min)}`
        : bounds.max != null
          ? `up to ${withCurrency(bounds.max)}`
          : null;

  return (
    <Modal
      open={!!state}
      onClose={onCancel}
      size="sm"
      title={state ? `Set price — ${state.line.item.name}` : "Set price"}
    >
      {state && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          {rangeLabel && (
            <p className="text-sm text-gray-600 mb-3">
              Allowed range: <span className="font-medium">{rangeLabel}</span>
            </p>
          )}
          <div className="mb-2">
            <label htmlFor="cart-edit-price">Unit price</label>
            <div className="input-group">
              <span className="input-addon">{withCurrency(undefined)}</span>
              <Input
                id="cart-edit-price"
                type="number"
                step="any"
                className={classNames("w-full mousetrap", error && "border-danger-500")}
                value={price}
                autoFocus
                enableKeyboard
                hasError={!!error}
                onChange={(e) => {
                  setPrice(e.currentTarget.value);
                  if (error) {
                    setError(validate(e.currentTarget.value));
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submit();
                  }
                }}
              />
            </div>
            {error && (
              <p className="text-danger-600 text-sm mt-1" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Apply
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
