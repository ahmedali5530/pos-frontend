import {Input} from "../../../../app-common/components/input/input";
import {Trans} from "react-i18next";
import {StoresInput} from "../../../../app-common/components/input/stores";
import {Button} from "../../../../app-common/components/input/button";
import React, {FC, useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {ReactSelectOptionProps} from "../../../../api/model/common";
import {HttpException, UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {ConstraintViolation, ValidationResult} from "../../../../lib/validator/validation.result";
import {Modal} from "../../../../app-common/components/modal/modal";
import {Supplier} from "../../../../api/model/supplier";
import {hasErrors} from "../../../../lib/error/error";
import * as yup from "yup";
import {ValidationMessage} from "../../../../api/model/validation";
import {yupResolver} from '@hookform/resolvers/yup';
import {notify} from "../../../../app-common/components/confirm/notification";
import {useDB} from "../../../../api/db/db";
import {StringRecordId} from "surrealdb";
import {Tables} from "../../../../api/db/tables";

interface CreateSupplierProps {
  operation: string;
  onClose?: () => void;
  supplier?: Supplier;
  showModal: boolean;
}

const ValidationSchema = yup.object({
  name: yup.string().trim().required(ValidationMessage.Required),
  phone: yup.string().required(ValidationMessage.Required),
  email: yup.string().required(ValidationMessage.Required).email(ValidationMessage.Email),
  opening_balance: yup.string().required(ValidationMessage.Required),
  stores: yup.array().min(1).required(ValidationMessage.Required)
}).required();

export const CreateSupplier: FC<CreateSupplierProps> = ({
  operation, onClose, supplier, showModal
}) => {
  const {register, handleSubmit, setError, formState: {errors}, reset, control} = useForm<any>({
    resolver: yupResolver(ValidationSchema as any)
  });
  const [creating, setCreating] = useState(false);
  const [modal, setModal] = useState(false);
  const db = useDB();

  useEffect(() => {
    if (supplier) {
      reset({
        ...supplier,
        stores: supplier?.stores?.map(item => {
          return {
            value: item['id'],
            label: item.name
          }
        })
      });
    }
  }, [supplier]);

  useEffect(() => {
    setModal(showModal);
  }, [showModal]);

  const createSupplier = async (values: any) => {
    setCreating(true);
    try {
      if (values.stores) {
        values.stores = values.stores.map((item: ReactSelectOptionProps) => new StringRecordId(item?.value));
      }

      if (values.opening_balance) {
        values.opening_balance = Number(values.opening_balance);
      }

      if (supplier?.id) {
        await db.merge(new StringRecordId(supplier.id), {
          ...values
        });
      } else {
        await db.insert(Tables.supplier, {
          ...values
        });
      }

      onModalClose();

    } catch (exception: any) {
      if (exception instanceof HttpException) {
        if (exception.message) {
          notify({
            type: 'error',
            description: exception.message
          });
        }
      }

      if (exception instanceof UnprocessableEntityException) {
        const e: ValidationResult = await exception.response.json();
        e.violations.forEach((item: ConstraintViolation) => {
          setError(item.propertyPath, {
            message: item.message,
            type: 'server'
          });
        });

        if (e.errorMessage) {
          notify({
            type: 'error',
            description: e.errorMessage
          });
        }

        return false;
      }

      throw exception;
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    reset({
      email: null,
      id: null,
      stores: null,
      phone: null,
      name: null,
      opening_balance: null
    });
  };

  const onModalClose = () => {
    setModal(false);
    resetForm();
    onClose && onClose();
  }

  return (
    <Modal
      open={modal}
      onClose={onModalClose}
      title="Create Supplier"
      size="sm"
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
    >
      <form onSubmit={handleSubmit(createSupplier)} className="mb-5">
        <div className="grid lg:grid-cols-1 gap-4 mb-3 md:grid-cols-3 sm:grid-cols-1">
          <div>
            <label htmlFor="name">Name</label>
            <Input {...register('name')} id="name" className="w-full" hasError={hasErrors(errors.name)}/>
            {errors.name && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.name.message}
                </Trans>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="phone">Phone</label>
            <Input {...register('phone')} id="phone" className="w-full" hasError={hasErrors(errors.phone)}/>
            {errors.phone && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.phone.message}
                </Trans>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <Input {...register('email')} id="email" className="w-full" hasError={hasErrors(errors.email)}/>
            {errors.email && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.email.message}
                </Trans>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="opening_balance">Opening balance</label>
            <Input {...register('opening_balance')} type="number" id="opening_balance" className="w-full"
                   hasError={hasErrors(errors.opening_balance)}/>
            {errors.opening_balance && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.opening_balance.message}
                </Trans>
              </div>
            )}
          </div>

          <StoresInput control={control} errors={errors}/>

          <div>
            <Button variant="primary" type="submit" disabled={creating}>
              {creating ? 'Saving...' : (operation === 'create' ? 'Create new' : 'Update')}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
