import {useEffect, useMemo, useState} from "react";
import {DateTime} from "luxon";
import {Controller, useForm} from "react-hook-form";
import {useAtom} from "jotai";
import useApi, {SettingsData} from "../../../api/db/use.api";
import {Account} from "../../../api/model/account";
import {Tables} from "../../../api/db/tables";
import {appState} from "../../../store/jotai";
import {ReactSelect} from "../../../app-common/components/input/custom.react.select";
import {Input} from "../../../app-common/components/input/input";
import {Button} from "../../../app-common/components/input/button";
import {Loader} from "../../../app-common/components/loader/loader";
import {useDB} from "../../../api/db/db";
import {formatMoney} from "./account.constants";
import {computeRunningBalances, isCustomerAccount, toQueryDateTime, toStoreRecordId} from "./reports.utils";

interface StatementRow {
  id: string;
  debit: number;
  credit: number;
  description?: string;
  entry?: {
    entry_number?: number;
    date?: string | Date;
    memo?: string;
  };
  running_balance?: number;
}

export const CustomerStatement = () => {
  const db = useDB();
  const [{store}] = useAtom(appState);
  const [rows, setRows] = useState<StatementRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);
  const [filters, setFilters] = useState({
    date_from: DateTime.now().startOf("month").toFormat("yyyy-MM-dd'T'HH:mm"),
    date_to: DateTime.now().endOf("month").toFormat("yyyy-MM-dd'T'HH:mm"),
  });
  const {control, watch} = useForm({
    defaultValues: {
      account: null as {label: string; value: string} | null,
    }
  });
  const selectedAccount = watch("account");

  const accountHook = useApi<SettingsData<Account>>(
    Tables.account,
    [`store = ${store?.id} and is_active = true`],
    ["code ASC"],
    0,
    9999,
    ["group"],
  );

  const accountOptions = useMemo(() => {
    return (accountHook.data?.data || [])
      .filter((account) => isCustomerAccount(account))
      .map((account) => ({
        label: `${account.code} - ${account.name}`,
        value: account.id.toString(),
      }));
  }, [accountHook.data?.data]);

  const loadStatement = async (event?: any) => {
    event?.preventDefault?.();
    if (!store?.id || !selectedAccount?.value) {
      setRows([]);
      setOpeningBalance(0);
      setClosingBalance(0);
      return;
    }

    setIsLoading(true);
    try {
      const params = {
        store: toStoreRecordId(store.id),
        account: toStoreRecordId(selectedAccount.value),
        date_from: toQueryDateTime(filters.date_from),
        date_to: toQueryDateTime(filters.date_to),
      };

      const [openingRows] = await db.query(
        `
          SELECT math::sum(debit - credit) as opening
          FROM ${Tables.account_journal_line}
          WHERE entry.store = $store
            AND account = $account
            AND entry.date < <datetime>$date_from
          GROUP ALL
        `,
        params
      );
      const opening = Number(openingRows?.[0]?.opening || 0);

      const [lineRows] = await db.query(
        `
          SELECT *
          FROM ${Tables.account_journal_line}
          WHERE entry.store = $store
            AND account = $account
            AND entry.date >= <datetime>$date_from
            AND entry.date <= <datetime>$date_to
          ORDER BY entry.date ASC
          FETCH entry
        `,
        params
      );

      const withRunning = computeRunningBalances(opening, lineRows || []);
      setOpeningBalance(opening);
      setRows(withRunning);
      setClosingBalance(withRunning.length > 0 ? Number(withRunning[withRunning.length - 1].running_balance || 0) : opening);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setRows([]);
    setOpeningBalance(0);
    setClosingBalance(0);
  }, [selectedAccount?.value]);

  return (
    <>
      <form className="grid grid-cols-8 gap-4 mb-4" onSubmit={loadStatement}>
        <div className="col-span-2">
          <Controller
            control={control}
            name="account"
            render={({field}) => (
              <ReactSelect
                {...field}
                options={accountOptions}
                placeholder="Select customer account"
              />
            )}
          />
        </div>
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
        <div className="col-span-2">
          <Button variant="primary" type="submit" className="w-full" disabled={isLoading || !selectedAccount?.value}>
            {isLoading ? "Loading..." : "Load"}
          </Button>
        </div>
      </form>

      {!selectedAccount?.value && (
        <div className="text-sm text-warning-700 mb-3">
          Customer statements assume customer-specific accounts (code/name containing customer or cust).
        </div>
      )}

      {isLoading && <Loader lines={8} lineItems={4}/>}

      {!isLoading && selectedAccount?.value && (
        <div className="border rounded-lg bg-white">
          <div className="p-3 border-b grid grid-cols-3 gap-3 text-sm">
            <div>Opening Balance: <strong>{formatMoney(openingBalance)}</strong></div>
            <div>Total Debits: <strong>{formatMoney(rows.reduce((sum, row) => sum + Number(row.debit || 0), 0))}</strong></div>
            <div>Total Credits: <strong>{formatMoney(rows.reduce((sum, row) => sum + Number(row.credit || 0), 0))}</strong></div>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
              <tr>
                <th>Date</th>
                <th>Entry #</th>
                <th>Description</th>
                <th className="text-right">Debit</th>
                <th className="text-right">Credit</th>
                <th className="text-right">Running Balance</th>
              </tr>
              </thead>
              <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.id || "row"}-${index}`}>
                  <td>{row.entry?.date ? DateTime.fromJSDate(new Date(row.entry.date)).toFormat("yyyy-LL-dd HH:mm") : "-"}</td>
                  <td>{row.entry?.entry_number || "-"}</td>
                  <td>{row.description || row.entry?.memo || "-"}</td>
                  <td className="text-right">{formatMoney(Number(row.debit || 0))}</td>
                  <td className="text-right">{formatMoney(Number(row.credit || 0))}</td>
                  <td className="text-right">{formatMoney(Number(row.running_balance || 0))}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500">No statement entries for selected filters.</td>
                </tr>
              )}
              </tbody>
              <tfoot>
              <tr className="font-bold">
                <td colSpan={5}>Closing Balance</td>
                <td className="text-right">{formatMoney(closingBalance)}</td>
              </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </>
  );
};
