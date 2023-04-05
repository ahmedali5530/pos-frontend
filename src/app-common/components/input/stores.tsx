import React, {FC, useEffect, useState} from "react";
import {Store} from "../../../api/model/store";
import {fetchJson} from "../../../api/request/request";
import {STORE_LIST} from "../../../api/routing/routes/backend.app";
import {Controller, UseFormReturn} from "react-hook-form";
import {ReactSelect} from "./custom.react.select";
import {Trans} from "react-i18next";

interface StoresInputProps{
  control: UseFormReturn['control'];
  errors: UseFormReturn['formState']['errors'];
}

export const StoresInput: FC<StoresInputProps> = ({
  control, errors
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
        name="stores"
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
            isMulti
          />
        )}
      />

      {errors.stores && (
        <div className="text-danger-500 text-sm">
          <Trans>
            {errors.stores.message}
          </Trans>
        </div>
      )}
    </div>
  );
}
