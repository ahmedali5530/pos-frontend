import {ChangeEvent, forwardRef, HTMLProps, Ref, useCallback, useEffect, useRef, useState} from "react";
import {VirtualKeyboard} from "./virtual.keyboard.tsx";
import {useAtom} from "jotai";
import {defaultData, defaultState} from "../../../store/jotai";
import classNames from "classnames";

interface InputProps extends HTMLProps<HTMLTextAreaElement>{
  label?: string;
  enableKeyboard?: boolean;
}

export const Textarea = forwardRef((
  props: InputProps, ref: Ref<HTMLTextAreaElement>
) => {
  const {enableKeyboard = false, ...rest} = props;

  const [showKeyboard, setShowKeyboard] = useState(false);
  const [keyboardValue, setKeyboardValue] = useState((props.value as any)?.toString?.() || '');
  const inputElRef = useRef<HTMLTextAreaElement | null>(null);

  const [{enableTouch}] = useAtom(defaultData);

  const assignRef = useCallback((node: HTMLTextAreaElement | null) => {
    inputElRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref && typeof (ref as any) === 'object') {
      (ref as any).current = node;
    }
  }, [ref]);

  const handleMouseDownOpen = useCallback((e: any) => {
    if (props.onMouseDown) props.onMouseDown(e);
    if (!(enableKeyboard && enableTouch)) return;
    if (e.defaultPrevented) return;
    e.preventDefault();
    setKeyboardValue((props.value as any)?.toString?.() || '');
    setShowKeyboard(true);
  }, [enableKeyboard, enableTouch, props.onMouseDown, props.value]);

  const handleKeyboardClose = useCallback(() => {
    setShowKeyboard(false);
    if (inputElRef.current) {
      requestAnimationFrame(() => {
        if (inputElRef.current) inputElRef.current.blur();
      });
    }
  }, []);

  const emitKeyboardChange = useCallback((value: string) => {
    if (!props.onChange) {
      return;
    }

    const syntheticEvent = {
      target: {value},
      currentTarget: {value},
    } as ChangeEvent<HTMLTextAreaElement>;

    props.onChange(syntheticEvent);
  }, [props]);

  // Keep internal keyboardValue in sync with external value when keyboard is not open
  useEffect(() => {
    if (!(enableKeyboard && enableTouch)) return;
    if (!showKeyboard) {
      const next = (props.value as any)?.toString?.() || '';
      if (next !== keyboardValue) {
        setKeyboardValue(next);
      }
    }
  }, [props.value, enableKeyboard, enableTouch, showKeyboard]);

  return (
    <>
      <textarea
        {...rest}
        className={
          classNames(
            'form-control mousetrap',
            props.className && props.className
          )
        }
        ref={assignRef}
        value={enableKeyboard && enableTouch ? keyboardValue : rest.value}
        onChange={enableKeyboard && enableTouch ? undefined : rest.onChange}
        readOnly={enableKeyboard && enableTouch ? true : rest.readOnly}
        onMouseDown={enableKeyboard && enableTouch ? handleMouseDownOpen : rest.onMouseDown}
      />
      {enableKeyboard && enableTouch && showKeyboard && (
        <VirtualKeyboard
          open={showKeyboard}
          onClose={handleKeyboardClose}
          type={undefined}
          placeholder={props.placeholder}
          value={keyboardValue}
          onChange={(v) => {
            setKeyboardValue(v);
            emitKeyboardChange(v);
          }}
        />
      )}
    </>
  );
});
