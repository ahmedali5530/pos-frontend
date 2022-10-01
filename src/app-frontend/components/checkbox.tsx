import {HTMLProps} from "react";
import classNames from "classnames";

interface InputProps extends HTMLProps<HTMLInputElement>{}

export const Checkbox = (props: InputProps) => {
  return (
    <input
      {...props}
      type="checkbox"
      className={
        classNames(
          'font-sans inline-flex h-[40px] w-[40px] relative cursor-pointer',
          'border-2 border-gray-500 rounded-lg shadow-sm',
          'focus:outline-none focus:ring focus:ring-blue-200 focus:border-blue-500 bg-white',
          'appearance-none',
          "before:absolute checked:before:bg-blue-500 before:w-[20px] before:h-[20px] before:top-[8px] before:left-[8px] checked:border-blue-500 before:rounded",
          props.className && props.className
        )
      }
    />
  );
};
