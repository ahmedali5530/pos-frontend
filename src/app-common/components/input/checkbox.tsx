import {HTMLProps, ReactNode, useEffect, useMemo, useRef} from "react";
import classNames from "classnames";
import _ from "lodash";
import {nanoid} from "nanoid";

interface InputProps extends HTMLProps<HTMLInputElement>{
  indeterminate?: boolean;
  label?: string
}

export const Checkbox = (props: InputProps) => {
  let ref = useRef<HTMLInputElement|null>(null);
  const {indeterminate, ...rest} = props;

  useEffect(() => {
    if(ref.current !== null){
      ref.current.indeterminate = false;
      if(_.isBoolean(indeterminate)) {
        ref.current.indeterminate = indeterminate;
      }
    }
  }, [indeterminate, props.checked]);

  const id = props.id || nanoid(8);

  return (
    <label htmlFor={id} className="inline-flex items-center gap-5">
      <input
        {...rest}
        id={id}
        ref={ref}
        type="checkbox"
        className={
          classNames(
            'checkbox mousetrap',
            props.className && props.className
          )
        }
      />

      {props?.label}
    </label>
  );
};
