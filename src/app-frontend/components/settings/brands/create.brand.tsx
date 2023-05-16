import React, {FC, useEffect, useState} from "react";
import {Modal} from "../../../../app-common/components/modal/modal";
import {useForm} from "react-hook-form";
import {BRAND_CREATE, BRAND_EDIT, STORE_EDIT} from "../../../../api/routing/routes/backend.app";
import {ReactSelectOptionProps} from "../../../../api/model/common";
import {fetchJson} from "../../../../api/request/request";
import {UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {ConstraintViolation} from "../../../../lib/validator/validation.result";
import {Input} from "../../../../app-common/components/input/input";
import {Trans} from "react-i18next";
import { StoresInput } from "../../../../app-common/components/input/stores";
import {Button} from '../../../../app-common/components/input/button';
import {Brand} from "../../../../api/model/brand";
import * as yup from 'yup';
import {ValidationMessage} from "../../../../api/model/validation";
import {yupResolver} from "@hookform/resolvers/yup";
import {hasErrors} from "../../../../lib/error/error";

interface CreateBrandProps{
  entity?: Brand;
  operation?: string;
  addModal: boolean;
  onClose?: () => void;
}

const ValidationSchema = yup.object({
  name: yup.string().required(ValidationMessage.Required),
  stores: yup.array().required(ValidationMessage.Required)
}).required();

export const CreateBrand: FC<CreateBrandProps> = ({
  entity, onClose, operation, addModal
}) => {
  const {register, handleSubmit, setError, formState: {errors}, reset, control} = useForm({
    resolver: yupResolver(ValidationSchema)
  });
  const [creating, setCreating] = useState(false);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    setModal(addModal);
  }, [addModal]);

  useEffect(() => {
    if (entity) {
      reset({
        ...entity,
        stores: entity.stores.map(item => {
          return {
            label: item.name,
            value: item['@id']
          }
        })
      });
    }
  }, [entity]);

  const createBrand = async (values: any) => {
    setCreating(true);
    try {
      let url, method = 'POST';
      if (values.id) {
        method = 'PUT';
        url = BRAND_EDIT.replace(':id', values.id);
      } else {
        url = BRAND_CREATE;
        delete values.id;
      }

      if(values.stores){
        values.stores = values.stores.map((item: ReactSelectOptionProps) => item.value);
      }

      await fetchJson(url, {
        method: method,
        body: JSON.stringify({
          ...values,
          isActive: true
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
      id: null,
      name: null,
      stores: null
    });
  };

  const onModalClose = () => {
    resetForm();
    onClose && onClose();
  }

  return (
    <Modal
      open={modal}
      onClose={onModalClose}
      size="sm"
      title={operation === 'create' ? 'Create brand' : 'Update brand'}
    >
      <form onSubmit={handleSubmit(createBrand)} className="mb-5">
        <input type="hidden" {...register('id')}/>
        <div className="grid grid-cols-1 gap-4 mb-3">
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
          <StoresInput control={control} errors={errors} />
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
