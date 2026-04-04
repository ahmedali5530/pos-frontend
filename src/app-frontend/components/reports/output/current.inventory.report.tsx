import {useEffect, useMemo, useRef, useState} from "react";
import {useDB} from "../../../../api/db/db";
import {ReportsLayout} from "../../../containers/layout/reports.layout";
import {formatNumber} from "../../../../lib/currency/currency";
import {Tables} from "../../../../api/db/tables";
import {toRecordId} from "../../../../api/model/common";
import {ITEM_FETCHES} from "../../../../api/model/product";

const safeNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

interface ReportFilters {
  itemIds: string[];
}

const parseFilters = (): ReportFilters => {
  const params = new URLSearchParams(window.location.search);
  const parseMulti = (name: string) => {
    const list = [
      ...params.getAll(`${name}[]`),
      ...params.getAll(name),
    ].filter(Boolean);
    return list as string[];
  };

  return {
    itemIds: parseMulti('items'),
  };
};

interface InventoryItem {
  itemId: string;
  itemName: string;
  itemCode?: string;
  category: string;
  storeName: string;
  quantity: number;
  unit: string;
}

export const CurrentInventoryReport = () => {
  const db = useDB();
  const queryRef = useRef(db.query);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo(parseFilters, []);

  useEffect(() => {
    queryRef.current = db.query;
  }, [db]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const conditions: string[] = [];
        const params: Record<string, any> = {};

        if (filters.itemIds.length > 0) {
          conditions.push(`product.id INSIDE $items`);
          params.items = filters.itemIds.map(id => toRecordId(id));
        }

        const inventoryQuery = `
            SELECT product.id            AS itemId,
                   product.name          AS itemName,
                   product.barcode       AS itemCode,
                   product.categories    AS categories,
                   store.name            AS storeName,
                   quantity,
                   product.purchase_unit AS unit
            FROM ${Tables.product_store} ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
            ORDER BY product.name ASC
            FETCH ${ITEM_FETCHES.join(', ')}
            
        `;

        const inventoryResult: any = await queryRef.current(inventoryQuery, params);
        const rawData = (inventoryResult?.[0] ?? []) as any[];

        const mappedInventory: InventoryItem[] = rawData.map((item: any) => ({
          itemId: item.itemId?.toString() || '',
          itemName: item.itemName || 'Unknown',
          itemCode: item.itemCode || undefined,
          category: item.categories?.map(item => item.name)?.join(', ') || 'Uncategorized',
          storeName: item.storeName || 'Unknown',
          quantity: safeNumber(item.quantity),
          unit: item.unit || '',
        }));

        setInventory(mappedInventory);
      } catch (err) {
        console.error("Failed to load current inventory report", err);
        setError(err instanceof Error ? err.message : "Unable to load report");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.itemIds]);

  const totals = useMemo(() => {
    return inventory.reduce(
      (acc, item) => {
        acc.totalQuantity += item.quantity;
        acc.itemCount += 1;

        if (!acc.stores[item.storeName]) {
          acc.stores[item.storeName] = 0;
        }
        acc.stores[item.storeName] += item.quantity;

        if (!acc.categories[item.category]) {
          acc.categories[item.category] = 0;
        }
        acc.categories[item.category] += item.quantity;

        return acc;
      },
      {
        totalQuantity: 0,
        itemCount: 0,
        stores: {} as Record<string, number>,
        categories: {} as Record<string, number>,
      }
    );
  }, [inventory]);

  if (loading) {
    return (
      <ReportsLayout title="Current Inventory">
        <div className="py-12 text-center text-neutral-500">Loading inventory report…</div>
      </ReportsLayout>
    );
  }

  if (error) {
    return (
      <ReportsLayout title="Current Inventory">
        <div className="py-12 text-center text-danger-600">Failed to load report: {error}</div>
      </ReportsLayout>
    );
  }

  return (
    <ReportsLayout title="Current Inventory">
      <div className="space-y-8">
        {/* Summary Totals */}
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <h3 className="bg-neutral-100 px-6 py-3 text-sm font-semibold text-neutral-700">Summary</h3>
          <div className="p-4">
            <table className="min-w-full text-sm">
              <tbody className="divide-y divide-neutral-100">
              <tr>
                <td className="py-2 text-neutral-700">Total Items</td>
                <td className="py-2 text-right font-semibold text-neutral-900">{formatNumber(totals.itemCount)}</td>
              </tr>
              <tr className="border-t-2 border-neutral-300">
                <td className="py-2 font-semibold text-neutral-900">Total Quantity</td>
                <td className="py-2 text-right font-bold text-neutral-900">{formatNumber(totals.totalQuantity)}</td>
              </tr>
              {Object.keys(totals.stores).length > 0 && (
                <>
                  <tr className="border-t border-neutral-200">
                    <td className="py-2 font-semibold text-neutral-700" colSpan={2}>Store Breakdown</td>
                  </tr>
                  {Object.entries(totals.stores).map(([store, quantity]) => (
                    <tr key={store}>
                      <td className="py-2 text-neutral-600 pl-4">{store}</td>
                      <td className="py-2 text-right text-neutral-700">{formatNumber(quantity)}</td>
                    </tr>
                  ))}
                </>
              )}
              {Object.keys(totals.categories).length > 0 && (
                <>
                  <tr className="border-t border-neutral-200">
                    <td className="py-2 font-semibold text-neutral-700" colSpan={2}>Category Breakdown</td>
                  </tr>
                  {Object.entries(totals.categories).map(([category, quantity]) => (
                    <tr key={category}>
                      <td className="py-2 text-neutral-600 pl-4">{category}</td>
                      <td className="py-2 text-right text-neutral-700">{formatNumber(quantity)}</td>
                    </tr>
                  ))}
                </>
              )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <h3 className="bg-neutral-100 px-6 py-3 text-sm font-semibold text-neutral-700">Inventory Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
              <tr>
                <th className="py-3 pl-6 pr-3 text-left text-xs font-semibold text-neutral-700">Item</th>
                <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-700">Category</th>
                <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-700">Store</th>
                <th className="py-3 pr-6 text-right text-xs font-semibold text-neutral-700">Current Balance</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
              {inventory.map((item, index) => (
                <tr key={`${item.itemId}-${index}`}>
                  <td className="py-4 pl-6 pr-3 text-sm font-medium text-neutral-800">
                    {item.itemName}{item.itemCode ? ` (${item.itemCode})` : ''}
                  </td>
                  <td className="py-4 px-3 text-sm text-neutral-700">{item.category}</td>
                  <td className="py-4 px-3 text-sm text-neutral-700">{item.storeName}</td>
                  <td className="py-4 pr-6 text-right text-sm font-semibold text-neutral-900">
                    {formatNumber(item.quantity)} {item.unit}
                  </td>
                </tr>
              ))}
              {inventory.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-neutral-500">
                    No inventory items found.
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ReportsLayout>
  );
};

