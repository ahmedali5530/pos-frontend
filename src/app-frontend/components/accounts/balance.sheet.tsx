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
import {getAccountHeadType, toAccountBalance, toQueryDateTime, toStoreRecordId} from "./reports.utils";

interface BalanceSheetRow {
  account: {
    code: string;
    name: string;
    account_type?: string;
    group?: {head_type?: string; normal_balance?: string};
    normal_balance?: string;
  };
  total_debit: number;
  total_credit: number;
}

export const BalanceSheet = () => {
  const db = useDB();
  const [{store}] = useAtom(appState);
  const [rows, setRows] = useState<BalanceSheetRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [asOf, setAsOf] = useState(DateTime.now().toFormat("yyyy-MM-dd'T'HH:mm"));

  const loadBalanceSheet = async (event?: any) => {
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
            AND entry.date <= <datetime>$as_of
          GROUP BY account
          ORDER BY account.code ASC
          FETCH account, account.group
        `,
        {
          store: toStoreRecordId(store.id),
          as_of: toQueryDateTime(asOf),
        }
      );
      setRows(result || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBalanceSheet();
  }, [store?.id]);

  const summary = useMemo(() => {
    const sections = {
      asset: [] as Array<BalanceSheetRow & {balance: number}>,
      liability: [] as Array<BalanceSheetRow & {balance: number}>,
      equity: [] as Array<BalanceSheetRow & {balance: number}>,
    };

    rows.forEach((row) => {
      const head = getAccountHeadType(row.account);
      if (!head || !["asset", "liability", "equity"].includes(head)) {
        return;
      }
      const normalBalance = row.account?.normal_balance || row.account?.group?.normal_balance;
      const rowWithBalance = {
        ...row,
        balance: toAccountBalance(
          Number(row.total_debit || 0),
          Number(row.total_credit || 0),
          normalBalance
        ),
      };

      if (head === "asset") {
        sections.asset.push(rowWithBalance);
      } else if (head === "liability") {
        sections.liability.push(rowWithBalance);
      } else if (head === "equity") {
        sections.equity.push(rowWithBalance);
      }
    });

    const totalAssets = sections.asset.reduce((sum, row) => sum + row.balance, 0);
    const totalLiabilities = sections.liability.reduce((sum, row) => sum + row.balance, 0);
    const totalEquity = sections.equity.reduce((sum, row) => sum + row.balance, 0);

    return {
      sections,
      totalAssets,
      totalLiabilities,
      totalEquity,
      rhs: totalLiabilities + totalEquity,
    };
  }, [rows]);

  return (
    <>
      <form className="grid grid-cols-4 gap-4 mb-4" onSubmit={loadBalanceSheet}>
        <div className="col-span-3">
          <Input
            type="datetime-local"
            className="w-full"
            value={asOf}
            onChange={(e) => setAsOf(e.target.value)}
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
        <div className="grid grid-cols-3 gap-4">
          {[
            {key: "asset", title: "Assets", rows: summary.sections.asset, total: summary.totalAssets},
            {key: "liability", title: "Liabilities", rows: summary.sections.liability, total: summary.totalLiabilities},
            {key: "equity", title: "Equity", rows: summary.sections.equity, total: summary.totalEquity},
          ].map((section) => (
            <div key={section.key} className="border rounded-lg bg-white">
              <div className="border-b p-3 font-semibold">{section.title}</div>
              <div className="p-3 space-y-2">
                {section.rows.map((row, index) => (
                  <div key={`${row.account?.code || section.key}-${index}`} className="flex justify-between">
                    <span>{row.account?.code} - {row.account?.name}</span>
                    <span>{formatMoney(row.balance)}</span>
                  </div>
                ))}
                {section.rows.length === 0 && <div className="text-gray-500">No data.</div>}
              </div>
              <div className="border-t p-3 font-semibold flex justify-between">
                <span>Total {section.title}</span>
                <span>{formatMoney(section.total)}</span>
              </div>
            </div>
          ))}

          <div className="col-span-3 border rounded-lg bg-primary-50 border-primary-200 p-4 font-semibold">
            <div className="flex justify-between">
              <span>Accounting Equation Check (Assets vs Liabilities + Equity)</span>
              <span>{formatMoney(summary.totalAssets)} vs {formatMoney(summary.rhs)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
