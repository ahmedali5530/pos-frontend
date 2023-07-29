import {ButtonHTMLAttributes} from "react";
import classNames from "classnames";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "lg" | "xl" | "sm"
  active?: boolean;
  variant?: 'primary'|'secondary'|'danger'|'warning'|'success'|string;
}

export const Button = (props: ButtonProps) => {
  const {active, variant, size, ...rest} = props;
  return (
    <button
      // tabIndex={-1}
      {...rest}
      className={
        classNames(
          'btn border-2', variant && 'btn-' + variant,
          props.active ? 'active' : '',
          size && size,
          props.className && props.className
        )
      }
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
};
