import {createRef, forwardRef, InputHTMLAttributes, Ref, useCallback, useEffect} from "react";
import classNames from "classnames";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "lg"
  selectable?: boolean;
  innerRef?: any;
  focus?: boolean;
}

// eslint-disable-next-line react/display-name
export const Input = forwardRef((props: InputProps, ref: Ref<HTMLInputElement>) => {
  const inputRef = createRef<HTMLInputElement>();


  const onClick = useCallback(() => {
    if (!ref && inputRef.current && props.selectable) {
      inputRef.current.select();
    }
  }, [ref, inputRef, props.selectable]);

  useEffect(() => {
    if (inputRef.current !== null) {
      // inputRef.current.select();
    }
  }, [props.focus, inputRef]);

  return (
    <input
      type="text"
      onClick={onClick}
      autoComplete="off"
      {...props}
      className={
        classNames(
          'input',
          props.inputSize === 'lg' ? 'min-h-[48px]' : '',
          props.className && props.className
        )
      }
      ref={ref || inputRef}
    />
  );
});
