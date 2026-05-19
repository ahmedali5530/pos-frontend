import {FC, MutableRefObject, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Controller, useFieldArray, useForm} from "react-hook-form";
import {DateTime} from "luxon";
import {faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {StringRecordId} from "surrealdb";
import {useAtom} from "jotai";
import {Modal} from "../../../app-common/components/modal/modal";
import {Input} from "../../../app-common/components/input/input";
import {Button} from "../../../app-common/components/input/button";
import {ReactSelect} from "../../../app-common/components/input/custom.react.select";
import {notify} from "../../../app-common/components/confirm/notification";
import {useDB} from "../../../api/db/db";
import {Tables} from "../../../api/db/tables";
import {appState} from "../../../store/jotai";
import {Account, NormalBalance} from "../../../api/model/account";

interface CreateJournalEntryProps {
  addModal: boolean;
  accounts: Account[];
  onClose?: () => void;
}

interface JournalLineForm {
  account: { label: string; value: string } | null;
  debit: number;
  credit: number;
  description?: string;
}

interface JournalEntryForm {
  date: string;
  memo?: string;
  source_module?: string;
  source_id?: string;
  lines: JournalLineForm[];
}

const EMPTY_LINE: JournalLineForm = {account: null, debit: 0, credit: 0, description: ""};

const mergeInputRef = (
  registerRef: (instance: HTMLInputElement | null) => void,
  focusRef: MutableRefObject<(HTMLInputElement | null)[]>,
  index: number
) => (instance: HTMLInputElement | null) => {
  registerRef(instance);
  focusRef.current[index] = instance;
};

export const CreateJournalEntry: FC<CreateJournalEntryProps> = ({addModal, accounts, onClose}) => {
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const debitRefs = useRef<(HTMLInputElement | null)[]>([]);
  const creditRefs = useRef<(HTMLInputElement | null)[]>([]);
  const db = useDB();
  const [{store, user}] = useAtom(appState);

  const accountById = useMemo(() => {
    const map = new Map<string, Account>();
    accounts.forEach((account) => {
      map.set(account.id.toString(), account);
    });
    return map;
  }, [accounts]);

  const getNormalBalanceForAccount = useCallback((accountId?: string): NormalBalance => {
    if (!accountId) {
      return "debit";
    }
    const account = accountById.get(accountId);
    return account?.normal_balance || account?.group?.normal_balance || "debit";
  }, [accountById]);

  const focusAmountField = useCallback((lineIndex: number, accountId?: string) => {
    if (!accountId) {
      return;
    }
    const normalBalance = getNormalBalanceForAccount(accountId);
    const target = normalBalance === "credit"
      ? creditRefs.current[lineIndex]
      : debitRefs.current[lineIndex];

    requestAnimationFrame(() => {
      target?.focus();
      target?.select();
    });
  }, [getNormalBalanceForAccount]);

  const accountOptions = useMemo(() => {
    return accounts
      .filter((item) => item.is_active)
      .map((item) => ({
        label: `${item.code} - ${item.name}`,
        value: item.id.toString(),
      }));
  }, [accounts]);

  const {register, handleSubmit, control, reset, watch} = useForm<JournalEntryForm>({
    defaultValues: {
      date: DateTime.now().toFormat("yyyy-MM-dd'T'HH:mm"),
      lines: [{...EMPTY_LINE}, {...EMPTY_LINE}],
    }
  });

  const {fields, append, remove} = useFieldArray({
    control,
    name: "lines",
  });

  useEffect(() => {
    setModal(addModal);
  }, [addModal]);

  const watchedLines = watch("lines");
  const debitTotal = (watchedLines || []).reduce((sum, line) => sum + Number(line?.debit || 0), 0);
  const creditTotal = (watchedLines || []).reduce((sum, line) => sum + Number(line?.credit || 0), 0);
  const isBalanced = Number(debitTotal.toFixed(2)) === Number(creditTotal.toFixed(2)) && debitTotal > 0;

  const fetchNextEntryNumber = async () => {
    const [rows] = await db.query(`SELECT math::max(<int>entry_number) as max_value
                                   FROM ${Tables.account_journal_entry}
                                   GROUP ALL`);
    return Number(rows?.[0]?.max_value || 0) + 1;
  };

  const onModalClose = () => {
    reset({
      date: DateTime.now().toFormat("yyyy-MM-dd'T'HH:mm"),
      memo: "",
      source_module: "",
      source_id: "",
      lines: [{...EMPTY_LINE}, {...EMPTY_LINE}],
    });
    debitRefs.current = [];
    creditRefs.current = [];
    onClose?.();
  };

  const appendEmptyLines = (count: number) => {
    append(Array.from({length: count}, () => ({...EMPTY_LINE})));
  };

  const saveJournalEntry = async (values: JournalEntryForm) => {
    setSaving(true);
    try {
      if (!values.lines || values.lines.length < 2) {
        notify({type: "error", description: "At least two journal lines are required."});
        return;
      }

      const validLines = values.lines.filter((line) => line.account?.value && (Number(line.debit) > 0 || Number(line.credit) > 0));
      if (validLines.length < 2) {
        notify({type: "error", description: "Add at least two valid lines with account and amount."});
        return;
      }

      const debits = validLines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
      const credits = validLines.reduce((sum, line) => sum + Number(line.credit || 0), 0);
      if (Number(debits.toFixed(2)) !== Number(credits.toFixed(2))) {
        notify({type: "error", description: "Journal entry must be balanced (debit = credit)."});
        return;
      }

      const entryNumber = await fetchNextEntryNumber();
      const [entry] = await db.insert(Tables.account_journal_entry, {
        entry_number: entryNumber,
        date: DateTime.fromFormat(values.date, "yyyy-MM-dd'T'HH:mm").toJSDate(),
        memo: values.memo || null,
        source_module: values.source_module || null,
        source_id: values.source_id || null,
        store: store?.id ? new StringRecordId(store.id.toString()) : null,
        created_by: user?.id ? new StringRecordId(user.id.toString()) : null,
        posted: true,
      });

      const lineIds: any[] = [];
      for (const line of validLines) {
        const [createdLine] = await db.insert(Tables.account_journal_line, {
          entry: new StringRecordId(entry.id.toString()),
          account: new StringRecordId(line.account!.value),
          debit: Number(line.debit || 0),
          credit: Number(line.credit || 0),
          description: line.description || null,
        });
        lineIds.push(createdLine.id);
      }

      await db.merge(new StringRecordId(entry.id.toString()), {
        lines: lineIds,
      });

      onModalClose();
    } catch (error: any) {
      notify({
        type: "error",
        description: error?.message || "Failed to save journal entry.",
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={modal}
      onClose={onModalClose}
      size="full"
      title="Create journal entry"
    >
      <form onSubmit={handleSubmit(saveJournalEntry)}>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label htmlFor="entry_date">Date</label>
            <Input {...register("date")} id="entry_date" type="datetime-local" className="w-full"/>
          </div>
          <div>
            <label htmlFor="entry_source_module">Source module</label>
            <Input {...register("source_module")} id="entry_source_module" className="w-full"
                   placeholder="sales, expenses..."/>
          </div>
          <div>
            <label htmlFor="entry_source_id">Source id</label>
            <Input {...register("source_id")} id="entry_source_id" className="w-full"
                   placeholder="optional external reference"/>
          </div>
          <div>
            <label htmlFor="entry_memo">Memo</label>
            <Input {...register("memo")} id="entry_memo" className="w-full" placeholder="entry memo"/>
          </div>
        </div>

        <div className="mt-6 bg-white border rounded-lg">
          <div className="grid grid-cols-12 gap-3 p-3 border-b font-semibold text-gray-600">
            <div className="col-span-4">Account</div>
            <div className="col-span-2">Debit</div>
            <div className="col-span-2">Credit</div>
            <div className="col-span-3">Description</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          <div className="p-3 space-y-3">
            {fields.map((field, index) => {
              const debitField = register(`lines.${index}.debit` as const);
              const creditField = register(`lines.${index}.credit` as const);

              return (
              <div className="grid grid-cols-12 gap-3" key={field.id}>
                <div className="col-span-4">
                  <Controller
                    control={control}
                    name={`lines.${index}.account`}
                    render={({field: accountField}) => (
                      <ReactSelect
                        {...accountField}
                        options={accountOptions}
                        placeholder="Select account"
                        onChange={(option) => {
                          accountField.onChange(option);
                          focusAmountField(index, option?.value);
                        }}
                      />
                    )}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    className="w-full"
                    {...debitField}
                    ref={mergeInputRef(debitField.ref, debitRefs, index)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    className="w-full"
                    {...creditField}
                    ref={mergeInputRef(creditField.ref, creditRefs, index)}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    className="w-full"
                    {...register(`lines.${index}.description` as const)}
                  />
                </div>
                <div className="col-span-1 text-right">
                  <Button
                    type="button"
                    variant="danger"
                    className="w-[40px]"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 2}
                  >
                    <FontAwesomeIcon icon={faTrash}/>
                  </Button>
                </div>
              </div>
              );
            })}
          </div>

          <div className="p-3 border-t flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => append({...EMPTY_LINE})}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2"/> Add line
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => appendEmptyLines(10)}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2"/> Add 10 lines
            </Button>
          </div>
        </div>

        <div className="mt-5 p-4 bg-gray-100 rounded-lg flex justify-between items-center">
          <div className="text-sm">
            <span className="mr-4">Debit total: <strong>{debitTotal.toFixed(2)}</strong></span>
            <span>Credit total: <strong>{creditTotal.toFixed(2)}</strong></span>
            <span className={`ml-4 font-semibold ${isBalanced ? "text-success-600" : "text-danger-600"}`}>
              {isBalanced ? "Balanced" : "Not balanced"}
            </span>
          </div>
          <Button variant="primary" type="submit" disabled={saving || !isBalanced}>
            {saving ? "Saving..." : "Post journal entry"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
