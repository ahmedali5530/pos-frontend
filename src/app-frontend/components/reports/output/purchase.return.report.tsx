import {useEffect, useMemo, useRef, useState} from "react";
import {useDB} from "../../../../api/db/db";
import {Tables} from "../../../../api/db/tables";
import {ReportsLayout} from "../../../containers/layout/reports.layout";
import {formatNumber, withCurrency} from "../../../../lib/currency/currency";
import {toRecordId} from "../../../../api/model/common";

const safeNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

interface ReportFilters {
  startDate?: string | null;
  endDate?: string | null;
  supplierIds: string[];
  storeIds: string[];
  itemIds: string[];
  userIds: string[];
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
    startDate: params.get('start') || params.get('start_date'),
    endDate: params.get('end') || params.get('end_date'),
    supplierIds: parseMulti('suppliers'),
    storeIds: parseMulti('stores'),
    itemIds: parseMulti('items'),
    userIds: parseMulti('users'),
  };
};

interface PurchaseReturnItem {
  date: string;
  returnNumber: string;
  supplier: string;
  store: string;
  item: string;
  itemCode?: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  amount: number;
  user: string;
  comments?: string;
}

export const PurchaseReturnReport = () => {
  const db = useDB();
  const queryRef = useRef(db.query);
  const [returnItems, setReturnItems] = useState<PurchaseReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo(parseFilters, []);
  const subtitle = filters.startDate && filters.endDate ? `${filters.startDate} to ${filters.endDate}` : undefined;

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

        if (filters.startDate) {
          conditions.push(`time::format(created_at, "%Y-%m-%d") >= $startDate`);
          params.startDate = filters.startDate;
        }

        if (filters.endDate) {
          conditions.push(`time::format(created_at, "%Y-%m-%d") <= $endDate`);
          params.endDate = filters.endDate;
        }

        if (filters.storeIds.length > 0) {
          conditions.push(`store INSIDE $stores`);
          params.stores = filters.storeIds.map(id => toRecordId(id));
        }

        if (filters.userIds.length > 0) {
          conditions.push(`created_by INSIDE $users`);
          params.users = filters.userIds.map(id => toRecordId(id));
        }

        const purchaseReturnQuery = `
          SELECT 
            id,
            created_at,
            invoice_number,
            store.name AS store_name,
            created_by.name AS user_name,
            items
          FROM ${Tables.purchase_return}
          ${conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""}
          ORDER BY created_at ASC
          FETCH items, items.item, items.item.categories, created_by, store, items.supplier
        `;

        const result: any = await queryRef.current(purchaseReturnQuery, params);
        const purchaseReturns = (result?.[0] ?? []) as any[];

        const allReturnItems: PurchaseReturnItem[] = [];

        purchaseReturns.forEach((purchaseReturn: any) => {
          const items = purchaseReturn.items || [];
          items.forEach((item: any) => {
            const itemId = typeof item.item?.id === "string"
              ? item.item.id
              : item.item?.id?.toString?.() ?? String(item.item?.id ?? "");

            // Filter by item if specified
            if (filters.itemIds.length > 0) {
              const matchesItem = filters.itemIds.some(filterId => {
                const normalizedFilterId = filterId.includes(':') ? filterId : `product:${filterId}`;
                return itemId === normalizedFilterId;
              });
              if (!matchesItem) {
                return;
              }
            }

            // Filter by supplier if specified (supplier is on item level in returns)
            if (filters.supplierIds.length > 0) {
              const supplierId = item.supplier?.id || item.supplier;
              const supplierIdStr = typeof supplierId === "string" ? supplierId : supplierId?.toString?.() || "";
              
              const matchesSupplier = filters.supplierIds.some(filterId => {
                const normalizedFilterId = filterId.includes(':') ? filterId : `supplier:${filterId}`;
                return supplierIdStr === normalizedFilterId;
              });
              if (!matchesSupplier) {
                return;
              }
            }

            const quantity = safeNumber(item.quantity);
            const price = safeNumber(item.price || item.purchase_price || 0);
            const amount = quantity * price;

            allReturnItems.push({
              date: purchaseReturn.created_at || "",
              returnNumber: purchaseReturn.invoice_number ? `#${purchaseReturn.invoice_number}` : "N/A",
              supplier: item.supplier?.name || purchaseReturn.supplier?.name || "N/A",
              store: purchaseReturn.store_name || purchaseReturn.store?.name || "N/A",
              item: item.item?.name || "Unknown",
              itemCode: item.item?.barcode || item.barcode || undefined,
              category: item.item?.categories?.[0]?.name || "Uncategorized",
              quantity: quantity,
              unit: item.purchase_unit || item.item?.purchase_unit || "",
              price: price,
              amount: amount,
              user: purchaseReturn.user_name || purchaseReturn.created_by?.name || "Unknown",
              comments: item.comments || undefined,
            });
          });
        });

        setReturnItems(allReturnItems);
      } catch (err) {
        console.error("Failed to load purchase return report", err);
        setError(err instanceof Error ? err.message : "Unable to load report");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.startDate, filters.endDate, filters.supplierIds, filters.storeIds, filters.itemIds, filters.userIds]);

  const totals = useMemo(() => {
    return returnItems.reduce(
      (acc, item) => {
        acc.totalQuantity += item.quantity;
        acc.totalAmount += item.amount;
        acc.itemCount += 1;
        return acc;
      },
      {
        totalQuantity: 0,
        totalAmount: 0,
        itemCount: 0,
      }
    );
  }, [returnItems]);

  if (loading) {
    return (
      <ReportsLayout title="Purchase Return Report" subtitle={subtitle}>
        <div className="py-12 text-center text-neutral-500">Loading purchase return report…</div>
      </ReportsLayout>
    );
  }

  if (error) {
    return (
      <ReportsLayout title="Purchase Return Report" subtitle={subtitle}>
        <div className="py-12 text-center text-danger-600">Failed to load report: {error}</div>
      </ReportsLayout>
    );
  }

  return (
    <ReportsLayout title="Purchase Return Report" subtitle={subtitle}>
      <div className="space-y-8">
        {/* Summary Totals */}
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <h3 className="bg-neutral-100 px-6 py-3 text-sm font-semibold text-neutral-700">Summary</h3>
          <div className="p-4">
            <table className="min-w-full text-sm">
              <tbody className="divide-y divide-neutral-100">
                <tr>
                  <td className="py-2 text-neutral-700">Total Returns</td>
                  <td className="py-2 text-right font-semibold text-neutral-900">{formatNumber(returnItems.length)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-neutral-700">Total Quantity</td>
                  <td className="py-2 text-right font-semibold text-neutral-900">{formatNumber(totals.totalQuantity)}</td>
                </tr>
                <tr className="border-t-2 border-neutral-300">
                  <td className="py-2 font-semibold text-neutral-900">Total Amount</td>
                  <td className="py-2 text-right font-bold text-neutral-900">{withCurrency(totals.totalAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Purchase Return Details Table */}
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <h3 className="bg-neutral-100 px-6 py-3 text-sm font-semibold text-neutral-700">Purchase Return Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="py-3 pl-6 pr-3 text-left text-xs font-semibold text-neutral-700">Date</th>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-700">Invoice #</th>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-700">Supplier</th>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-700">Store</th>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-700">Item</th>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-700">Category</th>
                  <th className="py-3 px-3 text-right text-xs font-semibold text-neutral-700">Quantity</th>
                  <th className="py-3 px-3 text-right text-xs font-semibold text-neutral-700">Price</th>
                  <th className="py-3 px-3 text-right text-xs font-semibold text-neutral-700">Amount</th>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-700">User</th>
                  <th className="py-3 pr-6 text-left text-xs font-semibold text-neutral-700">Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {returnItems.length > 0 ? (
                  returnItems.map((item, index) => (
                    <tr key={`${item.date}-${item.item}-${index}`}>
                      <td className="py-3 pl-6 pr-3 text-sm text-neutral-700">
                        {item.date ? new Date(item.date).toLocaleDateString() : ""}
                      </td>
                      <td className="py-3 px-3 text-sm text-neutral-700">{item.returnNumber}</td>
                      <td className="py-3 px-3 text-sm text-neutral-700">{item.supplier}</td>
                      <td className="py-3 px-3 text-sm text-neutral-700">{item.store}</td>
                      <td className="py-3 px-3 text-sm font-medium text-neutral-800">
                        {item.item}{item.itemCode ? ` (${item.itemCode})` : ""}
                      </td>
                      <td className="py-3 px-3 text-sm text-neutral-700">{item.category}</td>
                      <td className="py-3 px-3 text-right text-sm text-neutral-700">
                        {formatNumber(item.quantity)} {item.unit}
                      </td>
                      <td className="py-3 px-3 text-right text-sm text-neutral-700">{withCurrency(item.price)}</td>
                      <td className="py-3 px-3 text-right text-sm font-semibold text-neutral-900">
                        {withCurrency(item.amount)}
                      </td>
                      <td className="py-3 px-3 text-sm text-neutral-700">{item.user}</td>
                      <td className="py-3 pr-6 text-sm text-neutral-700">{item.comments || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="py-6 text-center text-sm text-neutral-500">
                      No purchase returns found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
              {returnItems.length > 0 && (
                <tfoot className="bg-neutral-50">
                  <tr>
                    <td colSpan={6} className="py-3 pl-6 pr-3 text-sm font-semibold text-neutral-900">Total</td>
                    <td className="py-3 px-3 text-right text-sm font-bold text-neutral-900">
                      {formatNumber(totals.totalQuantity)}
                    </td>
                    <td className="py-3 px-3 text-right text-sm font-bold text-neutral-900">
                      {withCurrency(totals.totalAmount)}
                    </td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </ReportsLayout>
  );
};
