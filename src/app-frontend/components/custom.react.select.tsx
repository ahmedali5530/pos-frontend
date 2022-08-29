import React from "react";
import Select, {GroupBase, Props} from "react-select";

const primaryColor = '#3210f2';

export function CustomReactSelect<Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>>(props: Props<Option, IsMulti, Group>) {
  return (
    <Select
      {...props}
      theme={(theme) => ({
        ...theme,
        borderRadius: 4,
        colors: {
          ...theme.colors,
          primary: primaryColor,
          primary25: 'rgba(50,16,242,0.25)',
          primary50: 'rgba(50,16,242,0.50)',
          primary75: 'rgba(50, 16, 242, 0.75)'
        },
      })}
    />
  );
}