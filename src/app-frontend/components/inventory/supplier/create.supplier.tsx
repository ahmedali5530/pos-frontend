import {Input} from "../../../../app-common/components/input/input";
import {Trans} from "react-i18next";
import {StoresInput} from "../../../../app-common/components/input/stores";
import {Button} from "../../../../app-common/components/input/button";
import React, {FC, useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {SUPPLIER_CREATE, SUPPLIER_EDIT} from "../../../../api/routing/routes/backend.app";
import {ReactSelectOptionProps} from "../../../../api/model/common";
import {jsonRequest} from "../../../../api/request/request";
import {UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {ConstraintViolation} from "../../../../lib/validator/validation.result";
import {Modal} from "../../../../app-common/components/modal/modal";
import {Supplier} from "../../../../api/model/supplier";
import {hasErrors} from "../../../../lib/error/error";
import * as yup from "yup";
import {ValidationMessage} from "../../../../api/model/validation";
import { yupResolver } from '@hookform/resolvers/yup';

interface CreateSupplierProps{
  operation: string;
  onClose?: () => void;
  supplier?: Supplier;
  showModal: boolean;
}

const ValidationSchema = yup.object({
  name: yup.string().trim().required(ValidationMessage.Required),
  phone: yup.number().required(ValidationMessage.Required).positive(ValidationMessage.Positive),
  email: yup.string().required(ValidationMessage.Required).email(ValidationMessage.Email),
  openingBalance: yup.number(),
  stores: yup.array().min(1)
}).required();

export const CreateSupplier: FC<CreateSupplierProps> = ({
  operation, onClose, supplier, showModal
}) => {
  const {register, handleSubmit, setError, formState: {errors}, reset, control} = useForm<any>({
    resolver: yupResolver(ValidationSchema as any)
  });
  const [creating, setCreating] = useState(false);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    if(supplier){
      reset({
        ...supplier,
        stores: supplier?.stores?.map(item => {
          return {
            value: item['@id'],
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
      let url: string, method = 'POST';
      if (values.id) {
        method = 'PUT';
        url = SUPPLIER_EDIT.replace(':id', values.id);
      } else {
        url = SUPPLIER_CREATE;
        delete values.id;
      }

      if (values.stores) {
        values.stores = values.stores.map((item: ReactSelectOptionProps) => item?.value);
      }

      await jsonRequest(url, {
        method: method,
        body: JSON.stringify({
          ...values,
        })
      });

      onModalClose();

    } catch (exception: any) {
      if (exception instanceof UnprocessableEntityException) {
        const e = await exception.response.json();
        e.violations.forEach((item: ConstraintViolation) => {
          setError(item.propertyPath, {
            message: item.message,
            type: 'server'
          });
        });

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
      openingBalance: null
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
    >
      <form onSubmit={handleSubmit(createSupplier)} className="mb-5">
        <input type="hidden" {...register('id')}/>
        <div className="grid lg:grid-cols-5 gap-4 mb-3 md:grid-cols-3 sm:grid-cols-1">
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
            <Input {...register('phone', {valueAsNumber: true})} id="phone" className="w-full" hasError={hasErrors(errors.phone)}/>
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
            <label htmlFor="openingBalance">Opening balance</label>
            <Input {...register('openingBalance')} id="openingBalance" className="w-full" hasError={hasErrors(errors.openingBalance)}/>
            {errors.openingBalance && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.openingBalance.message}
                </Trans>
              </div>
            )}
          </div>

          <StoresInput control={control} errors={errors}/>

          <div>
            <label htmlFor="" className="md:block w-full sm:hidden">&nbsp;</label>
            <Button variant="primary" type="submit" disabled={creating}>
              {creating ? 'Saving...' : (operation === 'create' ? 'Create new' : 'Update')}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
