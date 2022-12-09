import React from "react";
import Select, {GroupBase, Props} from "react-select";
import {Theme} from "react-select/dist/declarations/src/";

const primaryColor = 'rgb(0 149 255 / 1)';

export const themeConfig = (theme: Theme) => ({
  ...theme,
  borderRadius: 8,
  colors: {
    ...theme.colors,
    primary: primaryColor,
    primary25: 'rgba(0, 149, 255, 0.25)',
    primary50: 'rgba(0, 149, 255, 0.50)',
    primary75: 'rgba(0, 149, 255, 0.75)'
  }
});

export const styleConfig = {
  control: (base: any, props: any) => ({
    ...base,
    minHeight: 40,
    borderColor: primaryColor,
    borderWidth: 2,
    ':hover': {
      borderColor: primaryColor
    },
    '--tw-shadow': '0 0 #0000',
    '--tw-shadow-colored': '0 0 #0000',
    '--tw-ring-offset-shadow': 'var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)',
    '--tw-ring-shadow': 'var(--tw-ring-inset) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color)',
    outline: '2px solid transparent',
    outlineOffset: '2px',
    '--tw-ring-color': 'rgb(153 213 255 / 1)',
    boxShadow: props.isFocused ? 'var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000)' : 'none'
  })
};

export const classNamePrefix = 'rs-';

export function ReactSelect<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
  >(props: Props<Option, IsMulti, Group>) {
  return (
    <Select
      {...props}
      theme={themeConfig}
      styles={styleConfig}
      classNamePrefix={classNamePrefix}
    />
  );
}
