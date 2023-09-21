import { Button } from "../../../app-common/components/input/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { Modal } from "../../../app-common/components/modal/modal";
import { Order } from "../../../api/model/order";
import { Controller, useForm } from "react-hook-form";
import { Input } from "../../../app-common/components/input/input";
import { fetchJson } from "../../../api/request/request";
import { ORDERS_LIST } from "../../../api/routing/routes/backend.app";
import { QueryString } from "../../../lib/location/query.string";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { DateTime } from "luxon";

interface Props {
  onSuccess: (order: Order) => void,
  onError: () => void,
  title: string,
  variant: string,
  icon: IconProp;
  displayLabel?: boolean;
  active?: boolean;
  onClick?: () => void;
}

export const SaleFind = ({
  onSuccess, onError, variant, icon, title, displayLabel, active, onClick
}: Props) => {
  const [modal, setModal] = useState(false);
  const { control, handleSubmit, reset } = useForm();
  const [isLoading, setLoading] = useState(false);

  const onSubmit = async (values: any) => {
    setLoading(true)
    try {
      const query = QueryString.stringify(values);
      const response = await fetchJson(`${ORDERS_LIST}?${query}`);

      if( response?.['hydra:member'].length > 0 ) {
        onSuccess(response?.['hydra:member'][0]);
        setModal(false)
      } else {
        onError();
      }
    } catch ( e ) {
      throw e;
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reset({
      orderId: ''
    });
  }, [modal])

  return (
    <>
      <Tooltip title={title}>
        <Button
          variant={variant}
          type="button"
          onClick={() => {
            setModal(true);
            onClick && onClick();
          }}
          size="lg"
          active={active}
        ><FontAwesomeIcon icon={icon} className={displayLabel ? 'mr-2' : ''}/>{displayLabel && title}</Button>
      </Tooltip>
      <Modal open={modal} title={title} onClose={() => {
        setModal(false)
      }} shouldCloseOnEsc={true} size="sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group w-full">
            <Controller
              render={({ field }) => (
                <Input
                  placeholder="Search by Order# or scan QR Code/Barcode"
                  value={field.value}
                  onChange={field.onChange}
                  className="search-field flex-1"
                  autoFocus={true}
                  type="number"
                />
              )}
              name="orderId"
              control={control}
              defaultValue=""
            />
            <Button type="submit" variant="primary" className="w-28" disabled={isLoading}>
              {isLoading ? 'Finding...' : 'Find'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
