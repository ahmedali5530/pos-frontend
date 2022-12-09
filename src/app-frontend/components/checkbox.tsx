import {HTMLProps} from "react";
import classNames from "classnames";

interface InputProps extends HTMLProps<HTMLInputElement>{}

export const Checkbox = (props: InputProps) => {
  return (
    <input
      {...props}
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
