import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Tables} from "../../../../api/db/tables";
import {User} from "../../../../api/model/user";
import {Terminal} from "../../../../api/model/terminal";
import {Store} from "../../../../api/model/store";
import {Discount} from "../../../../api/model/discount";
import {Tax} from "../../../../api/model/tax";
import {PaymentType} from "../../../../api/model/payment.type";
import {REPORTS_SALES_ADVANCED} from "../../../routes/frontend.routes";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {DateRange} from "./date.range";
import {Checkbox} from "../../../../app-common/components/input/checkbox";
import {Button} from "../../../../app-common/components/input/button";
import {Product} from "../../../../api/model/product";
import {Input} from "../../../../app-common/components/input/input";


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

export const SalesAdvancedFilter = () => {
  const {data: usersData, isLoading: loadingUsers} = useApi<SettingsData<User>>(Tables.user_account, [], ['first_name asc']);
  const {data: terminalsData, isLoading: loadingTerminals} = useApi<SettingsData<Terminal>>(Tables.terminal, [], ['code asc']);
  const {data: storesData, isLoading: loadingStores} = useApi<SettingsData<Store>>(Tables.store, [], ['name asc'], undefined, undefined, ['floor']);
  const {data: discountsData, isLoading: loadingDiscounts} = useApi<SettingsData<Discount>>(Tables.discount, [], ['name asc']);
  const {data: taxesData, isLoading: loadingTaxes} = useApi<SettingsData<Tax>>(Tables.tax, [], ['name asc']);
  const {data: paymentTypesData, isLoading: loadingPaymentTypes} = useApi<SettingsData<PaymentType>>(Tables.payment, [], ['priority asc']);
  const {data: itemsData, isLoading: loadingItems} = useApi<SettingsData<Product>>(Tables.product, [], ['name asc']);

  return (
    <form
      action={REPORTS_SALES_ADVANCED}
      className="flex flex-col gap-4 items-start w-full"
      target="_blank"
    >
      <DateRange isRequired label="Select a range" />

      <div className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="sales-advanced-order-takers">Order Takers</label>
          <ReactSelect
            id="sales-advanced-order-takers"
            name="cashiers[]"
            isMulti
            isLoading={loadingUsers}
            className="w-full"
            options={(usersData?.data || [])
              .map(user =>
                toOption(user, user.display_name)
              )
              .filter(notNull)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="sales-advanced-terminals">Terminals</label>
          <ReactSelect
            id="sales-advanced-terminals"
            name="terminals[]"
            isMulti
            isLoading={loadingTerminals}
            className="w-full"
            options={(terminalsData?.data || [])
              .map(table => toOption(table, table.code))
              .filter(notNull)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="sales-advanced-stores">Stores</label>
          <ReactSelect
            id="sales-advanced-stores"
            name="stores[]"
            isMulti
            isLoading={loadingTerminals}
            className="w-full"
            options={(storesData?.data || [])
              .map(floor => toOption(floor, floor.name))
              .filter(notNull)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label>Tax Filter</label>
          <div className="flex flex-col gap-3">
            <Checkbox name="with_tax" value="1" label="With Tax" />
            <Checkbox name="without_tax" value="1" label="Without Tax" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="sales-advanced-taxes">Taxes</label>
            <ReactSelect
              id="sales-advanced-taxes"
              name="taxes[]"
              isMulti
              isLoading={loadingTaxes}
              className="w-full"
              options={(taxesData?.data || [])
                .map(tax => toOption(tax, `${tax.name} (${tax.rate}%)`))
                .filter(notNull)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="sales-advanced-discounts">Discount Filter</label>
          <div className="flex flex-col gap-3 mb-2">
            <Checkbox name="with_discount" value="1" label="With Discount" />
            <Checkbox name="without_discount" value="1" label="Without Discount" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="sales-advanced-discounts">Discounts</label>
            <ReactSelect
              id="sales-advanced-discounts"
              name="discounts[]"
              isMulti
              isLoading={loadingDiscounts}
              className="w-full"
              placeholder="Select specific discounts (optional)"
              options={(discountsData?.data || [])
                .map(discount => toOption(discount, discount.name))
                .filter(notNull)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="sales-advanced-payment-types">Payment Types</label>
          <ReactSelect
            id="sales-advanced-payment-types"
            name="payment_types[]"
            isMulti
            isLoading={loadingPaymentTypes}
            className="w-full"
            options={(paymentTypesData?.data || [])
              .map(paymentType => toOption(paymentType, paymentType.name))
              .filter(notNull)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label>Status Filters</label>
          <div className="flex flex-col gap-2">
            <Checkbox name="completed" value="1" label="Completed" />
            <Checkbox name="on_hold" value="1" label="On hold" />
            <Checkbox name="pending" value="1" label="Pending" />
            <Checkbox name="returned" value="1" label="Refund" />
            <Checkbox name="deleted" value="1" label="Deleted" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label>Display Options</label>
          <div className="flex flex-col gap-2">
            <Checkbox name="show_details" value="1" label="Show Details" />
            <Checkbox name="show_order_items" value="1" label="Show Order Items" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="sales-advanced-items">Filter by items</label>
          <ReactSelect
            id="sales-advanced-items"
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
          <label htmlFor="sales-advanced-items">Filter by orders</label>
          <Input
            id="sales-advanced-orders"
            name="orders"
            className="w-full"
          />
          <span className="text-xs text-neutral-400">Enter order id with comma separated</span>
        </div>

        <div className="flex flex-row gap-2">
          <div className="flex flex-col flex-1">
            <label htmlFor="sales-advanced-sort">Sort result by</label>
            <ReactSelect
              id="sales-advanced-sort"
              name="sort"
              className="w-full"
              options={['Invoice', 'Date', 'Terminal', 'Store', 'Status', 'Cashier', 'Total']
                .map(item => ({label: item, value: item}))
                .filter(notNull)}
            />
          </div>

          <div className="flex flex-col flex-1">
            <label htmlFor="sales-advanced-sort">Sort direction</label>
            <ReactSelect
              id="sales-advanced-sort"
              name="sortBy"
              className="w-full"
              options={['Ascending', 'Descending']
                .map(item => ({label: item, value: item}))
                .filter(notNull)}
            />
          </div>
        </div>
      </div>

      <Button
        variant="primary"
        type="submit"
      >Generate</Button>
    </form>
  );
}