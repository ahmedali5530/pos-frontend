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
    itemIds: parseMulti('items'),
    userIds: parseMulti('users'),
  };
};

interface WasteItem {
  date: string;
  wasteNumber: string;
  item: string;
  itemCode?: string;
  category: string;
  quantity: number;
  unit: string;
  user: string;
  comments?: string;
}

export const WasteReport = () => {
  const db = useDB();
  const queryRef = useRef(db.query);
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([]);
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

        if (filters.userIds.length > 0) {
          conditions.push(`created_by INSIDE $users`);
          params.users = filters.userIds.map(id => toRecordId(id));
        }

        if (filters.itemIds.length > 0) {
          const orX = [];
          filters.itemIds.forEach((item, index) => {
            orX.push(`array::any(items.item.id, $item${index})`);
            params[`item${index}`] = toRecordId(item);
          });

          conditions.push(`(${orX.join(' OR ')})`);
        }

        const wasteQuery = `
          SELECT 
            id,
            created_at,
            invoice_number,
            created_by.name AS user_name,
            items
          FROM ${Tables.waste}
          ${conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""}
          ORDER BY created_at ASC
          FETCH items, items.item, items.item.categories, created_by
        `;

        const result: any = await queryRef.current(wasteQuery, params);
        const wastes = (result?.[0] ?? []) as any[];

        const allWasteItems: WasteItem[] = [];

        wastes.forEach((waste: any) => {
          const items = waste.items || [];
          items.forEach((item: any) => {
            const quantity = safeNumber(item.quantity);

            allWasteItems.push({
              date: waste.created_at || "",
              wasteNumber: waste.invoice_number ? `#${waste.invoice_number}` : "N/A",
              item: item.item?.name || "Unknown",
              itemCode: item.item?.barcode || item.barcode || undefined,
              category: item.item?.categories?.[0]?.name || "Uncategorized",
              quantity: quantity,
              unit: item.purchase_unit || item.item?.purchase_unit || "",
              user: waste.user_name || waste.created_by?.name || "Unknown",
              comments: item.comments || undefined,
            });
          });
        });

        setWasteItems(allWasteItems);
      } catch (err) {
        console.error("Failed to load waste report", err);
        setError(err instanceof Error ? err.message : "Unable to load report");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.startDate, filters.endDate, filters.itemIds, filters.userIds]);

  const totals = useMemo(() => {
    return wasteItems.reduce(
      (acc, item) => {
        acc.totalQuantity += item.quantity;
        acc.itemCount += 1;
        return acc;
      },
      {
        totalQuantity: 0,
        itemCount: 0,
      }
    );
  }, [wasteItems]);

  if (loading) {
    return (
      <ReportsLayout title="Waste Report" subtitle={subtitle}>
        <div className="py-12 text-center text-neutral-500">Loading waste report…</div>
      </ReportsLayout>
    );
  }

  if (error) {
    return (
      <ReportsLayout title="Waste Report" subtitle={subtitle}>
        <div className="py-12 text-center text-danger-600">Failed to load report: {error}</div>
      </ReportsLayout>
    );
  }

  return (
    <ReportsLayout title="Waste Report" subtitle={subtitle}>
      <div className="space-y-8">
        {/* Summary Totals */}
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <h3 className="bg-neutral-100 px-6 py-3 text-sm font-semibold text-neutral-700">Summary</h3>
          <div className="p-4">
            <table className="min-w-full text-sm">
              <tbody className="divide-y divide-neutral-100">
                <tr>
                  <td className="py-2 text-neutral-700">Total Waste Records</td>
                  <td className="py-2 text-right font-semibold text-neutral-900">{formatNumber(wasteItems.length)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-neutral-700">Total Quantity Wasted</td>
                  <td className="py-2 text-right font-semibold text-neutral-900">{formatNumber(totals.totalQuantity)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Waste Details Table */}
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <h3 className="bg-neutral-100 px-6 py-3 text-sm font-semibold text-neutral-700">Waste Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="py-3 pl-6 pr-3 text-left text-xs font-semibold text-neutral-700">Date</th>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-700">Invoice #</th>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-700">Item</th>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-700">Category</th>
                  <th className="py-3 px-3 text-right text-xs font-semibold text-neutral-700">Quantity</th>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-700">User</th>
                  <th className="py-3 pr-6 text-left text-xs font-semibold text-neutral-700">Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {wasteItems.length > 0 ? (
                  wasteItems.map((item, index) => (
                    <tr key={`${item.date}-${item.item}-${index}`}>
                      <td className="py-3 pl-6 pr-3 text-sm text-neutral-700">
                        {item.date ? new Date(item.date).toLocaleDateString() : ""}
                      </td>
                      <td className="py-3 px-3 text-sm text-neutral-700">{item.wasteNumber}</td>
                      <td className="py-3 px-3 text-sm font-medium text-neutral-800">
                        {item.item}{item.itemCode ? ` (${item.itemCode})` : ""}
                      </td>
                      <td className="py-3 px-3 text-sm text-neutral-700">{item.category}</td>
                      <td className="py-3 px-3 text-right text-sm text-neutral-700">
                        {formatNumber(item.quantity)} {item.unit}
                      </td>
                      <td className="py-3 px-3 text-sm text-neutral-700">{item.user}</td>
                      <td className="py-3 pr-6 text-sm text-neutral-700">{item.comments || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-sm text-neutral-500">
                      No waste records found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
              {wasteItems.length > 0 && (
                <tfoot className="bg-neutral-50">
                  <tr>
                    <td colSpan={4} className="py-3 pl-6 pr-3 text-sm font-semibold text-neutral-900">Total</td>
                    <td className="py-3 px-3 text-right text-sm font-bold text-neutral-900">
                      {formatNumber(totals.totalQuantity)}
                    </td>
                    <td colSpan={2}></td>
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
