import React, {FC, useEffect, useState} from "react";
import {Modal} from "../../../../app-common/components/modal/modal";
import {Input} from "../../../../app-common/components/input/input";
import {Trans} from "react-i18next";
import {Controller, useForm} from "react-hook-form";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {StoresInput} from "../../../../app-common/components/input/stores";
import {Button} from "../../../../app-common/components/input/button";
import {useAlert} from "react-alert";
import {STORE_EDIT, STORE_LIST, USER_CREATE, USER_EDIT} from "../../../../api/routing/routes/backend.app";
import {ReactSelectOptionProps} from "../../../../api/model/common";
import {fetchJson, jsonRequest} from "../../../../api/request/request";
import {HttpException, UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {ConstraintViolation, ValidationResult} from "../../../../lib/validator/validation.result";
import {User} from "../../../../api/model/user";
import * as yup from 'yup';
import {ValidationMessage} from "../../../../api/model/validation";
import {yupResolver} from "@hookform/resolvers/yup";
import {getErrors, hasErrors} from "../../../../lib/error/error";
import {Store} from "../../../../api/model/store";
import {useLoadList} from "../../../../api/hooks/use.load.list";

interface CreateUserProps {
  entity?: User;
  operation?: string;
  addModal: boolean;
  onClose?: () => void;
}

const ValidationSchema = yup.object({
  displayName: yup.string().required(ValidationMessage.Required),
  username: yup.string().required(ValidationMessage.Required),
  email: yup.string().required(ValidationMessage).email(ValidationMessage.Email),
  roles: yup.array().required(ValidationMessage.Required),
  stores: yup.array().required(ValidationMessage.Required)
});

export const CreateUser: FC<CreateUserProps> = ({
  entity, onClose, operation, addModal
}) => {
  const {register, handleSubmit, setError, formState: {errors}, reset, control} = useForm({
    resolver: yupResolver(ValidationSchema)
  });
  const [creating, setCreating] = useState(false);
  const [modal, setModal] = useState(false);
  const alert = useAlert();
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
        roles: entity.roles.map(item => {
          return {
            label: item,
            value: item
          }
        }),
        stores: entity.stores.map(item => {
          return {
            label: item.name,
            value: item.id
          }
        })
      });
    }
  }, [entity]);

  const createUser = async (values: any) => {
    setCreating(true);
    try {
      let url, method = 'POST';
      if (values.id) {
        method = 'PUT';
        url = USER_EDIT.replace(':id', values.id);
      } else {
        url = USER_CREATE;
        delete values.id;
      }

      if (values.roles) {
        values.roles = values.roles.map((item: ReactSelectOptionProps) => item.value);
      }
      if (values.stores) {
        values.stores = values.stores.map((item: ReactSelectOptionProps) => item.value.toString());
      }

      await jsonRequest(url, {
        method: method,
        body: JSON.stringify({
          ...values,
        })
      });

      onModalClose();
    } catch (exception: any) {
      if (exception instanceof HttpException) {
        if (exception.message) {
          alert.error(exception.message);
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
          alert.error(e.errorMessage);
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
      displayName: null,
      email: null,
      username: null,
      password: null,
      roles: null,
      id: null,
      stores: null
    });
  };

  const onModalClose = () => {
    resetForm();
    onClose && onClose();
  }

  console.log(errors)

  return (
    <Modal
      open={modal}
      onClose={onModalClose}
      size="sm"
      title={operation === 'create' ? 'Create user' : 'Update user'}
    >
      <form onSubmit={handleSubmit(createUser)} className="mb-5">
        <input type="hidden" {...register('id')}/>
        <div className="grid grid-cols-1 gap-4 mb-3">
          <div>
            <label htmlFor="displayName">Name</label>
            <Input {...register('displayName')} id="displayName" className="w-full" hasError={hasErrors(errors.displayName)}/>
            {errors.displayName && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.displayName.message}
                </Trans>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="username">Username</label>
            <Input {...register('username')} id="username" className="w-full" hasError={hasErrors(errors.username)}/>
            {errors.username && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.username.message}
                </Trans>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="plainPassword">Password</label>
            <Input {...register('password')} type="password" id="plainPassword" className="w-full" hasError={hasErrors(errors.plainPassword)}/>
            {errors.plainPassword && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.plainPassword.message}
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
            <label htmlFor="roles">Roles</label>
            <Controller
              name="roles"
              control={control}
              render={(props) => (
                <ReactSelect
                  onChange={props.field.onChange}
                  value={props.field.value}
                  options={[{
                    label: 'ROLE_USER',
                    value: 'ROLE_USER'
                  }, {
                    label: 'ROLE_ADMIN',
                    value: 'ROLE_ADMIN'
                  }]}
                  isMulti
                />
              )}
            />

            {errors.roles && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.roles.message}
                </Trans>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="stores">Stores</label>
            <Controller
              name="stores"
              control={control}
              render={(props) => (
                <ReactSelect
                  onChange={props.field.onChange}
                  value={props.field.value}
                  options={stores.map(item => {
                    return {
                      label: item.name,
                      value: item.id
                    }
                  })}
                  isMulti
                />
              )}
            />

            {getErrors(errors.stores)}
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
