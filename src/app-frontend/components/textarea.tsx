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
          'font-sans block text-sm leading-5 w-full py-2 px-3',
          'border-2 border-purple-500 text-gray-500 rounded-lg shadow-sm',
          'focus:outline-none focus:ring focus:ring-purple-200 focus:border-purple-500',
          props.className && props.className
        )
      }
      ref={ref}
    />
  );
});