import React, {FC, useEffect, useState} from "react";
import {Modal} from "../../../../app-common/components/modal/modal";
import {Controller, useForm, useWatch} from "react-hook-form";
import {toRecordId} from "../../../../api/model/common";
import {Input} from "../../../../app-common/components/input/input";
import {Printer} from "../../../../api/model/printer";
import * as yup from 'yup';
import {yupResolver} from "@hookform/resolvers/yup";
import {notify} from "../../../../app-common/components/confirm/notification";
import {useDB} from "../../../../api/db/db";
import {Tables} from "../../../../api/db/tables";
import {StringRecordId} from "surrealdb";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {transformValue} from "../../../../lib/currency/currency";
import {Button} from "../../../../app-common/components/input/button";
import {StoreInput} from "../../../../app-common/components/input/store";

interface PrinterProps {
  entity?: Printer;
  operation?: string;
  addModal: boolean;
  onClose?: () => void;
}

const ValidationSchema = yup.object({
  name: yup.string().min(1, "This is required"),
  ip_address: yup.string().optional(),
  vid: yup.string().optional(),
  pid: yup.string().optional(),
  port: yup.number().optional(),
  prints: yup.number().min(1, "This is required"),
  priority: yup.number(),
  type: yup.object({
    label: yup.string().required(),
    value: yup.string().required()
  }).required('This is required'),
}).required();

export const PrinterForm: FC<PrinterProps> = ({
  entity, onClose, operation, addModal
}) => {
  const {register, handleSubmit, setError, formState: {errors}, reset, control} = useForm({
    resolver: yupResolver(ValidationSchema)
  });
  const [creating, setCreating] = useState(false);
  const [modal, setModal] = useState(false);
  const db = useDB();

  useEffect(() => {
    setModal(addModal);
  }, [addModal]);

  useEffect(() => {
    if (entity) {
      reset({
        ...entity,
        name: entity.name,
        priority: entity.priority,
        ip_address: entity.ip_address,
        port: entity.port,
        prints: entity.prints,
        vid: entity.vid,
        pid: entity.pid,
        type: entity.type ? {
          label: entity.type,
          value: entity.type
        } : null,
        store: entity.store ? {
          label: entity.store.name,
          value: entity.store.id.toString()
        } : null
      });
    }
  }, [entity]);

  const createPrinter = async (values: any) => {
    setCreating(true);
    try {
      if (values.store) {
        values.store = toRecordId(values.store.value);
      }

      values.type = values.type.value;

      if (entity?.id) {
        await db.merge(new StringRecordId(entity.id), {
          ...values,
        });
      } else {
        await db.insert(Tables.printer, {
          ...values,
        });
      }

      onModalClose();

    } catch (exception: any) {
      notify({
        type: 'error',
        description: exception.message
      });

      throw exception;
    } finally {
      setCreating(false);
    }
  };

  const onModalClose = () => {
    onClose && onClose();
  }

  const type = useWatch({
    name: 'type',
    control: control
  })

  return (
    <Modal
      open={modal}
      onClose={onModalClose}
      size="sm"
      title={operation === 'create' ? 'Create printer' : 'Update printer'}
    >
      <form onSubmit={handleSubmit(createPrinter)} className="mb-5">
        <div className="flex gap-3 mb-3 flex-col">
          <div className="flex-1">
            <Input className="w-full" label="Name" {...register('name')} autoFocus hasError={!!errors?.name?.message} />
          </div>
          <div className="flex-1">
            <label htmlFor="type">Type</label>
            <Controller
              render={({field}) => (
                <ReactSelect
                  value={field.value}
                  onChange={field.onChange}
                  options={['Network', 'USB', 'Serial', 'Bluetooth'].map(item => ({
                    label: item,
                    value: item
                  }))}
                />
              )}
              name="type"
              control={control}
            />
          </div>
          {type?.value === 'Network' && (
            <>
              <div className="flex-1">
                <Controller
                  name="ip_address"
                  control={control}
                  render={({field}) => (
                    <Input
                      label="Path"
                      value={transformValue.input(field.value)}
                      onChange={field.onChange}
                      error={errors?.ip_address?.message}
                      className="w-full"
                    />
                  )}
                />
              </div>
              <div className="flex-1">
                <Controller
                  render={({ field }) => (
                    <Input
                      type="number"
                      label="Port"
                      error={errors?.port?.message}
                      value={transformValue.input(field.value)}
                      onChange={(e) => field.onChange(transformValue.output(e))}
                      className="w-full"
                    />
                  )}
                  name="port"
                  control={control}
                />
              </div>
            </>
          )}

          {type?.value === 'USB' && (
            <>
              <div className="flex-1">
                <Controller
                  name="vid"
                  control={control}
                  render={({field}) => (
                    <Input
                      label="VID"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors?.vid?.message}
                      className="w-full"
                    />
                  )}
                />

              </div>
              <div className="flex-1">
                <Controller
                  render={({ field }) => (
                    <Input
                      label="PID"
                      error={errors?.pid?.message}
                      value={field.value}
                      onChange={field.onChange}
                      className="w-full"
                    />
                  )}
                  name="pid"
                  control={control}
                />
              </div>
            </>
          )}

          {(type?.value === 'Bluetooth' || type?.value === 'Serial') && (
            <>
              <div className="flex-1">
                <Controller
                  name="path"
                  control={control}
                  render={({field}) => (
                    <Input
                      label="Path"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors?.path?.message}
                      className="w-full"
                    />
                  )}
                />
              </div>
            </>
          )}
          <div className="flex-1">
            <Controller
              render={({field}) => (
                <Input
                  type="number"
                  label="Prints"
                  hasError={!!errors?.prints?.message}
                  value={field.value}
                  onChange={field.onChange}
                  className="w-full"
                />
              )}
              name="prints"
              control={control}
            />
          </div>
          <div>
            <StoreInput control={control} errors={errors} />
          </div>
          <div>
            <Button type="submit" variant="primary" disabled={creating}>Save</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
