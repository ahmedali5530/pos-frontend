import React, {FC, useEffect, useState} from "react";
import {Modal} from "../../../../app-common/components/modal/modal";
import {Controller, useForm} from "react-hook-form";
import {DEPARTMENT_CREATE, DEPARTMENT_GET, STORE_LIST} from "../../../../api/routing/routes/backend.app";
import {Input} from "../../../../app-common/components/input/input";
import {Trans} from "react-i18next";
import {Button} from "../../../../app-common/components/input/button";
import {HttpException, UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {ConstraintViolation, ValidationResult} from "../../../../lib/validator/validation.result";
import {Department} from "../../../../api/model/department";
import {ReactSelectOptionProps} from "../../../../api/model/common";
import {fetchJson, jsonRequest} from "../../../../api/request/request";
import { StoresInput } from "../../../../app-common/components/input/stores";
import {getErrorClass, getErrors, hasErrors} from "../../../../lib/error/error";
import * as yup from "yup";
import {ValidationMessage} from "../../../../api/model/validation";
import {yupResolver} from "@hookform/resolvers/yup";
import { ReactSelect } from "../../../../app-common/components/input/custom.react.select";
import {Store} from "../../../../api/model/store";
import {useLoadList} from "../../../../api/hooks/use.load.list";
import {notify} from "../../../../app-common/components/confirm/notification";

interface CreateDepartmentProps {
  entity?: Department;
  operation?: string;
  addModal: boolean;
  onClose?: () => void;
}

const ValidationSchema = yup.object({
  name: yup.string().required(ValidationMessage.Required),
  description: yup.string().required(ValidationMessage.Required),
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
  const {list: stores, fetchData: loadStores} = useLoadList<Store>(STORE_LIST);

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    setModal(addModal);
  }, [addModal]);

  useEffect(() => {
    if (entity) {
      reset({
        ...entity,
        store: {
          value: entity?.store?.['@id'],
          label: entity?.store?.name
        }
      });
    }
  }, [entity]);

  const createDepartment = async (values: any) => {
    setCreating(true);
    try {
      let url, method = 'POST';
      if (values.id) {
        method = 'PUT';
        url = DEPARTMENT_GET.replace(':id', values.id);
      } else {
        url = DEPARTMENT_CREATE;
        delete values.id;
      }

      if (values.store) {
        values.store = values.store.value;
      }

      await jsonRequest(url, {
        method: method,
        body: JSON.stringify({
          ...values,
          isActive: true
        })
      });

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
        <input type="hidden" {...register('id')}/>
        <div className="grid grid-cols-1 gap-4 mb-3">
          <div>
            <label htmlFor="name">Name</label>
            <Input {...register('name')} id="name" className="w-full" tabIndex={0} hasError={hasErrors(errors.name)}/>
            {getErrors(errors.name)}
          </div>

          <div>
            <label htmlFor="description">Description</label>
            <Input {...register('description')} id="description" className="w-full" tabIndex={0} hasError={hasErrors(errors.description)}/>
            {getErrors(errors.description)}
          </div>

          <div>
            <label htmlFor="store">Store</label>
            <Controller
              name="store"
              control={control}
              render={(props) => (
                <ReactSelect
                  onChange={props.field.onChange}
                  value={props.field.value}
                  options={stores.map(item => {
                    return {
                      label: item.name,
                      value: item['@id']
                    }
                  })}
                  className={getErrorClass(errors.store)}
                />
              )}
            />

            {getErrors(errors.store)}
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
