import {MenuItemProps, MenuProps, MenuTriggerProps, MenuTrigger, Popover, Menu, MenuItem, Button} from 'react-aria-components';
import { ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface MenuButtonProps<T>
  extends MenuProps<T>, Omit<MenuTriggerProps, 'children'> {
  label: ReactNode;
}

export function DropdownMenu<T extends object>(
  { label, children, ...props }: MenuButtonProps<T>
) {
  return (
    <MenuTrigger {...props}>
      <Button className="btn btn-primary">{label}</Button>
      <Popover placement={'top end'}>
        <Menu {...props} className="bg-white shadow-xl py-3 rounded-lg">
          {children}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}

export function DropdownMenuItem(props:
  MenuItemProps & {icon?: any}
) {
  const {icon, children, ...rest} = props;
  return (
    <MenuItem
      {...rest}
      className={({ isFocused, isSelected }) =>
        `cursor-pointer px-5 py-1 hover:bg-primary-100 hover:text-primary-500 active:bg-primary-500 active:text-white border-b last:border-b-0 ${isFocused ? 'focused' : ''}`}
    >
      {icon && (
        <FontAwesomeIcon icon={icon} className="w-[24px] mr-3"/>
      )}
      {children}
    </MenuItem>
  );
}
