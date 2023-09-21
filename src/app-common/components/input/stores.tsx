import React, {FC, useEffect, useState} from "react";
import {Store} from "../../../api/model/store";
import {fetchJson} from "../../../api/request/request";
import {STORE_LIST} from "../../../api/routing/routes/backend.app";
import {Controller, UseFormReturn} from "react-hook-form";
import {ReactSelect} from "./custom.react.select";
import {Trans} from "react-i18next";
import {getErrorClass, getErrors, hasErrors} from "../../../lib/error/error";

interface StoresInputProps{
  control: UseFormReturn['control'];
  errors: UseFormReturn['formState']['errors'];
  valueAsNumber?: boolean;
  name?: string;
}

export const StoresInput: FC<StoresInputProps> = ({
  control, errors, valueAsNumber, name
}) => {
  const [stores, setStores] = useState<Store[]>([]);
  const loadStores = async () => {
    try {
      const res = await fetchJson(STORE_LIST);
      setStores(res['hydra:member']);
    } catch (e) {
      throw e;
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  return (
    <div>
      <label htmlFor="stores">Stores</label>
      <Controller
        name={name || "stores"}
        control={control}
        render={(props) => (
          <ReactSelect
            onChange={props.field.onChange}
            value={props.field.value}
            options={stores.map(item => {
              return {
                label: item.name,
                value: valueAsNumber ? item.id : item['@id']
              }
            })}
            isMulti
            className={getErrorClass(errors.stores)}
          />
        )}
      />

      {getErrors(errors.stores)}
    </div>
  );
}
