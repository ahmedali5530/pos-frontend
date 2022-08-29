import classNames from "classnames";
import React, {FunctionComponent, useEffect, useState} from "react";
import { Controller } from "react-hook-form";
import {useTranslation} from "react-i18next";

interface TextareaProps {
    label: string;
    defaultValue?: string;
    error?: string;
    disabled?: boolean;
    control: any;
    name: string;
    maxChars?: number;
    watch?: any;
}

export const Textarea: FunctionComponent<TextareaProps> = ({
  control, label, error, disabled
  , defaultValue, name,
  maxChars: maximumChars, watch
}) => {
  const [maxChars, setMaxChars] = useState(2000);
  const [writtenChars, setWrittenChars] = useState(0);

  const id = Math.random().toString();

  useEffect(() => {
    if(maximumChars){
      setMaxChars(maximumChars);
    }
  }, [maximumChars]);

  useEffect(() => {
    if(watch){
      if(watch(name).trim().length === 0){
        setWrittenChars(0);
      }
    }
  }, [watch]);

  const {t} = useTranslation();

  return (
    <>
      <label htmlFor={id} className="form-label">{t(label)}</label>
      <Controller
        render={(props) => (
          <textarea
            id={id}
            className={
              classNames(
                "form-control",
                error ? 'is-invalid' : ''
              )
            }
            name={name}
            maxLength={maxChars}
            onChange={(value) => {
              setWrittenChars(value.target.value.length)
              props.field.onChange(value);
            }}
            value={props.field.value}
          />
        )}
        defaultValue={defaultValue}
        name={name}
        control={control}
      />

      {error && (
        <div className="invalid-feedback">{error}</div>
      )}
      <small className="text-muted">{writtenChars}/{maxChars}</small>
    </>
  );
};
