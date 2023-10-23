import React, { InputHTMLAttributes, Ref } from "react";
import { Input } from "./input";
import { useSelector } from "react-redux";
import { getTouch } from "../../../duck/touch/touch.selector";
import { ReactKeyboard } from "./react.keyboard";
import { useAtom } from "jotai";
import { defaultData } from "../../../store/jotai";

interface KeyboardInputProps extends InputHTMLAttributes<HTMLInputElement> {
  triggerWithIcon?: boolean;
}

export const KeyboardInput = React.forwardRef(
  (props: KeyboardInputProps, ref: Ref<HTMLInputElement>) => {
    const [defaultState] = useAtom(defaultData);
    const { enableTouch: isTouch } = defaultState;

    if (!isTouch) {
      return <Input {...props} ref={ref} />;
    } else {
      return <ReactKeyboard {...props} ref={ref} />;
    }
  }
);
