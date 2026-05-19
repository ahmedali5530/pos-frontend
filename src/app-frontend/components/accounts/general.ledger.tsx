import {useEffect, useMemo, useState} from "react";
import {DateTime} from "luxon";
import {useAtom} from "jotai";
import {Input} from "../../../app-common/components/input/input";
import {Button} from "../../../app-common/components/input/button";
import {Loader} from "../../../app-common/components/loader/loader";
import {useDB} from "../../../api/db/db";
import {Tables} from "../../../api/db/tables";
import {toRecordId} from "../../../api/model/common";
import {appState} from "../../../store/jotai";
import {formatMoney} from "./account.constants";
import useApi, {SettingsData} from "../../../api/db/use.api";
import {Account} from "../../../api/model/account";
import {Controller, useForm} from "react-hook-form";
import {ReactSelect} from "../../../app-common/components/input/custom.react.select";
import {toQueryDateTime, toStoreRecordId} from "./reports.utils";

interface LedgerRow {
  account: {
    code: string;
    name: string;
  };
  total_debit: number;
  total_credit: number;
  balance: number;
}

export const GeneralLedger = () => {
  const db = useDB();
  const [{store}] = useAtom(appState);
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const {control, watch} = useForm({
    defaultValues: {
      account: null as {label: string; value: string} | null,
    }
  });
  const selectedAccount = watch("account");
  const [filters, setFilters] = useState({
    date_from: DateTime.now().startOf("month").toFormat("yyyy-MM-dd'T'HH:mm"),
    date_to: DateTime.now().endOf("month").toFormat("yyyy-MM-dd'T'HH:mm"),
  });
  const accountHook = useApi<SettingsData<Account>>(
    Tables.account,
    [`store = ${store?.id} and is_active = true`],
    ["code ASC"],
    0,
    9999
  );

  const accountOptions = useMemo(() => {
    return (accountHook.data?.data || []).map((item) => ({
      label: `${item.code} - ${item.name}`,
      value: item.id.toString(),
    }));
  }, [accountHook.data?.data]);

  const loadLedger = async (event?: any) => {
    event?.preventDefault?.();
    if (!store?.id) {
      setRows([]);
      return;
    }

    setIsLoading(true);
    try {
      const where: string[] = ["entry.store = $store"];
      const parameters: Record<string, any> = {
        store: toStoreRecordId(store.id),
      };

      if (filters.date_from) {
        where.push("entry.date >= <datetime>$date_from");
        parameters.date_from = toQueryDateTime(filters.date_from);
      }

      if (filters.date_to) {
        where.push("entry.date <= <datetime>$date_to");
        parameters.date_to = toQueryDateTime(filters.date_to);
      }

      if (selectedAccount?.value) {
        where.push("account = $account");
        parameters.account = toRecordId(selectedAccount.value);
      }

      const query = `
          SELECT *,
                 account,
                 math::sum(debit) as total_debit, math::sum(credit) as total_credit, math::sum(debit - credit) as balance,
                (select debit - credit as balance from ${Tables.account_journal_line} where account = $parent.account and entry.date < <datetime>$start_date) as opening
          FROM ${Tables.account_journal_line}
          WHERE ${where.join(" AND ")}
          GROUP BY account
          ORDER BY account.code ASC
              FETCH account, account.group
      `;

      if(filters.date_from){
        parameters.start_date = toQueryDateTime(filters.date_from);
      }else{
        parameters.start_date = toQueryDateTime('now');
      }

      const [result] = await db.query(query, parameters);
      setRows(result || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, [store?.id]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, item) => {
        acc.debit += Number(item.total_debit || 0);
        acc.credit += Number(item.total_credit || 0);
        acc.balance += Number(item.balance || 0);
        return acc;
      },
      {debit: 0, credit: 0, balance: 0}
    );
  }, [rows]);

  return (
    <>
      <form className="grid grid-cols-8 gap-4 mb-4" onSubmit={loadLedger}>
        <div className="col-span-2">
          <Controller
            control={control}
            name="account"
            render={({field}) => (
              <ReactSelect
                {...field}
                options={accountOptions}
                isClearable={true}
                placeholder="All ledgers"
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
        <div>
          <Button variant="primary" type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Loading..." : "Load"}
          </Button>
        </div>
      </form>

      {isLoading && <Loader lines={8} lineItems={4}/>}

      {!isLoading && (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
            <tr>
              <th>Account</th>
              <th className="text-right">Opening</th>
              <th className="text-right">Debit</th>
              <th className="text-right">Credit</th>
              <th className="text-right">Balance</th>
            </tr>
            </thead>
            <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.account?.code || "account"}-${index}`}>
                <td>{row.account?.code} - {row.account?.name}</td>
                <td className="text-right">{formatMoney(Number(row?.opening?.[0]?.balance || 0))}</td>
                <td className="text-right">{formatMoney(Number(row.total_debit || 0))}</td>
                <td className="text-right">{formatMoney(Number(row.total_credit || 0))}</td>
                <td className="text-right">{formatMoney(Number(row.balance || 0))}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-500">No ledger data for selected filters.</td>
              </tr>
            )}
            </tbody>
            <tfoot>
            <tr className="font-bold">
              <td>Total</td>
              <td></td>
              <td className="text-right">{formatMoney(totals.debit)}</td>
              <td className="text-right">{formatMoney(totals.credit)}</td>
              <td className="text-right">{formatMoney(totals.balance)}</td>
            </tr>
            </tfoot>
          </table>
        </div>
      )}
    </>
  );
};
