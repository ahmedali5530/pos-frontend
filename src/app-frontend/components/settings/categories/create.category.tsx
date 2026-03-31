import React, {FC, useEffect, useState} from "react";
import {Modal} from "../../../../app-common/components/modal/modal";
import {useForm} from "react-hook-form";
import {ReactSelectOptionProps} from "../../../../api/model/common";
import {HttpException, UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {ConstraintViolation, ValidationResult} from "../../../../lib/validator/validation.result";
import {StoresInput} from "../../../../app-common/components/input/stores";
import {Trans} from "react-i18next";
import {Input} from '../../../../app-common/components/input/input';
import {Button} from '../../../../app-common/components/input/button';
import * as yup from "yup";
import {ValidationMessage} from "../../../../api/model/validation";
import {Category} from "../../../../api/model/category";
import {hasErrors} from "../../../../lib/error/error";
import {yupResolver} from "@hookform/resolvers/yup";
import {notify} from "../../../../app-common/components/confirm/notification";
import {useDB} from "../../../../api/db/db";
import {StringRecordId} from "surrealdb";
import {Tables} from "../../../../api/db/tables";


interface CreateCategoryProps {
  entity?: Category;
  operation?: string;
  addModal: boolean;
  onClose?: () => void;
}

const ValidationSchema = yup.object({
  name: yup.string().required(ValidationMessage.Required),
  stores: yup.array().required(ValidationMessage.Required)
}).required();

export const CreateCategory: FC<CreateCategoryProps> = ({
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
        stores: entity.stores.map(item => {
          return {
            label: item.name,
            value: item['id'].toString()
          }
        })
      });
    }
  }, [entity]);

  const createCategory = async (values: any) => {
    setCreating(true);
    try {
      if (values.stores) {
        values.stores = values.stores.map((item: ReactSelectOptionProps) => new StringRecordId(item.value));
      }

      if (entity?.id) {
        await db.merge(new StringRecordId(entity.id), {
          ...values,
        });
      } else {
        await db.insert(Tables.category, {
          ...values,
          is_active: true
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
      id: null,
      stores: null,
      name: null
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
      title={operation === 'create' ? 'Create category' : 'Update category'}
    >
      <form onSubmit={handleSubmit(createCategory)} className="mb-5">
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
