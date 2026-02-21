import {forwardRef, InputHTMLAttributes, ReactNode, Ref, useCallback, useMemo} from "react";
import classNames from "classnames";
import {NumericFormat} from "react-number-format";
import {nanoid} from "nanoid";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "lg"
  selectable?: boolean;
  hasError?: boolean;
  label?: ReactNode;
  error?: any;
}

// eslint-disable-next-line react/display-name
export const Input = forwardRef((props: InputProps, ref: Ref<any>) => {
  const {selectable, inputSize, hasError, label, error, id: providedId, ...rest} = props;
  const onClick = useCallback((event: any) => {
    if (selectable !== false) {
      event.currentTarget.select();
    }
  }, [selectable]);

  const id = useMemo(() => providedId ?? nanoid(), [providedId]);

  if (props.type === 'number') {
    return (
      <>
        {label && <label htmlFor={id}>{label}</label>}
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
          placeholder={props.placeholder}
          autoFocus={props.autoFocus}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          id={id}
        />
      </>
    );
  } else {
    return (
      <>
        {label && <label htmlFor={id}>{label}</label>}
        <input
          type="text"
          onClick={onClick}
          autoComplete="off"
          {...rest}
          id={id}
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
      </>
    );
  }
});
