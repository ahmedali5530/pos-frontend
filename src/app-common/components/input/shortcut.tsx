import {FC, InputHTMLAttributes, PropsWithChildren, useEffect, useState} from "react";
import classNames from "classnames";
import {useSelector} from "react-redux";
import {displayShortcut, getShortcut} from "../../../duck/shortcuts/shortcut.selector";

interface Props extends PropsWithChildren, InputHTMLAttributes<HTMLSpanElement>{
  shortcut: string;
  handler: (e: Event) => void;
  invisible?: boolean;
}

const Mousetrap = require('mousetrap');

export const Shortcut: FC<Props> = ({children, ...rest}) => {
  const state = useSelector(getShortcut);
  const displayShortcuts = useSelector(displayShortcut);

  const [visible, setVisible] = useState<boolean|undefined>(rest.invisible);

  useEffect(() => {
    setVisible(displayShortcuts);
  }, [displayShortcuts]);

  useEffect(() => {
    const handler = function (e: Event) {
      e.preventDefault();
      e.stopPropagation();

      rest.handler(e);

      return false;
    };

    if(state){
      Mousetrap.bind(rest.shortcut, handler);
    }else{
      Mousetrap.unbind(rest.shortcut, handler);
    }

    return () => Mousetrap.unbind(rest.shortcut, handler);
  }, [state, rest]);

  if(!state){
    return (<></>);
  }

  if(rest.invisible){
    return (<></>);
  }

  return (
    <>
      {visible && (
        <span
          {...rest}
          className={
            classNames(
              "text-sm ml-2 bg-black/70 text-white px-1 rounded shadow",
              rest.className && rest.className
            )
          }
        >
        {rest.shortcut}
      </span>
      )}
    </>
  );
};
