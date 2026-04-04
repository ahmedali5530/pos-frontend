import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Product} from "../../../../api/model/product";
import {Tables} from "../../../../api/db/tables";
import {User} from "../../../../api/model/user";
import {REPORTS_WASTE} from "../../../routes/frontend.routes";
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

export const WasteFilter = () => {
  const {data: itemsData, isLoading: loadingItems} = useApi<SettingsData<Product>>(Tables.product, [], ['name asc'], 0, 9999);
  const {data: usersData, isLoading: loadingUsers} = useApi<SettingsData<User>>(Tables.user_account, [], ['display_name asc'], 0, 9999);

  return (
    <form
      action={REPORTS_WASTE}
      className="flex flex-col gap-4 items-start w-full"
      target="_blank"
    >
      <DateRange isRequired label="Select a range" />

      <div className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="waste-items">Items</label>
          <ReactSelect
            id="waste-items"
            name="items[]"
            isMulti
            isLoading={loadingItems}
            className="w-full"
            options={(itemsData?.data || [])
              .map(item => toOption(item, item.name))
              .filter(notNull)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="waste-users">Created By</label>
          <ReactSelect
            id="waste-users"
            name="users[]"
            isMulti
            isLoading={loadingUsers}
            className="w-full"
            options={(usersData?.data || [])
              .map(user =>
                toOption(user, user.display_name || 'Unnamed user')
              )
              .filter(notNull)}
          />
        </div>
      </div>

      <Button
        variant="primary"
        type="submit"
      >Generate</Button>
    </form>
  );
};

