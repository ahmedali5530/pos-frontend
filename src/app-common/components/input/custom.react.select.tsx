import React from "react";
import Select, {GroupBase, Props} from "react-select";

const primaryColor = 'rgb(168 85 247 / 1)';

export function ReactSelect<Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>>(props: Props<Option, IsMulti, Group>) {
  return (
    <Select
      {...props}
      theme={(theme) => ({
        ...theme,
        borderRadius: 8,
        colors: {
          ...theme.colors,
          primary: primaryColor,
          primary25: 'rgba(168, 85, 247, 0.25)',
          primary50: 'rgba(168, 85, 247, 0.50)',
          primary75: 'rgba(168, 85, 247, 0.75)'
        },
      })}
      styles={{
        control: (base, props) => ({
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
          '--tw-ring-color': 'rgb(233 213 255 / 1)',
          boxShadow: props.isFocused ? 'var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000)' : 'none'
        })
      }}
    />
  );
}
