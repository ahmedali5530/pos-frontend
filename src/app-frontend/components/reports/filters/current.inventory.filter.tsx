import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Product} from "../../../../api/model/product";
import {Tables} from "../../../../api/db/tables";
import {REPORTS_CURRENT_INVENTORY} from "../../../routes/frontend.routes";
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

export const CurrentInventoryFilter = () => {
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
      action={REPORTS_CURRENT_INVENTORY}
      className="flex flex-col gap-3 items-start"
      target="_blank"
    >
      <div className="w-full flex flex-col gap-2">
        <label htmlFor="current-inventory-items">Inventory Items</label>
        <ReactSelect
          id="current-inventory-items"
          name="items[]"
          isMulti
          isLoading={loadingItems}
          className="w-full"
          options={(itemsData?.data || [])
            .map(item => toOption(item, `${item.name}${item.barcode ? ` - ${item.barcode}` : ''}`.trim()))
            .filter(notNull)}
        />
      </div>

      <Button
        variant="primary"
        type="submit"
      >Generate</Button>
    </form>
  );
}

