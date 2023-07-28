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
  const {selectable, inputSize, hasError, ...rest} = props;
  const onClick = useCallback((event: any) => {
    if(selectable !== false){
      event.currentTarget.select();
    }
  }, [selectable]);

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
            inputSize === 'lg' && 'lg',
            props.className && props.className,
            hasError && 'error'
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
        {...rest}
        className={
          classNames(
            'input',
            inputSize === 'lg' && 'lg',
            props.className && props.className,
            hasError && 'error'
          )
        }
        ref={ref}
      />
    );
  }
});
