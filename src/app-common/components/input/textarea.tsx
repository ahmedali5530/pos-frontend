import {forwardRef, HTMLProps, Ref} from "react";
import classNames from "classnames";

interface InputProps extends HTMLProps<HTMLTextAreaElement>{}

// eslint-disable-next-line react/display-name
export const Textarea = forwardRef((props: InputProps, ref: Ref<HTMLTextAreaElement>) => {
  return (
    <textarea
      {...props}
      className={
        classNames(
          'form-control',
          props.className && props.className
        )
      }
      ref={ref}
    />
  );
});
