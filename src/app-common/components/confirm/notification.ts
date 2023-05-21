import { notification } from 'antd';
import {ReactNode} from "react";
import {IconType} from "antd/es/notification/interface";

interface NotifyProps{
  title?: string;
  description?: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  type?: IconType;
}
export const notify = ({
  title, description, onClick, type
}: NotifyProps) => {
  notification.open({
    message: title || type?.toUpperCase(),
    description: description,
    type: type,
    onClick,
    placement: 'bottomRight'
  });
};
