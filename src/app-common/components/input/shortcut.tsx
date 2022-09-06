import {FC, InputHTMLAttributes, PropsWithChildren} from "react";
import {Trans} from "react-i18next";
import classNames from "classnames";

interface Props extends PropsWithChildren, InputHTMLAttributes<HTMLSpanElement>{}

export const Shortcut: FC<Props> = ({children, ...rest}) => {
  return (
    <span {...rest} className={
      classNames(
        "text-slate-400 text-sm text-bold font-bold",
        rest.className && rest.className
      )
    }>
      <Trans>{children}</Trans>
    </span>
  );
};
