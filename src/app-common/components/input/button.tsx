import {ButtonHTMLAttributes} from "react";
import classNames from "classnames";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSpinner} from "@fortawesome/free-solid-svg-icons";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "lg" | "xl" | "sm"
  active?: boolean;
  variant?: 'primary'|'secondary'|'danger'|'warning'|'success'|string;
  iconButton?: boolean;
  key?: any
  icon?: IconProp;
  rightIcon?: IconProp;
  isLoading?: boolean
}

export const Button = (props: ButtonProps) => {
  const {active, variant, size, iconButton, icon, rightIcon, isLoading, children, ...rest} = props;
  return (
    <button
      // tabIndex={-1}
      {...rest}
      className={
        classNames(
          'btn border-2', variant && 'btn-' + variant,
          props.active ? 'active' : '',
          size && size,
          iconButton && 'btn-square',
          props.className && props.className
        )
      }
      disabled={props.disabled}
    >
      {icon && (
        <span className={children === undefined ? '' : 'mr-2'}>
          <FontAwesomeIcon icon={icon}/>
        </span>
      )}
      {isLoading && (
        <FontAwesomeIcon icon={faSpinner} spin/>
      )}
      {props.children}
      {rightIcon && (
        <span className={children === undefined ? '' : 'ml-2'}>
          <FontAwesomeIcon icon={rightIcon}/>
        </span>
      )}
    </button>
  );
};
