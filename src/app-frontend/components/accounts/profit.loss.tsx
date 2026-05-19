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
import {getAccountHeadType, toQueryDateTime, toStoreRecordId} from "./reports.utils";

interface ProfitLossRow {
  account: {
    code: string;
    name: string;
    account_type?: string;
    group?: {head_type?: string};
  };
  total_debit: number;
  total_credit: number;
}

export const ProfitLoss = () => {
  const db = useDB();
  const [{store}] = useAtom(appState);
  const [rows, setRows] = useState<ProfitLossRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    date_from: DateTime.now().startOf("month").toFormat("yyyy-MM-dd'T'HH:mm"),
    date_to: DateTime.now().endOf("month").toFormat("yyyy-MM-dd'T'HH:mm"),
  });

  const loadProfitLoss = async (event?: any) => {
    event?.preventDefault?.();
    if (!store?.id) {
      setRows([]);
      return;
    }

    setIsLoading(true);
    try {
      const [result] = await db.query(
        `
          SELECT *,
                 account,
                 math::sum(debit) as total_debit,
                 math::sum(credit) as total_credit
          FROM ${Tables.account_journal_line}
          WHERE entry.store = $store
            AND entry.date >= <datetime>$date_from
            AND entry.date <= <datetime>$date_to
          GROUP BY account
          ORDER BY account.code ASC
          FETCH account, account.group
        `,
        {
          store: toStoreRecordId(store.id),
          date_from: toQueryDateTime(filters.date_from),
          date_to: toQueryDateTime(filters.date_to),
        }
      );
      setRows(result || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfitLoss();
  }, [store?.id]);

  const {incomeRows, expenseRows, totalIncome, totalExpense, netProfit} = useMemo(() => {
    const plRows = rows.filter((item) => {
      const head = getAccountHeadType(item.account);
      return head === "income" || head === "expense";
    });
    const income = plRows.filter((item) => getAccountHeadType(item.account) === "income");
    const expense = plRows.filter((item) => getAccountHeadType(item.account) === "expense");
    const incomeTotal = income.reduce((sum, item) => sum + (Number(item.total_credit || 0) - Number(item.total_debit || 0)), 0);
    const expenseTotal = expense.reduce((sum, item) => sum + (Number(item.total_debit || 0) - Number(item.total_credit || 0)), 0);

    return {
      incomeRows: income,
      expenseRows: expense,
      totalIncome: incomeTotal,
      totalExpense: expenseTotal,
      netProfit: incomeTotal - expenseTotal,
    };
  }, [rows]);

  return (
    <>
      <form className="grid grid-cols-5 gap-4 mb-4" onSubmit={loadProfitLoss}>
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
            <div className="border-b p-3 font-semibold text-success-700">Income</div>
            <div className="p-3 space-y-2">
              {incomeRows.map((item, index) => (
                <div key={`${item.account?.code || "income"}-${index}`} className="flex justify-between">
                  <span>{item.account?.code} - {item.account?.name}</span>
                  <span>{formatMoney(Number(item.total_credit || 0) - Number(item.total_debit || 0))}</span>
                </div>
              ))}
              {incomeRows.length === 0 && <div className="text-gray-500">No income entries for selected range.</div>}
            </div>
            <div className="border-t p-3 font-semibold flex justify-between">
              <span>Total Income</span>
              <span>{formatMoney(totalIncome)}</span>
            </div>
          </div>

          <div className="border rounded-lg bg-white">
            <div className="border-b p-3 font-semibold text-danger-700">Expense</div>
            <div className="p-3 space-y-2">
              {expenseRows.map((item, index) => (
                <div key={`${item.account?.code || "expense"}-${index}`} className="flex justify-between">
                  <span>{item.account?.code} - {item.account?.name}</span>
                  <span>{formatMoney(Number(item.total_debit || 0) - Number(item.total_credit || 0))}</span>
                </div>
              ))}
              {expenseRows.length === 0 && <div className="text-gray-500">No expense entries for selected range.</div>}
            </div>
            <div className="border-t p-3 font-semibold flex justify-between">
              <span>Total Expense</span>
              <span>{formatMoney(totalExpense)}</span>
            </div>
          </div>

          <div className="col-span-2 border rounded-lg bg-primary-50 border-primary-200 p-4 font-semibold flex justify-between">
            <span>Net Profit / Loss</span>
            <span className={netProfit >= 0 ? "text-success-700" : "text-danger-700"}>
              {formatMoney(netProfit)}
            </span>
          </div>
        </div>
      )}
    </>
  );
};
