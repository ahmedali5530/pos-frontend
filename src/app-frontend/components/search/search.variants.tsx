import classNames from "classnames";
import {getRealProductPrice} from "../../containers/dashboard/pos";
import {Modal} from "../../../app-common/components/modal/modal";
import {Product} from "../../../api/model/product";
import {ProductVariant} from "../../../api/model/product.variant";
import {useAtom} from "jotai";
import {defaultState} from "../../../store/jotai";
import Mousetrap from "mousetrap";
import {useEffect, useRef} from "react";

interface Props {
  modal: boolean;
  onClose: () => void;
  variants: ProductVariant[];
  addItemVariant: (
    item: Product,
    variant: ProductVariant,
    quantity: number,
    price?: number) => void;
}

export const SearchVariants = ({
  modal, onClose, variants, addItemVariant
}: Props) => {
  const [appState, setAppState] = useAtom(defaultState);

  const handlerRef = useRef(null);

  useEffect(() => {
    handlerRef.current = (event: any) => {
      event.preventDefault();

      moveVariantsCursor(event);
    };
  }, [appState.selected, appState.quantity, appState.selectedVariant, appState.latest, variants]);

  const moveVariantsCursor = (event: any) => {
    console.log('getting keyboard events')
    const variantsLength = variants.length;
    if (event.key === "ArrowDown") {
      setAppState(prev => {
        let newSelected = prev.selectedVariant + 1;
        if (newSelected === variantsLength) {
          newSelected = 0;
          return {
            ...prev,
            selectedVariant: newSelected
          };
        }

        return {
          ...prev,
          selectedVariant: newSelected
        };
      })

    } else if (event.key === "ArrowUp") {
      setAppState(prev => {
        let newSelected = prev.selectedVariant - 1;
        if (newSelected === -1) {
          newSelected = variantsLength - 1;
        }
        return {
          ...prev,
          selectedVariant: newSelected,
        }
      })

    } else if (event.key === "Enter") {
      if(appState.latest) {
        addItemVariant(
          appState.latest,
          variants[appState.selectedVariant],
          appState.quantity
        );
      }
    }
  };


  useEffect(() => {
    const func = (e) => handlerRef.current?.(e);

    Mousetrap.bind(["up", "down", "enter"], func);

    return () => {
      Mousetrap.reset();
    };
  }, []);

  return (
    <Modal
      open={modal}
      onClose={onClose}
      title={`Choose a variant for ${appState.latest?.name}`}
      hideCloseButton={true}
      shouldCloseOnOverlayClick={false}
    >
      {variants.length > 0 && (
        <div className="table w-full">
          <div className="table-header-group">
            <div className="table-row">
              <div className="table-cell p-5 text-left font-bold">Item</div>
              <div className="table-cell p-5 text-left font-bold">
                Variant
              </div>
              <div className="table-cell p-5 text-right font-bold">Rate</div>
            </div>
          </div>
          <div className="table-row-group">
            {variants.map((item, index) => (
              <div
                className={classNames(
                  "table-row hover:bg-gray-200 cursor-pointer",
                  appState.selectedVariant === index ? "bg-gray-300" : ""
                )}
                onClick={() => addItemVariant(appState.latest!, item, appState.quantity)}
                key={index}>
                <div className="table-cell p-5">
                  {item.name}
                  {item.barcode && (
                    <div className="text-gray-400">{item.barcode}</div>
                  )}
                </div>
                <div className="table-cell p-5">{item.attribute_value}</div>
                <div className="table-cell p-5 text-right">
                  {item.price ? (
                    <>{item.price}</>
                  ) : (
                    <>{getRealProductPrice(appState.latest!)}</>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  )
}
