import React, {FC, useEffect, useState} from "react";
import {Modal} from "../../../../app-common/components/modal/modal";
import {useForm} from "react-hook-form";
import {Input} from "../../../../app-common/components/input/input";
import {Button} from "../../../../app-common/components/input/button";
import {HttpException, UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {ConstraintViolation, ValidationResult} from "../../../../lib/validator/validation.result";
import {Department} from "../../../../api/model/department";
import {getErrors, hasErrors} from "../../../../lib/error/error";
import * as yup from "yup";
import {ValidationMessage} from "../../../../api/model/validation";
import {yupResolver} from "@hookform/resolvers/yup";
import {notify} from "../../../../app-common/components/confirm/notification";
import {useDB} from "../../../../api/db/db";
import {StringRecordId} from "surrealdb";
import {Tables} from "../../../../api/db/tables";
import {StoreInput} from "../../../../app-common/components/input/store";

interface CreateDepartmentProps {
  entity?: Department;
  operation?: string;
  addModal: boolean;
  onClose?: () => void;
}

const ValidationSchema = yup.object({
  name: yup.string().required(ValidationMessage.Required),
  description: yup.string(),
  store: yup.object().required(ValidationMessage.Required)
}).required();

export const CreateDepartment: FC<CreateDepartmentProps> = ({
  entity, operation, addModal, onClose

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
        store: {
          value: entity?.store?.['id'],
          label: entity?.store?.name
        }
      });
    }
  }, [entity]);

  const createDepartment = async (values: any) => {
    setCreating(true);
    try {
      if (values.store) {
        values.store = new StringRecordId(values.store.value);
      }

      if (entity?.id) {
        await db.merge(new StringRecordId(entity.id), {
          ...values
        });
      } else {
        await db.insert(Tables.department, {
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
      id: null,
      stores: null,
      name: null,
      description: null
    });
  };

  const onModalClose = () => {
    resetForm();
    onClose && onClose();
  }

  return (
    <Modal
      title={operation === 'create' ? "Create department" : 'Update department'}
      onClose={onModalClose}
      open={modal}
      size="sm"
    >
      <form onSubmit={handleSubmit(createDepartment)} className="mb-5">
        <div className="grid grid-cols-1 gap-4 mb-3">
          <div>
            <label htmlFor="name">Name</label>
            <Input {...register('name')} id="name" className="w-full" tabIndex={0} hasError={hasErrors(errors.name)}/>
            {getErrors(errors.name)}
          </div>

          <div>
            <label htmlFor="description">Description</label>
            <Input {...register('description')} id="description" className="w-full" tabIndex={0}
                   hasError={hasErrors(errors.description)}/>
            {getErrors(errors.description)}
          </div>

          <div>
            <StoreInput control={control} errors={errors}/>
          </div>

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
