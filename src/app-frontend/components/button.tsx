import {ButtonHTMLAttributes} from "react";
import classNames from "classnames";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "lg" | "xl" | "sm"
  active?: boolean;
  variant?: string;
}

export const Button = (props: ButtonProps) => {
  return (
    <button
      tabIndex={-1}
      {...props}
      className={
        classNames(
          'btn border-2', props.variant && 'btn-' + props.variant,
          props.active ? 'active' : '',
          props.size && props.size,
          props.className && props.className
        )
      }
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
};
