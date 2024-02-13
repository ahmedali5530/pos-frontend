import classNames from "classnames";
import { getRealProductPrice } from "../../containers/dashboard/pos";
import { Modal } from "../../../app-common/components/modal/modal";
import { Product } from "../../../api/model/product";
import { ProductVariant } from "../../../api/model/product.variant";
import { useAtom } from "jotai";
import { defaultState } from "../../../store/jotai";
import Mousetrap from "mousetrap";

interface Props{
  modal: boolean;
  onClose: () => void;
  variants: ProductVariant[];
  addItemVariant: (item: Product,
    variant: ProductVariant,
    quantity: number,
    price?: number) => void;
  items: Product[];
}
export const SearchVariants = ({
  modal, onClose, variants, addItemVariant, items
}: Props) => {
  const [appState, setAppState] = useAtom(defaultState);

  const {
    selectedVariant,
    latest,
    quantity,
    selected
  } = appState;

  const moveVariantsCursor = async (event: any) => {
    const itemsLength = variants.length;
    if( event.key === "ArrowDown" ) {
      let newSelected = selectedVariant + 1;
      if( newSelected === itemsLength ) {
        newSelected = 0;
        setAppState((prev) => ({
          ...prev,
          selectedVariant: newSelected,
        }));
      } else {
        setAppState((prev) => ({
          ...prev,
          selectedVariant: newSelected,
        }));
      }
    } else if( event.key === "ArrowUp" ) {
      let newSelected = selectedVariant - 1;
      if( newSelected === -1 ) {
        newSelected = itemsLength - 1;
      }
      setAppState((prev) => ({
        ...prev,
        selectedVariant: newSelected,
      }));
    } else if( event.key === "Enter" ) {
      addItemVariant(
        items[selected],
        items[selected].variants[selectedVariant],
        quantity
      );
    }
  };

  Mousetrap.bind(["up", "down", "enter"], function (e: Event) {
    // e.preventDefault();
    if( modal ) {
      //move cursor in variant chooser modal
      moveVariantsCursor(e);
    }
  });

  return (
    <Modal
      open={modal}
      onClose={onClose}
      title={`Choose a variant for ${latest?.name}`}
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
                  selectedVariant === index ? "bg-gray-300" : ""
                )}
                onClick={() => addItemVariant(latest!, item, quantity)}
                key={index}>
                <div className="table-cell p-5">
                  {item.name}
                  {item.barcode && (
                    <div className="text-gray-400">{item.barcode}</div>
                  )}
                </div>
                <div className="table-cell p-5">{item.attributeValue}</div>
                <div className="table-cell p-5 text-right">
                  {item.price === null ? (
                    <>{getRealProductPrice(latest!)}</>
                  ) : (
                    <>{item.price}</>
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
