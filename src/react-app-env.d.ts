/// <reference types="react-scripts" />
import type {} from 'react-select/base';
declare module 'react-select/base' {
  import { GroupBase } from "react-select";

  export interface Props<
    Option,
    IsMulti extends boolean,
    Group extends GroupBase<Option>
  > {
    size?: 'lg';
    dropdownIndicator?: boolean;
    indicatorSeparator?: boolean;
  }
}
