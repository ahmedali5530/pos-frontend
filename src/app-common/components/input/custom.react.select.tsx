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
        control: (base) => ({
          ...base,
          minHeight: 40,
          borderColor: primaryColor,
          borderWidth: 2,
          ":hover": {
            borderColor: primaryColor
          }
        })
      }}
    />
  );
}
