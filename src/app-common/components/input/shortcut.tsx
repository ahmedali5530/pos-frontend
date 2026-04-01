import {
  FC,
  InputHTMLAttributes,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import classNames from "classnames";
import Mousetrap from "mousetrap";
import "mousetrap/plugins/global-bind/mousetrap-global-bind";
import { defaultData } from "../../../store/jotai";
import { useAtom } from "jotai";

interface Props
  extends PropsWithChildren,
    InputHTMLAttributes<HTMLSpanElement> {
  shortcut: string;
  handler: (e: Event) => void;
  invisible?: boolean;
  disabled?: boolean
}

export const Shortcut: FC<Props> = ({ children, disabled, ...rest }) => {
  const [{ displayShortcuts, enableShortcuts }] = useAtom(defaultData);

  const [visible, setVisible] = useState<boolean | undefined>(rest.invisible);

  useEffect(() => {
    setVisible(displayShortcuts);
  }, [displayShortcuts]);

  useEffect(() => {
    const handler = function (e: any) {
      // const inputNodes = ["INPUT", "TEXTAREA"];

      // only run shortcuts when there is no modal active
      if (!document.body.classList.contains("ReactModal__Body--open")) {
        e.stopPropagation();
        e.preventDefault();

        rest.handler(e);

        return;
      }

      return false;
    };

    if (enableShortcuts) {
      (Mousetrap as any).bindGlobal(rest.shortcut, handler);
    }

    if(disabled || enableShortcuts === false){
      (Mousetrap as any).unbind(rest.shortcut, handler);
    }

    return () => (Mousetrap as any).unbind(rest.shortcut, handler);
  }, [enableShortcuts, rest, disabled]);

  if (!enableShortcuts) {
    return <></>;
  }

  if (rest.invisible) {
    return <></>;
  }

  return (
    <>
      {visible && (
        <span
          {...rest}
          className={classNames(
            "text-sm ml-2 bg-black/70 text-white px-1 rounded shadow",
            rest.className && rest.className
          )}>
          {rest.shortcut}
        </span>
      )}
    </>
  );
};
