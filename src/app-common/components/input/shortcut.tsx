import {FC, InputHTMLAttributes, PropsWithChildren, useEffect} from "react";
import classNames from "classnames";
import {useSelector} from "react-redux";
import {getShortcut} from "../../../duck/shortcuts/shortcut.selector";

interface Props extends PropsWithChildren, InputHTMLAttributes<HTMLSpanElement>{
  shortcut: string;
  handler: (e: Event) => void;
}

const Mousetrap = require('mousetrap');

export const Shortcut: FC<Props> = ({children, ...rest}) => {
  const state = useSelector(getShortcut);

  useEffect(() => {
    if(state){
      Mousetrap.bind(rest.shortcut, function (e: Event) {
        e.preventDefault();
        e.stopPropagation();

        rest.handler(e);

        return false;
      });
    }
  }, [state, rest]);

  if(!state){
    return (<></>);
  }

  return (
    <span
      {...rest}
      className={
        classNames(
          "text-sm ml-2 bg-gray-500/70 text-gray-50 px-1 rounded",
          rest.className && rest.className
        )
      }
    >
      <>{rest.shortcut}</>
    </span>
  );
};
