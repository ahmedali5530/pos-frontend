import { notification} from 'antd';
import {ReactNode} from "react";
import {IconType, NotificationPlacement} from "antd/es/notification/interface";

interface NotifyProps{
  title?: string;
  description?: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  type?: IconType;
  placement?: NotificationPlacement;
  duration?: number;
}
export const notify = ({
  title, description, onClick, type, placement, duration
}: NotifyProps) => {
  notification.open({
    message: title || type?.toUpperCase(),
    description: description,
    type: type,
    onClick,
    placement: placement || 'bottomRight',
    key: 'persistent',
    duration: duration || 2,
  });
};
