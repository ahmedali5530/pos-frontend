import {Popover} from "antd";
import {PropsWithChildren, useState} from "react";

interface ConfirmAlertProps extends PropsWithChildren{
  onConfirm: () => void,
  confirmText?: string,
  cancelText?: string,
  description?: React.ReactNode,
  title: React.ReactNode
}

export const ConfirmAlert = (params: ConfirmAlertProps) => {
  const {onConfirm, confirmText, cancelText, description, title, children} = params;
  const [open, setOpen] = useState(false);

  return (
    <Popover
      placement="topRight"
      title={title}
      content={
        <ConfirmAlertButtons
          onConfirm={onConfirm}
          confirmText={confirmText}
          cancelText={cancelText}
          description={description}
          onCancel={() => {
            setOpen(false);
          }}
        />
      }
      trigger="click"
      onOpenChange={setOpen}
      open={open}
    >
      {children}
    </Popover>
  );
};

interface ConfirmAlertButtonsProps{
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const ConfirmAlertButtons = ({
  description, confirmText, onConfirm, onCancel, cancelText
}: ConfirmAlertButtonsProps) => {
  return (
    <>
      {description && (
        <p className="mb-3">{description}</p>
      )}
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="btn btn-secondary sm">{cancelText||'Cancel'}</button>
        <button onClick={onConfirm} className="btn btn-danger sm">{confirmText||'Delete'}</button>
      </div>
    </>
  )
}
