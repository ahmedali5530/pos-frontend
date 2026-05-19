import {useMemo, useState} from "react";
import {createColumnHelper} from "@tanstack/react-table";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import {useAtom} from "jotai";
import {DateTime} from "luxon";
import {Button} from "../../../app-common/components/input/button";
import {TableComponent} from "../../../app-common/components/table/table";
import useApi, {SettingsData} from "../../../api/db/use.api";
import {Tables} from "../../../api/db/tables";
import {AccountJournalEntry} from "../../../api/model/account.journal.entry";
import {Account} from "../../../api/model/account";
import {appState} from "../../../store/jotai";
import {CreateJournalEntry} from "./create.journal.entry";
import {formatMoney} from "./account.constants";

export const JournalEntries = () => {
  const [{store}] = useAtom(appState);
  const [modal, setModal] = useState(false);

  const accountHook = useApi<SettingsData<Account>>(
    Tables.account,
    [`store = ${store?.id} and is_active = true`],
    ["code ASC"],
    0,
    9999,
  );

  const journalHook = useApi<SettingsData<AccountJournalEntry>>(
    Tables.account_journal_entry,
    [`store = ${store?.id}`],
    ["date DESC"],
    0,
    25,
    ["lines", "lines.account", "lines.account.group", "created_by"],
  );

  const columnHelper = createColumnHelper<AccountJournalEntry>();
  const columns = useMemo(() => [
    columnHelper.accessor("entry_number", {
      header: "Entry #",
    }),
    columnHelper.accessor("date", {
      header: "Date",
      cell: (info) => {
        const date = info.getValue();
        if (!date) {
          return "-";
        }
        return DateTime.fromJSDate(new Date(date)).toFormat("yyyy-LL-dd HH:mm");
      },
    }),
    columnHelper.accessor("source_module", {
      header: "Module",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor("source_id", {
      header: "Source ID",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor("memo", {
      header: "Memo",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor("lines", {
      header: "Debit",
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => {
        const lines = info.getValue() || [];
        const total = lines.reduce((sum: number, line: any) => sum + Number(line.debit || 0), 0);
        return formatMoney(total);
      }
    }),
    columnHelper.accessor("id", {
      header: "Credit",
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => {
        const lines = info.row.original.lines || [];
        const total = lines.reduce((sum: number, line: any) => sum + Number(line.credit || 0), 0);
        return formatMoney(total);
      }
    }),
    columnHelper.accessor("posted", {
      header: "Status",
      cell: (info) => (
        <span className={info.getValue() ? "text-success-600" : "text-warning-600"}>
          {info.getValue() ? "Posted" : "Draft"}
        </span>
      ),
    }),
  ], [columnHelper]);

  return (
    <>
      <TableComponent
        columns={columns}
        loaderHook={journalHook}
        loaderLineItems={6}
        buttons={[
          <Button
            key="new-journal-entry"
            variant="primary"
            onClick={() => setModal(true)}
            disabled={(accountHook.data?.data || []).length < 2}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Journal entry
          </Button>
        ]}
      />

      {(accountHook.data?.data || []).length < 2 && (
        <p className="text-warning-700 text-sm">
          Add at least two active accounts before posting journal entries.
        </p>
      )}

      {modal && (
        <CreateJournalEntry
          addModal={modal}
          accounts={accountHook.data?.data || []}
          onClose={async () => {
            setModal(false);
            await journalHook.fetchData();
          }}
        />
      )}
    </>
  );
};
