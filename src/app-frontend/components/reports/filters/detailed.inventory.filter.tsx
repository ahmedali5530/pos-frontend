import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Product} from "../../../../api/model/product";
import {Tables} from "../../../../api/db/tables";
import {REPORTS_DETAILED_INVENTORY} from "../../../routes/frontend.routes";
import {DateRange} from "./date.range";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {Button} from "../../../../app-common/components/input/button";


const toOption = <T extends { id?: any }>(
  item: T | undefined,
  label: string
) => {
  if (!item?.id) {
    return null;
  }

  const value =
    typeof item.id === "string" ? item.id : item.id.toString?.() ?? String(item.id);

  return {
    label,
    value,
  };
};

const notNull = <T,>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

const TRANSACTION_TYPES = [
  { label: "Purchase", value: "Purchase" },
  { label: "Purchase Return", value: "Purchase Return" },
  { label: "Sale", value: "Sale" },
  { label: "Sale Return", value: "Sale Return" },
  { label: "Waste", value: "Waste" },
];

export const DetailedInventoryFilter = () => {
  const {data: itemsData, isLoading: loadingItems} = useApi<SettingsData<Product>>(
    Tables.product,
    [], 
    ['name asc'], 
    0, 
    9999, 
    ['category']
  );

  return (
    <form
      action={REPORTS_DETAILED_INVENTORY}
      className="flex flex-col gap-3 items-start"
      target="_blank"
    >
      <DateRange isRequired label="Select a range" />

      <div className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="detailed-inventory-items">Inventory Items</label>
          <ReactSelect
            id="detailed-inventory-items"
            name="items[]"
            isMulti
            isLoading={loadingItems}
            className="w-full"
            options={(itemsData?.data || [])
              .map(item => toOption(item, `${item.name}${item.barcode ? ` - ${item.barcode}` : ''}`.trim()))
              .filter(notNull)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="detailed-inventory-types">Transaction Types</label>
          <ReactSelect
            id="detailed-inventory-types"
            name="types[]"
            isMulti
            className="w-full"
            options={TRANSACTION_TYPES}
          />
        </div>
      </div>

      <Button
        variant="primary"
        type="submit"
      >Generate</Button>
    </form>
  );
}

