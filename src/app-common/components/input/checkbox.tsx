import {HTMLProps, useEffect, useRef} from "react";
import classNames from "classnames";
import _ from "lodash";

interface InputProps extends HTMLProps<HTMLInputElement>{
  indeterminate?: boolean;
}

export const Checkbox = (props: InputProps) => {
  let ref = useRef<HTMLInputElement>(null);
  const {indeterminate, ...rest} = props;

  useEffect(() => {
    if(ref.current !== null){
      ref.current.indeterminate = false;
      if(_.isBoolean(indeterminate)) {
        ref.current.indeterminate = indeterminate;
      }
    }
  }, [indeterminate, props.checked]);

  return (
    <input
      {...rest}
      ref={ref}
      type="checkbox"
      className={
        classNames(
          'checkbox',
          props.className && props.className
        )
      }
    />
  );
};
