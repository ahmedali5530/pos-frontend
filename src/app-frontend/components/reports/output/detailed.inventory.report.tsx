import {useEffect, useMemo, useRef, useState} from "react";
import {useDB} from "../../../../api/db/db";
import {Tables} from "../../../../api/db/tables";
import {ReportsLayout} from "../../../containers/layout/reports.layout";
import {formatNumber} from "../../../../lib/currency/currency";
import {toRecordId} from "../../../../api/model/common";

const safeNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

type TransactionType = 'Purchase' | 'Purchase Return' | 'Sale' | 'Sale Return' | 'Waste';

type InventoryTransaction = {
  date: string;
  item: string;
  itemCode?: string;
  itemId: string;
  category: string;
  quantity: number;
  unit: string;
  type: TransactionType;
  user?: string;
  comments?: string;
  store: string;
};

type ItemBalance = {
  itemId: string;
  itemName: string;
  itemCode?: string;
  category: string;
  unit: string;
  purchase: number;
  purchaseReturn: number;
  sale: number;
  saleReturn: number;
  waste: number;
  balance: number;
};

interface ReportFilters {
  startDate?: string | null;
  endDate?: string | null;
  itemIds: string[];
  types: string[];
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
    types: parseMulti('types'),
  };
};

export const DetailedInventoryReport = () => {
  const db = useDB();
  const queryRef = useRef(db.query);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [itemBalances, setItemBalances] = useState<ItemBalance[]>([]);
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

        const buildConditions = (prefix: string = ''): { conditions: string[], params: Record<string, any> } => {
          const conditions: string[] = [];
          const params: Record<string, any> = {};

          if (filters.startDate) {
            conditions.push(`time::format(${prefix}created_at, "%Y-%m-%d") >= $startDate`);
            params.startDate = filters.startDate;
          }

          if (filters.endDate) {
            conditions.push(`time::format(${prefix}created_at, "%Y-%m-%d") <= $endDate`);
            params.endDate = filters.endDate;
          }

          if (filters.itemIds.length > 0) {
            const orX = [];
            filters.itemIds.forEach((item, index) => {
              orX.push(`array::any(${prefix}items.item.id, $item${index})`);
              params[`item${index}`] = toRecordId(item);
            });

            conditions.push(`(${orX.join(' OR ')})`);
          }

          return { conditions, params };
        };

        // Build purchase query
        const purchaseConditions = buildConditions('');

        const purchaseQuery = `
          SELECT 
            id,
            created_at,
            store.name AS store_name,
            purchased_by.name AS user_name,
            items
          FROM ${Tables.purchase}
          ${purchaseConditions.conditions.length > 0 ? `WHERE ${purchaseConditions.conditions.join(" AND ")}` : ""}
          ORDER BY created_at ASC
          FETCH items, items.item, items.item.categories, purchased_by, store
        `;

        // Build purchase return query
        const returnConditions = buildConditions('');
        const purchaseReturnQuery = `
          SELECT 
            id,
            created_at,
            store.name AS store_name,
            created_by.name AS user_name,
            items
          FROM ${Tables.purchase_return}
          ${returnConditions.conditions.length > 0 ? `WHERE ${returnConditions.conditions.join(" AND ")}` : ""}
          ORDER BY created_at ASC
          FETCH items, items.item, items.item.categories, created_by, store
        `;

        // Build waste query
        const wasteConditions = buildConditions('');
        const wasteQuery = `
          SELECT
            id,
            created_at,
            store.name AS store_name,
            created_by.name AS user_name,
            items
          FROM ${Tables.waste}
          ${wasteConditions.conditions.length > 0 ? `WHERE ${wasteConditions.conditions.join(" AND ")}` : ""}
          ORDER BY created_at ASC
          FETCH items, items.item, items.item.categories, created_by, store
        `;

        // Build sales query (only completed orders)
        const saleConditions = buildConditions('');
        const saleQuery = `
          SELECT
            id,
            order_id,
            created_at,
            store.name AS store_name,
            user.name AS user_name,
            items,
            status
          FROM ${Tables.order}
          ${saleConditions.conditions.length > 0 ? `WHERE ${saleConditions.conditions.join(" AND ")}` : ""}
          AND status IN ['Completed', 'Returned']
          ORDER BY created_at ASC
          FETCH items, items.product, items.product.categories, user, store
        `;

        const [purchaseResult, returnResult, wasteResult, saleResult] = await Promise.all([
          queryRef.current(purchaseQuery, purchaseConditions.params),
          queryRef.current(purchaseReturnQuery, returnConditions.params),
          queryRef.current(wasteQuery, wasteConditions.params),
          queryRef.current(saleQuery, saleConditions.params),
        ]);

        const purchases = (purchaseResult?.[0] ?? []) as any[];
        const purchaseReturns = (returnResult?.[0] ?? []) as any[];
        const wastes = (wasteResult?.[0] ?? []) as any[];
        const sales = (saleResult?.[0] ?? []) as any[];

        const allTransactions: InventoryTransaction[] = [];

        // Process purchase items
        purchases.forEach((purchase: any) => {
          const items = purchase.items || [];
          items.forEach((item: any) => {
            const itemId = typeof item.item?.id === "string"
              ? item.item.id
              : item.item?.id?.toString?.() ?? String(item.item?.id ?? "");
            
            allTransactions.push({
              date: purchase.created_at || "",
              item: item.item?.name || "Unknown",
              itemCode: item.item?.barcode || undefined,
              itemId: itemId,
              category: item.item?.categories?.[0]?.name || "Uncategorized",
              quantity: safeNumber(item.quantity),
              unit: item.purchase_unit || item.item?.purchase_unit || "",
              type: "Purchase",
              user: purchase.user_name || purchase.purchased_by?.name || "",
              comments: item.comments || undefined,
              store: purchase.store_name || purchase.store?.name || "Unknown",
            });
          });
        });

        // Process purchase return items
        purchaseReturns.forEach((purchaseReturn: any) => {
          const items = purchaseReturn.items || [];
          items.forEach((item: any) => {
            const itemId = typeof item.item?.id === "string"
              ? item.item.id
              : item.item?.id?.toString?.() ?? String(item.item?.id ?? "");
            
            allTransactions.push({
              date: purchaseReturn.created_at || "",
              item: item.item?.name || "Unknown",
              itemCode: item.item?.barcode || undefined,
              itemId: itemId,
              category: item.item?.categories?.[0]?.name || "Uncategorized",
              quantity: safeNumber(item.quantity),
              unit: item.purchase_unit || item.item?.purchase_unit || "",
              type: "Purchase Return",
              user: purchaseReturn.user_name || purchaseReturn.created_by?.name || "",
              comments: item.comments || undefined,
              store: purchaseReturn.store_name || purchaseReturn.store?.name || "Unknown",
            });
          });
        });

        // Process waste items
        wastes.forEach((waste: any) => {
          const items = waste.items || [];
          items.forEach((item: any) => {
            const itemId = typeof item.item?.id === "string"
              ? item.item.id
              : item.item?.id?.toString?.() ?? String(item.item?.id ?? "");

            allTransactions.push({
              date: waste.created_at || "",
              item: item.item?.name || "Unknown",
              itemCode: item.item?.barcode || undefined,
              itemId: itemId,
              category: item.item?.categories?.[0]?.name || "Uncategorized",
              quantity: safeNumber(item.quantity),
              unit: item.purchase_unit || item.item?.purchase_unit || "",
              type: "Waste",
              user: waste.user_name || waste.created_by?.name || "",
              comments: item.comments || undefined,
              store: waste.store_name || waste.store?.name || "Unknown",
            });
          });
        });

        // Process sales (completed orders)
        sales.forEach((order: any) => {
          if (order.status === 'Completed') {
            const items = order.items || [];
            items.forEach((item: any) => {
              const itemId = typeof item.product?.id === "string"
                ? item.product.id
                : item.product?.id?.toString?.() ?? String(item.product?.id ?? "");

              allTransactions.push({
                date: order.created_at || "",
                item: item.product?.name || "Unknown",
                itemCode: item.product?.barcode || undefined,
                itemId: itemId,
                category: item.product?.categories?.[0]?.name || "Uncategorized",
                quantity: safeNumber(item.quantity),
                unit: item.product?.purchase_unit || "",
                type: "Sale",
                user: order.user_name || order.user?.name || "",
                comments: order.notes || undefined,
                store: order.store_name || order.store?.name || "Unknown",
              });
            });
          }
          
          // Process sale returns (returned orders)
          if (order.status === 'Returned') {
            const items = order.items || [];
            items.forEach((item: any) => {
              const itemId = typeof item.product?.id === "string"
                ? item.product.id
                : item.product?.id?.toString?.() ?? String(item.product?.id ?? "");

              allTransactions.push({
                date: order.created_at || "",
                item: item.product?.name || "Unknown",
                itemCode: item.product?.barcode || undefined,
                itemId: itemId,
                category: item.product?.categories?.[0]?.name || "Uncategorized",
                quantity: safeNumber(item.quantity),
                unit: item.product?.purchase_unit || "",
                type: "Sale Return",
                user: order.user_name || order.user?.name || "",
                comments: order.notes || undefined,
                store: order.store_name || order.store?.name || "Unknown",
              });
            });
          }
        });

        // Filter by selected types if provided
        let filteredTransactions = allTransactions;
        if (filters.types.length > 0) {
          filteredTransactions = filteredTransactions.filter(transaction =>
            filters.types.includes(transaction.type)
          );
        }

        // Sort by date ascending
        filteredTransactions.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (dateA !== dateB) {
            return dateA - dateB;
          }
          return a.item.localeCompare(b.item);
        });

        // Calculate accumulation for each item
        const itemAccumulation = new Map<string, {
          itemName: string;
          itemCode?: string;
          category: string;
          unit: string;
          purchase: number;
          purchaseReturn: number;
          sale: number;
          saleReturn: number;
          waste: number;
        }>();

        filteredTransactions.forEach(transaction => {
          if (!itemAccumulation.has(transaction.itemId)) {
            itemAccumulation.set(transaction.itemId, {
              itemName: transaction.item,
              itemCode: transaction.itemCode,
              category: transaction.category,
              unit: transaction.unit,
              purchase: 0,
              purchaseReturn: 0,
              sale: 0,
              saleReturn: 0,
              waste: 0,
            });
          }

          const acc = itemAccumulation.get(transaction.itemId)!;
          switch (transaction.type) {
            case "Purchase":
              acc.purchase += transaction.quantity;
              break;
            case "Purchase Return":
              acc.purchaseReturn += transaction.quantity;
              break;
            case "Sale":
              acc.sale += transaction.quantity;
              break;
            case "Sale Return":
              acc.saleReturn += transaction.quantity;
              break;
            case "Waste":
              acc.waste += transaction.quantity;
              break;
          }
        });

        // Create balance summary
        const balanceSummary: ItemBalance[] = Array.from(itemAccumulation.entries()).map(([itemId, acc]) => ({
          itemId,
          itemName: acc.itemName,
          itemCode: acc.itemCode,
          category: acc.category,
          unit: acc.unit,
          purchase: acc.purchase,
          purchaseReturn: acc.purchaseReturn,
          sale: acc.sale,
          saleReturn: acc.saleReturn,
          waste: acc.waste,
          balance: acc.purchase - acc.purchaseReturn - acc.sale + acc.saleReturn - acc.waste,
        })).sort((a, b) => a.itemName.localeCompare(b.itemName));

        setTransactions(filteredTransactions);
        setItemBalances(balanceSummary);
      } catch (err) {
        console.error("Failed to load detailed inventory report", err);
        setError(err instanceof Error ? err.message : "Unable to load report");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.startDate, filters.endDate, filters.itemIds, filters.types]);

  const totals = useMemo(() => {
    return itemBalances.reduce(
      (acc, item) => {
        acc.totalPurchase += item.purchase;
        acc.totalPurchaseReturn += item.purchaseReturn;
        acc.totalSale += item.sale;
        acc.totalSaleReturn += item.saleReturn;
        acc.totalWaste += item.waste;
        acc.totalBalance += item.balance;
        acc.itemCount += 1;
        return acc;
      },
      {
        totalPurchase: 0,
        totalPurchaseReturn: 0,
        totalSale: 0,
        totalSaleReturn: 0,
        totalWaste: 0,
        totalBalance: 0,
        itemCount: 0,
      }
    );
  }, [itemBalances]);

  if (loading) {
    return (
      <ReportsLayout title="Detailed Inventory" subtitle={subtitle}>
        <div className="py-12 text-center text-neutral-500">Loading inventory report…</div>
      </ReportsLayout>
    );
  }

  if (error) {
    return (
      <ReportsLayout title="Detailed Inventory" subtitle={subtitle}>
        <div className="py-12 text-center text-danger-600">Failed to load report: {error}</div>
      </ReportsLayout>
    );
  }

  return (
    <ReportsLayout title="Detailed Inventory" subtitle={subtitle}>
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
                <tr>
                  <td className="py-2 text-neutral-700">Total Purchased</td>
                  <td className="py-2 text-right font-semibold text-success-600">{formatNumber(totals.totalPurchase)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-neutral-700">Total Purchase Returns</td>
                  <td className="py-2 text-right font-semibold text-warning-600">{formatNumber(totals.totalPurchaseReturn)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-neutral-700">Total Sales</td>
                  <td className="py-2 text-right font-semibold text-primary-600">{formatNumber(totals.totalSale)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-neutral-700">Total Sale Returns</td>
                  <td className="py-2 text-right font-semibold text-info-600">{formatNumber(totals.totalSaleReturn)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-neutral-700">Total Waste</td>
                  <td className="py-2 text-right font-semibold text-danger-600">{formatNumber(totals.totalWaste)}</td>
                </tr>
                <tr className="border-t-2 border-neutral-300">
                  <td className="py-2 font-semibold text-neutral-900">Net Balance</td>
                  <td className="py-2 text-right font-bold text-neutral-900">{formatNumber(totals.totalBalance)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Item Balances Table */}
        {itemBalances.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-neutral-200">
            <h3 className="bg-neutral-100 px-6 py-3 text-sm font-semibold text-neutral-700">Item Balances</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="py-3 pl-6 pr-3 text-left text-xs font-semibold text-neutral-700">Item</th>
                    <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-700">Category</th>
                    <th className="py-3 px-3 text-right text-xs font-semibold text-success-700">Purchased</th>
                    <th className="py-3 px-3 text-right text-xs font-semibold text-warning-700">Returns</th>
                    <th className="py-3 px-3 text-right text-xs font-semibold text-primary-700">Sales</th>
                    <th className="py-3 px-3 text-right text-xs font-semibold text-info-700">Sale Returns</th>
                    <th className="py-3 px-3 text-right text-xs font-semibold text-danger-700">Waste</th>
                    <th className="py-3 pr-6 text-right text-xs font-semibold text-neutral-700">Net Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {itemBalances.map((itemBalance) => (
                    <tr key={itemBalance.itemId}>
                      <td className="py-4 pl-6 pr-3 text-sm font-medium text-neutral-800">
                        {itemBalance.itemName}{itemBalance.itemCode ? ` (${itemBalance.itemCode})` : ""}
                      </td>
                      <td className="py-4 px-3 text-sm text-neutral-700">{itemBalance.category}</td>
                      <td className="py-4 px-3 text-right text-sm text-success-600">{formatNumber(itemBalance.purchase)}</td>
                      <td className="py-4 px-3 text-right text-sm text-warning-600">{formatNumber(itemBalance.purchaseReturn)}</td>
                      <td className="py-4 px-3 text-right text-sm text-primary-600">{formatNumber(itemBalance.sale)}</td>
                      <td className="py-4 px-3 text-right text-sm text-info-600">{formatNumber(itemBalance.saleReturn)}</td>
                      <td className="py-4 px-3 text-right text-sm text-danger-600">{formatNumber(itemBalance.waste)}</td>
                      <td className="py-4 pr-6 text-right text-sm font-bold text-neutral-900">
                        {formatNumber(itemBalance.balance)} {itemBalance.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <h3 className="bg-neutral-100 px-6 py-3 text-sm font-semibold text-neutral-700">Transaction History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="py-3 pl-6 pr-3 text-left text-xs font-semibold text-neutral-700">Date</th>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-700">Item</th>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-700">Category</th>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-700">Store</th>
                  <th className="py-3 px-3 text-right text-xs font-semibold text-neutral-700">Quantity</th>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-700">Type</th>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-700">User</th>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-700">Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {transactions.length > 0 ? (
                  transactions.map((transaction, index) => (
                    <tr key={`${transaction.date}-${transaction.itemId}-${transaction.type}-${index}`}>
                      <td className="py-3 pl-6 pr-3 text-sm text-neutral-700">
                        {transaction.date ? new Date(transaction.date).toLocaleDateString() : ""}
                      </td>
                      <td className="py-3 px-3 text-sm font-medium text-neutral-800">
                        {transaction.item}{transaction.itemCode ? ` (${transaction.itemCode})` : ""}
                      </td>
                      <td className="py-3 px-3 text-sm text-neutral-700">{transaction.category}</td>
                      <td className="py-3 px-3 text-sm text-neutral-700">{transaction.store}</td>
                      <td className="py-3 px-3 text-right text-sm text-neutral-700">
                        {formatNumber(transaction.quantity)} {transaction.unit}
                      </td>
                      <td className="py-3 px-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          transaction.type === 'Purchase' ? 'bg-success-100 text-success-800' :
                          transaction.type === 'Purchase Return' ? 'bg-warning-100 text-warning-800' :
                          transaction.type === 'Sale' ? 'bg-primary-100 text-primary-800' :
                          transaction.type === 'Sale Return' ? 'bg-info-100 text-info-800' :
                          transaction.type === 'Waste' ? 'bg-danger-100 text-danger-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-sm text-neutral-700">{transaction.user || "-"}</td>
                      <td className="py-3 px-3 text-sm text-neutral-700">{transaction.comments || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-sm text-neutral-500">
                      No inventory transactions found for the selected period.
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
