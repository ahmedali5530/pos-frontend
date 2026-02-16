import React, {FC, useEffect, useState} from "react";
import {Modal} from "../../../../app-common/components/modal/modal";
import {Input} from "../../../../app-common/components/input/input";
import {Trans} from "react-i18next";
import {Button} from "../../../../app-common/components/input/button";
import {useForm} from "react-hook-form";
import {HttpException, UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {ConstraintViolation, ValidationResult} from "../../../../lib/validator/validation.result";
import {Store} from "../../../../api/model/store";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from 'yup';
import {ValidationMessage} from "../../../../api/model/validation";
import {hasErrors} from "../../../../lib/error/error";
import {notify} from "../../../../app-common/components/confirm/notification";
import {useDB} from "../../../../api/db/db";
import {Tables} from "../../../../api/db/tables";

interface CreateStoreProps {
  entity?: Store;
  operation?: string;
  addModal: boolean;
  onClose?: () => void;
}

const ValidationSchema = yup.object({
  name: yup.string().required(ValidationMessage.Required)
}).required();

export const CreateStore: FC<CreateStoreProps> = ({
  entity, operation, addModal, onClose
}) => {
  const {register, handleSubmit, setError, formState: {errors}, reset} = useForm({
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
        name: entity.name,
        location: entity.location,
      });
    }
  }, [entity]);

  const createStore = async (values: any) => {
    setCreating(true);

    try {
      if (entity?.id) {
        await db.merge(entity.id, {
          ...values,
        })
      } else {
        await db.insert(Tables.store, {
          ...values,
        })
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
      name: null,
      location: null,
      id: null
    });
  };

  const onModalClose = () => {
    resetForm();
    onClose && onClose();
  }

  return (
    <Modal
      title={operation === 'create' ? "Create store" : 'Update store'}
      onClose={onModalClose}
      open={modal}
      size="sm"
    >
      <form onSubmit={handleSubmit(createStore)} className="mb-5">
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
          <div>
            <label htmlFor="location">Location</label>
            <Input {...register('location')} id="location" className="w-full" hasError={hasErrors(errors.location)}/>
            {errors.location && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.location.message}
                </Trans>
              </div>
            )}
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
