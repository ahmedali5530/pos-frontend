import Keyboard, { KeyboardReactInterface } from "react-simple-keyboard";
import React, { FC, forwardRef, InputHTMLAttributes, Ref, useEffect, useRef, useState } from "react";
import "react-simple-keyboard/build/css/index.css";
import { Input } from "./input";
import { Modal } from "../modal/modal";
import classNames from "classnames";
import { Button } from "./button";

interface ReactKeyboardProps extends InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "lg"
  selectable?: boolean;
  innerRef?: any;
  focus?: boolean;
  triggerWithIcon?: boolean;
  ref?: any;
}

export const LayoutNames = {
  text: 'default',
  number: 'numeric'
};

export const ReactKeyboard: FC<ReactKeyboardProps> = forwardRef((props: ReactKeyboardProps, ref: Ref<HTMLInputElement>) => {

  const [input, setInput] = useState<string>('');
  // @ts-ignore
  const [layout, setLayout] = useState(LayoutNames[props.type || 'text']);

  const [show, setShow] = useState(false);
  const [isShift, setShift] = useState(false);

  const keyboard = useRef<KeyboardReactInterface>();
  const onChange = (input: string, event?: MouseEvent) => {
    setInput(input);
  };

  const handleShift = () => {
    // @ts-ignore
    const newLayoutName = layout === "default" ? 'shift' : LayoutNames[props.type || 'text'];
    setLayout(newLayoutName);
  };

  const onKeyPress = (button: string) => {
    if( isShift ) {
      setShift(false);
      handleShift();
    }

    if( button === '{cancel}' || button === '{ok}' ) {
      setShow(false);
    }

    if( button === '{clear}' ) {
      let val = '';
      if( props.type === 'number' ) {
        val = '0';
      }
      setInput(val);
      keyboard.current!.setInput(val);
    }

    /**
     * If you want to handle the shift and caps lock buttons
     */
    if( button === '{shift}' ) {
      setShift(true);
    }

    if( button === "{shift}" || button === "{lock}" ) handleShift();
  };

  const onChangeInput = (event: any) => {
    let input = event.target.value;
    if( props.type === 'number' ) {
      input = parseFloat(input).toString();
    }
    setInput(input);
    keyboard.current!.setInput(input);
  };

  useEffect(() => {
    setInput(props?.value as string);
    if( keyboard.current ) {
      keyboard?.current!.setInput(props?.value as string);
    }
  }, [keyboard?.current]);

  return (
    <>
      <div className="input-group">
        <Input
          {...props}
          value={input}
          onChange={props.onChange}
          onFocus={() => {
            if( props.triggerWithIcon ) {
              return false;
            }

            setShow(true)
          }}
          className={classNames(
            !props.triggerWithIcon && 'keyboard-input',
            props.className
          )}
          ref={ref}
        />
        {props.triggerWithIcon && (
          <Button
            type="button"
            className="keyboard-input-button btn-primary w-[40px]"
            onClick={() => {
              setShow(true)
            }}
          ></Button>
        )}

      </div>
      {show && (
        <Modal open={show} onClose={() => {
          setShow(false);
        }} title="&nbsp;" size={'bottom-sheet'}>
          <Keyboard
            keyboardRef={r => (keyboard.current = r)}
            onChange={onChange}
            onKeyPress={onKeyPress}
            layoutName={layout}
            display={{
              '{ok}': 'OK',
              '{clear}': 'C',
              '{cancel}': 'Cancel',
              '{decimal}': '.'
            }}
            mergeDisplay={true}
            layout={{
              default: [
                '1 2 3 4 5 6 7 8 9 0 - = {bksp}',
                'q w e r t y u i o p [ ] \\',
                '{lock} a s d f g h j k l ; \' {enter}',
                '{shift} z x c v b n m , {decimal} / {shift}',
                '{space} {ok} {clear}'
              ],
              shift: [
                '~ ! @ # $ % ^ &amp; * ( ) _ + {bksp}',
                'Q W E R T Y U I O P { } |',
                '{lock} A S D F G H J K L : " {enter}',
                '{shift} Z X C V B N M &lt; &gt; ? {shift}',
                '{space} {ok} {clear}'
              ],
              numeric: [
                '7 8 9',
                '4 5 6',
                '1 2 3',
                '{clear} . 0 {ok}'
              ]
            }}
            buttonTheme={[
              {
                buttons: '{ok}',
                class: 'btn btn-primary'
              }, {
                buttons: '{clear}',
                class: 'btn btn-danger'
              }
            ]}
          />
        </Modal>
      )}
    </>
  );
});
