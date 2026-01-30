import React, {FC, useEffect, useState} from "react";
import {Store} from "../../../api/model/store";
import {Controller, UseFormReturn} from "react-hook-form";
import {ReactSelect} from "./custom.react.select";
import {getErrorClass, getErrors} from "../../../lib/error/error";
import {useDB} from "../../../api/db/db";
import {Tables} from "../../../api/db/tables";

interface StoresInputProps {
  control: UseFormReturn['control'];
  errors: UseFormReturn['formState']['errors'];
  valueAsNumber?: boolean;
  name?: string;
}

export const StoreInput: FC<StoresInputProps> = ({
  control, errors, valueAsNumber, name
}) => {
  const [stores, setStores] = useState<Store[]>([]);
  const db = useDB();
  const loadStores = async () => {
    try {
      const [stores] = await db.query(`SELECT *
                                       FROM ${Tables.store}`)
      setStores(stores);
    } catch (e) {
      throw e;
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  return (
    <div>
      <label htmlFor="store">Store</label>
      <Controller
        name={name || "store"}
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
            className={getErrorClass(errors.store)}
          />
        )}
      />

      {getErrors(errors.store)}
    </div>
  );
}
