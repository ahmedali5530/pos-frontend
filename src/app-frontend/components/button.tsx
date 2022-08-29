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
      {...props}
      className={
        classNames(
          'btn', props.variant && 'btn-' + props.variant,
          props.active ? 'border-4' : 'border-2',
          props.className && props.className
        )
      }
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
};
