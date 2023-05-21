import {createRef, forwardRef, InputHTMLAttributes, Ref, useCallback} from "react";
import classNames from "classnames";
import {NumericFormat} from "react-number-format";
import {hasErrors} from "../../../lib/error/error";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "lg"
  selectable?: boolean;
  hasError?: boolean;
}

// eslint-disable-next-line react/display-name
export const Input = forwardRef((props: InputProps, ref: Ref<any>) => {
  const inputRef = createRef<HTMLInputElement>();


  const onClick = useCallback(() => {
    if (!ref && inputRef.current && props.selectable) {
      inputRef.current.select();
    }
  }, [ref, inputRef, props.selectable]);

  if(props.type === 'number'){

    return (
      <NumericFormat
        name={props.name}
        value={props.value as any}
        defaultValue={props.defaultValue as any}
        onChange={props.onChange}
        autoComplete="off"
        className={
          classNames(
            'input',
            props.inputSize === 'lg' && 'lg',
            props.className && props.className,
            props.hasError && 'error'
          )
        }
        getInputRef={ref || inputRef}
      />
    );
  }else {
    return (
      <input
        type="text"
        onClick={onClick}
        autoComplete="off"
        {...props}
        className={
          classNames(
            'input',
            props.inputSize === 'lg' && 'lg',
            props.className && props.className,
            props.hasError && 'error'
          )
        }
        ref={ref || inputRef}
      />
    );
  }
});
