import {FC, useEffect, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import {StringRecordId} from "surrealdb";
import {useAtom} from "jotai";
import {Trans} from "react-i18next";
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
import {AccountGroup} from "../../../api/model/account.group";
import {
  defaultNormalBalanceForHead,
  HEAD_TYPE_OPTIONS,
  NORMAL_BALANCE_OPTIONS,
} from "./account.constants";
import type {AccountHeadType} from "../../../api/model/account";

interface CreateAccountGroupProps {
  addModal: boolean;
  operation?: "create" | "update";
  entity?: AccountGroup;
  onClose?: () => void;
}

const ValidationSchema = yup.object({
  code: yup.string().required(ValidationMessage.Required),
  name: yup.string().required(ValidationMessage.Required),
  head_type: yup.object().required(ValidationMessage.Required),
  normal_balance: yup.object().required(ValidationMessage.Required),
  notes: yup.string().nullable().optional(),
}).required();

export const CreateAccountGroup: FC<CreateAccountGroupProps> = ({
  addModal,
  operation,
  entity,
  onClose,
}) => {
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [{store}] = useAtom(appState);
  const db = useDB();

  const {register, handleSubmit, control, reset, watch, setValue, formState: {errors}} = useForm({
    resolver: yupResolver(ValidationSchema),
  });

  const watchedHeadType = watch("head_type");

  useEffect(() => {
    setModal(addModal);
  }, [addModal]);

  useEffect(() => {
    if (!entity) {
      reset({
        code: "",
        name: "",
        notes: "",
        head_type: HEAD_TYPE_OPTIONS[0],
        normal_balance: NORMAL_BALANCE_OPTIONS[0],
      });
      return;
    }

    reset({
      code: entity.code,
      name: entity.name,
      notes: entity.notes || "",
      head_type: HEAD_TYPE_OPTIONS.find((item) => item.value === entity.head_type),
      normal_balance: NORMAL_BALANCE_OPTIONS.find((item) => item.value === entity.normal_balance),
    });
  }, [entity, reset]);

  useEffect(() => {
    if (!watchedHeadType?.value || operation === "update") {
      return;
    }
    const defaultBalance = defaultNormalBalanceForHead(watchedHeadType.value as AccountHeadType);
    setValue(
      "normal_balance",
      NORMAL_BALANCE_OPTIONS.find((item) => item.value === defaultBalance)
    );
  }, [watchedHeadType?.value, operation, setValue]);

  const onModalClose = () => {
    onClose?.();
  };

  const saveGroup = async (values: any) => {
    setSaving(true);
    try {
      const payload = {
        code: values.code,
        name: values.name,
        head_type: values.head_type.value,
        normal_balance: values.normal_balance.value,
        notes: values.notes || null,
        store: store?.id ? new StringRecordId(store.id.toString()) : null,
      };

      if (entity?.id) {
        await db.merge(new StringRecordId(entity.id.toString()), payload);
      } else {
        await db.insert(Tables.account_group, {
          ...payload,
          is_active: true,
        });
      }

      onModalClose();
    } catch (error: any) {
      notify({
        type: "error",
        description: error?.message || "Failed to save account group.",
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
      title={operation === "update" ? "Update account group" : "Create account group"}
    >
      <form onSubmit={handleSubmit(saveGroup)} className="mb-5">
        <div className="grid grid-cols-1 gap-4 mb-3">
          <div>
            <label htmlFor="group_code">Code</label>
            <Input {...register("code")} id="group_code" className="w-full" hasError={hasErrors(errors.code)}/>
            {getErrors(errors.code)}
          </div>
          <div>
            <label htmlFor="group_name">Name</label>
            <Input {...register("name")} id="group_name" className="w-full" hasError={hasErrors(errors.name)}/>
            {getErrors(errors.name)}
          </div>
          <div>
            <label htmlFor="head_type">Main head</label>
            <Controller
              name="head_type"
              control={control}
              render={({field}) => (
                <ReactSelect
                  {...field}
                  options={HEAD_TYPE_OPTIONS}
                  className={hasErrors(errors.head_type) ? "rs-__error" : ""}
                />
              )}
            />
            {errors.head_type && (
              <div className="text-danger-500 text-sm"><Trans>{errors.head_type.message as string}</Trans></div>
            )}
          </div>
          <div>
            <label htmlFor="group_normal_balance">Normal balance</label>
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
            {errors.normal_balance && (
              <div className="text-danger-500 text-sm"><Trans>{errors.normal_balance.message as string}</Trans></div>
            )}
          </div>
          <div>
            <label htmlFor="group_notes">Notes</label>
            <Input {...register("notes")} id="group_notes" className="w-full"/>
          </div>
          <div>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : operation === "update" ? "Update group" : "Create group"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
