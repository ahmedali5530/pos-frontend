import {useEffect, useMemo, useState} from "react";
import {DateTime} from "luxon";
import {useAtom} from "jotai";
import {Input} from "../../../app-common/components/input/input";
import {Button} from "../../../app-common/components/input/button";
import {Loader} from "../../../app-common/components/loader/loader";
import {useDB} from "../../../api/db/db";
import {Tables} from "../../../api/db/tables";
import {appState} from "../../../store/jotai";
import {formatMoney} from "./account.constants";
import {classifyCashFlowBucket, isCashGroupAccount, toQueryDateTime, toStoreRecordId} from "./reports.utils";

interface CashFlowRow {
  source_module?: string;
  total_debit: number;
  total_credit: number;
}

export const CashFlow = () => {
  const db = useDB();
  const [{store}] = useAtom(appState);
  const [rows, setRows] = useState<CashFlowRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    date_from: DateTime.now().startOf("month").toFormat("yyyy-MM-dd'T'HH:mm"),
    date_to: DateTime.now().endOf("month").toFormat("yyyy-MM-dd'T'HH:mm"),
  });

  const loadCashFlow = async (event?: any) => {
    event?.preventDefault?.();
    if (!store?.id) {
      setRows([]);
      return;
    }

    setIsLoading(true);
    try {
      const [lineRows] = await db.query(
        `
          SELECT
            entry.source_module as source_module,
            debit,
            credit,
            account
          FROM ${Tables.account_journal_line}
          WHERE entry.store = $store
            AND entry.date >= <datetime>$date_from
            AND entry.date <= <datetime>$date_to
          FETCH account, account.group, entry
        `,
        {
          store: toStoreRecordId(store.id),
          date_from: toQueryDateTime(filters.date_from),
          date_to: toQueryDateTime(filters.date_to),
        }
      );

      const grouped: Record<string, CashFlowRow> = {};
      (lineRows || []).forEach((line: any) => {
        if (!isCashGroupAccount(line.account)) {
          return;
        }
        const key = line.entry?.source_module || line.source_module || "unclassified";
        if (!grouped[key]) {
          grouped[key] = {source_module: key, total_debit: 0, total_credit: 0};
        }
        grouped[key].total_debit += Number(line.debit || 0);
        grouped[key].total_credit += Number(line.credit || 0);
      });
      setRows(Object.values(grouped));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCashFlow();
  }, [store?.id]);

  const buckets = useMemo(() => {
    const grouped = {
      Operating: 0,
      Investing: 0,
      Financing: 0,
    };

    rows.forEach((row) => {
      const net = Number(row.total_debit || 0) - Number(row.total_credit || 0);
      const bucket = classifyCashFlowBucket(row.source_module);
      grouped[bucket] += net;
    });

    return grouped;
  }, [rows]);

  const netCashFlow = buckets.Operating + buckets.Investing + buckets.Financing;

  return (
    <>
      <form className="grid grid-cols-5 gap-4 mb-4" onSubmit={loadCashFlow}>
        <div className="col-span-2">
          <Input
            type="datetime-local"
            className="w-full"
            value={filters.date_from}
            onChange={(e) => setFilters((prev) => ({...prev, date_from: e.target.value}))}
          />
        </div>
        <div className="col-span-2">
          <Input
            type="datetime-local"
            className="w-full"
            value={filters.date_to}
            onChange={(e) => setFilters((prev) => ({...prev, date_to: e.target.value}))}
          />
        </div>
        <div>
          <Button variant="primary" type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Loading..." : "Load"}
          </Button>
        </div>
      </form>

      {isLoading && <Loader lines={8} lineItems={4}/>}

      {!isLoading && (
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg bg-white">
            <div className="border-b p-3 font-semibold">Cash Flow By Source Module</div>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                <tr>
                  <th>Source Module</th>
                  <th>Bucket</th>
                  <th className="text-right">Net Cash</th>
                </tr>
                </thead>
                <tbody>
                {rows.map((row, index) => {
                  const net = Number(row.total_debit || 0) - Number(row.total_credit || 0);
                  return (
                    <tr key={`${row.source_module || "source"}-${index}`}>
                      <td>{row.source_module || "unclassified"}</td>
                      <td>{classifyCashFlowBucket(row.source_module)}</td>
                      <td className="text-right">{formatMoney(net)}</td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-gray-500">No cash flow rows for selected range.</td>
                  </tr>
                )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border rounded-lg bg-white">
            <div className="border-b p-3 font-semibold">Cash Flow Summary</div>
            <div className="p-3 space-y-3">
              <div className="flex justify-between">
                <span>Operating</span>
                <span>{formatMoney(buckets.Operating)}</span>
              </div>
              <div className="flex justify-between">
                <span>Investing</span>
                <span>{formatMoney(buckets.Investing)}</span>
              </div>
              <div className="flex justify-between">
                <span>Financing</span>
                <span>{formatMoney(buckets.Financing)}</span>
              </div>
              <div className="border-t pt-3 font-semibold flex justify-between">
                <span>Net Cash Movement</span>
                <span>{formatMoney(netCashFlow)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
