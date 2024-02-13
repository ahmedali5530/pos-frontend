import React from "react";
import Select, { GroupBase, Props } from "react-select";
import { Theme } from "react-select/dist/declarations/src/";
// @ts-ignore
import Spinner from "../../../assets/images/spinner.svg";

const primaryColor = "0 70 254";
const focusRingColor = "152 189 254";

export const themeConfig = (theme: Theme) => ({
  ...theme,
  borderRadius: 8,
  colors: {
    ...theme.colors,
    primary: `rgb(${primaryColor})`,
    primary25: `rgb(${primaryColor} / 25%)`,
    primary50: `rgb(${primaryColor} / 50%)`,
    primary75: `rgb(${primaryColor} / 75%)`,
  },
});

export const styleConfig = {
  control: (base: any, props: any) => {
    return {
      ...base,
      '--min-height': props.selectProps.size === 'lg' ? '48px' : '40px',
      minHeight: 'var(--min-height)',
      borderColor: `rgb(${primaryColor})`,
      borderWidth: 2,
      ":hover": {
        borderColor: `rgb(${primaryColor})`,
      },
      "--tw-shadow": "0 0 #0000",
      "--tw-shadow-colored": "0 0 #0000",
      "--tw-ring-offset-shadow":
        "var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)",
      "--tw-ring-color": `rgb(${focusRingColor})`,
      "--tw-ring-shadow":
        "var(--tw-ring-inset) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color)",
      outline: "2px solid transparent",
      outlineOffset: "2px",
      boxShadow: props.isFocused
        ? "var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000)"
        : "none",
    }
  },
};

export const classNamePrefix = "rs-";

const LoadingIndicator = (props: any) => {
  return <img alt="loading..." src={Spinner} className="w-[18px] mr-2" />;
};

export function ReactSelect<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(props: Props<Option, IsMulti, Group>) {
  return (
    <Select
      closeMenuOnSelect={!props.isMulti}
      {...props}
      theme={themeConfig}
      styles={styleConfig}
      classNamePrefix={classNamePrefix}
      components={{
        LoadingIndicator: LoadingIndicator,
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null
      }}
    />
  );
}
