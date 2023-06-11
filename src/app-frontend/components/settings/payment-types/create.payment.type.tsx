import React, {FC, useEffect, useState} from "react";
import {Modal} from "../../../../app-common/components/modal/modal";
import {Controller, useForm} from "react-hook-form";
import {PAYMENT_TYPE_CREATE, PAYMENT_TYPE_GET} from "../../../../api/routing/routes/backend.app";
import {ReactSelectOptionProps} from "../../../../api/model/common";
import {fetchJson} from "../../../../api/request/request";
import {HttpException, UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {ConstraintViolation, ValidationResult} from "../../../../lib/validator/validation.result";
import {Trans} from "react-i18next";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {Switch} from "../../../../app-common/components/input/switch";
import {StoresInput} from "../../../../app-common/components/input/stores";
import * as yup from 'yup';
import {ValidationMessage} from "../../../../api/model/validation";
import {yupResolver} from "@hookform/resolvers/yup";
import {Button} from "../../../../app-common/components/input/button";
import {Input} from "../../../../app-common/components/input/input";
import {PaymentType} from "../../../../api/model/payment.type";
import {notify} from "../../../../app-common/components/confirm/notification";
import {getErrorClass, getErrors, hasErrors} from "../../../../lib/error/error";


interface CreatePaymentTypeProps {
  entity?: PaymentType;
  operation?: string;
  addModal: boolean;
  onClose?: () => void;
}

const ValidationSchema = yup.object({
  name: yup.string().required(ValidationMessage.Required),
  type: yup.object().required(ValidationMessage.Required),
  stores: yup.array().required(ValidationMessage.Required)
});

export const CreatePaymentType: FC<CreatePaymentTypeProps> = ({
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
        type: {
          label: entity.type,
          value: entity.type
        },
        stores: entity.stores.map(item => {
          return {
            label: item.name,
            value: item['@id']
          }
        })
      });
    }
  }, [entity]);

  const createPaymentType = async (values: any) => {
    setCreating(true);
    try {
      let url, method = 'POST';
      if (values.id) {
        method = 'PUT';
        url = PAYMENT_TYPE_GET.replace(':id', values.id);
      } else {
        url = PAYMENT_TYPE_CREATE;
        delete values.id;
      }

      if (values.type) {
        values.type = values.type.value;
      }

      if (values.stores) {
        values.stores = values.stores.map((item: ReactSelectOptionProps) => item.value);
      }

      await fetchJson(url, {
        method: method,
        body: JSON.stringify({
          ...values,
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
      title={operation === 'create' ? 'Create payment type' : 'Update payment type'}
    >
      <form onSubmit={handleSubmit(createPaymentType)} className="mb-5">
        <input type="hidden" {...register('id')}/>
        <div className="grid grid-cols-1 gap-4 mb-3">
          <div>
            <label htmlFor="name">Name</label>
            <Input {...register('name')} id="name" className="w-full" hasError={hasErrors(errors.name)}/>
            {getErrors(errors.name)}
          </div>
          <div>
            <label htmlFor="type">Type</label>
            <Controller
              name="type"
              control={control}
              render={(props) => (
                <ReactSelect
                  onChange={props.field.onChange}
                  value={props.field.value}
                  options={[{
                    label: 'cash',
                    value: 'cash'
                  }, {
                    label: 'credit card',
                    value: 'credit card'
                  }, {
                    label: 'credit',
                    value: 'credit'
                  }]}
                  className={getErrorClass(errors.type)}
                />
              )}
            />
            {getErrors(errors.type)}
          </div>
          <div>
            <label className="w-full block">&nbsp;</label>
            <Controller
              control={control}
              name="canHaveChangeDue"
              render={(props) => (
                <Switch
                  checked={props.field.value}
                  onChange={props.field.onChange}
                >
                  Can accept amount greater then total?
                </Switch>
              )}
            />
            {getErrors(errors.canHaveChangeDue)}
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
