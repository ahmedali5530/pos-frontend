import {FC, useEffect, useMemo, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import {StringRecordId} from "surrealdb";
import {useAtom} from "jotai";
import {Modal} from "../../../app-common/components/modal/modal";
import {Input} from "../../../app-common/components/input/input";
import {Button} from "../../../app-common/components/input/button";
import {ReactSelect} from "../../../app-common/components/input/custom.react.select";
import {ValidationMessage} from "../../../api/model/validation";
import {notify} from "../../../app-common/components/confirm/notification";
import {useDB} from "../../../api/db/db";
import {Tables} from "../../../api/db/tables";
import {getErrors, hasErrors} from "../../../lib/error/error";
import {appState} from "../../../store/jotai";
import {Account} from "../../../api/model/account";
import {AccountGroup} from "../../../api/model/account.group";
import {NORMAL_BALANCE_OPTIONS} from "./account.constants";
import useApi, {SettingsData} from "../../../api/db/use.api";

interface CreateAccountProps {
  addModal: boolean;
  operation?: "create" | "update";
  entity?: Account;
  allAccounts: Account[];
  onClose?: () => void;
}

const ValidationSchema = yup.object({
  code: yup.string().required(ValidationMessage.Required),
  name: yup.string().required(ValidationMessage.Required),
  group: yup.object().required(ValidationMessage.Required),
  normal_balance: yup.object().required(ValidationMessage.Required),
  notes: yup.string().nullable().optional(),
  parent: yup.object().nullable().optional(),
}).required();

export const CreateAccount: FC<CreateAccountProps> = ({
  addModal,
  operation,
  entity,
  allAccounts,
  onClose,
}) => {
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [{store}] = useAtom(appState);
  const db = useDB();

  const groupsHook = useApi<SettingsData<AccountGroup>>(
    Tables.account_group,
    [`store = ${store?.id} and is_active = true`],
    ["code ASC"],
    0,
    9999,
  );

  const {register, handleSubmit, control, reset, watch, setValue, formState: {errors}} = useForm({
    resolver: yupResolver(ValidationSchema),
  });

  const watchedGroup = watch("group");

  useEffect(() => {
    setModal(addModal);
  }, [addModal]);

  useEffect(() => {
    const groups = groupsHook.data?.data || [];
    if (!entity) {
      reset({
        code: "",
        name: "",
        notes: "",
        group: groups[0] ? {
          label: `${groups[0].code} - ${groups[0].name} (${groups[0].head_type})`,
          value: groups[0].id.toString(),
        } : null,
        normal_balance: groups[0]
          ? NORMAL_BALANCE_OPTIONS.find((item) => item.value === groups[0].normal_balance)
          : NORMAL_BALANCE_OPTIONS[0],
        parent: null,
      });
      return;
    }

    reset({
      code: entity.code,
      name: entity.name,
      notes: entity.notes || "",
      group: entity.group ? {
        label: `${entity.group.code} - ${entity.group.name} (${entity.group.head_type})`,
        value: entity.group.id.toString(),
      } : null,
      normal_balance: NORMAL_BALANCE_OPTIONS.find((item) => item.value === entity.normal_balance),
      parent: entity.parent ? {
        label: `${entity.parent.code} - ${entity.parent.name}`,
        value: entity.parent.id.toString(),
      } : null,
    });
  }, [entity, reset, groupsHook.data?.data]);

  useEffect(() => {
    if (!watchedGroup?.value) {
      return;
    }
    const selected = (groupsHook.data?.data || []).find(
      (g) => g.id.toString() === watchedGroup.value
    );
    if (selected) {
      setValue(
        "normal_balance",
        NORMAL_BALANCE_OPTIONS.find((item) => item.value === selected.normal_balance)
      );
    }
  }, [watchedGroup?.value, groupsHook.data?.data, setValue]);

  const groupOptions = useMemo(() => {
    return (groupsHook.data?.data || []).map((item) => ({
      label: `${item.code} - ${item.name} (${item.head_type})`,
      value: item.id.toString(),
    }));
  }, [groupsHook.data?.data]);

  const parentOptions = useMemo(() => {
    return allAccounts
      .filter((item) => entity?.id ? item.id.toString() !== entity.id.toString() : true)
      .map((item) => ({
        label: `${item.code} - ${item.name}`,
        value: item.id.toString(),
      }));
  }, [allAccounts, entity?.id]);

  const onModalClose = () => {
    onClose?.();
  };

  const saveAccount = async (values: any) => {
    setSaving(true);
    try {
      const selectedGroup = (groupsHook.data?.data || []).find(
        (g) => g.id.toString() === values.group.value
      );

      const payload = {
        code: values.code,
        name: values.name,
        group: new StringRecordId(values.group.value),
        normal_balance: values.normal_balance.value,
        notes: values.notes || null,
        parent: values.parent ? new StringRecordId(values.parent.value) : null,
        store: store?.id ? new StringRecordId(store.id.toString()) : null,
        account_type: selectedGroup?.head_type || null,
      };

      if (entity?.id) {
        await db.merge(new StringRecordId(entity.id.toString()), payload);
      } else {
        await db.insert(Tables.account, {
          ...payload,
          is_active: true,
        });
      }

      onModalClose();
    } catch (error: any) {
      notify({
        type: "error",
        description: error?.message || "Failed to save account.",
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
      size="sm"
      title={operation === "update" ? "Update account" : "Create account"}
    >
      <form onSubmit={handleSubmit(saveAccount)} className="mb-5">
        <div className="grid grid-cols-1 gap-4 mb-3">
          <div>
            <label htmlFor="account_code">Code</label>
            <Input {...register("code")} id="account_code" className="w-full" hasError={hasErrors(errors.code)}/>
            {getErrors(errors.code)}
          </div>
          <div>
            <label htmlFor="account_name">Name</label>
            <Input {...register("name")} id="account_name" className="w-full" hasError={hasErrors(errors.name)}/>
            {getErrors(errors.name)}
          </div>
          <div>
            <label htmlFor="account_group">Group</label>
            <Controller
              name="group"
              control={control}
              render={({field}) => (
                <ReactSelect
                  {...field}
                  options={groupOptions}
                  className={hasErrors(errors.group) ? "rs-__error" : ""}
                  placeholder={groupOptions.length ? "Select group" : "Create a group first"}
                />
              )}
            />
            {getErrors(errors.group)}
            {groupOptions.length === 0 && (
              <p className="text-warning-700 text-sm mt-1">Create account groups before adding accounts.</p>
            )}
          </div>
          <div>
            <label htmlFor="normal_balance">Normal balance</label>
            <Controller
              name="normal_balance"
              control={control}
              render={({field}) => (
                <ReactSelect
                  {...field}
                  options={NORMAL_BALANCE_OPTIONS}
                  className={hasErrors(errors.normal_balance) ? "rs-__error" : ""}
                />
              )}
            />
            {getErrors(errors.normal_balance)}
          </div>
          <div>
            <label htmlFor="parent_account">Parent account</label>
            <Controller
              name="parent"
              control={control}
              render={({field}) => (
                <ReactSelect
                  {...field}
                  isClearable={true}
                  options={parentOptions}
                  className={hasErrors(errors.parent) ? "rs-__error" : ""}
                />
              )}
            />
            {getErrors(errors.parent)}
          </div>
          <div>
            <label htmlFor="account_notes">Notes</label>
            <Input {...register("notes")} id="account_notes" className="w-full"/>
          </div>
          <div>
            <Button variant="primary" type="submit" disabled={saving || groupOptions.length === 0}>
              {saving ? "Saving..." : operation === "update" ? "Update account" : "Create account"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
