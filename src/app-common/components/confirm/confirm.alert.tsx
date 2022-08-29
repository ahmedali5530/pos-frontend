import {confirmAlert} from "react-confirm-alert";

export const ConfirmAlert = (params: {
  onConfirm: () => void,
  confirmText: string,
  cancelText: string,
  description?: string,
  title: string
}) => {
  const {onConfirm, confirmText, cancelText, description, title} = params;

  confirmAlert({
    customUI: ({onClose}) => {
      return (
        <div className='custom-ui'>
          <h1>{title}</h1>
          <p>{description}</p>
          <div className="tw-flex tw-justify-between tw-gap-3">
            <button className="btn btn-secondary tw-flex-1" onClick={onClose}>{cancelText}</button>
            <button
              className="btn btn-danger tw-flex-1"
              onClick={() => {
                if (onConfirm) {
                  onConfirm();
                }
                onClose();
              }}
            >{confirmText}
            </button>
          </div>
        </div>
      );
    }
  });
};
