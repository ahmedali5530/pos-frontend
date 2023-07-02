import {
  createRef,
  forwardRef,
  InputHTMLAttributes,
  MouseEventHandler,
  Ref,
  useCallback,
  useImperativeHandle,
  useRef
} from "react";
import classNames from "classnames";
import {NumericFormat} from "react-number-format";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "lg"
  selectable?: boolean;
  hasError?: boolean;
}

// eslint-disable-next-line react/display-name
export const Input = forwardRef((props: InputProps, ref: Ref<any>) => {
  const onClick = useCallback((event: any) => {
    if(props.selectable !== false){
      event.currentTarget.select();
    }
  }, [props.selectable]);

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
        getInputRef={ref}
        onClick={onClick}
        readOnly={props.readOnly}
        disabled={props.disabled}
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
        ref={ref}
      />
    );
  }
});
