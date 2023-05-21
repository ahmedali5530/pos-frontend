import {HTMLProps, useEffect, useRef} from "react";
import classNames from "classnames";
import _ from "lodash";

interface InputProps extends HTMLProps<HTMLInputElement>{
  indeterminate?: boolean;
}

export const Checkbox = (props: InputProps) => {
  let ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if(ref.current !== null){
      ref.current.indeterminate = false;
      if(_.isBoolean(props.indeterminate)) {
        ref.current.indeterminate = props.indeterminate;
      }
    }
  }, [props.indeterminate, props.checked]);


  return (
    <input
      {...props}
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
