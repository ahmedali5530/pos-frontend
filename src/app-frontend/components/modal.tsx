import React, {FunctionComponent, PropsWithChildren, useEffect, useState} from "react";
import ReactModal from 'react-modal';
import classNames from "classnames";

interface ModalProps extends PropsWithChildren{
  open?: boolean;
  onClose?: Function;
  title?: string;
  shouldCloseOnOverlayClick?: boolean;
  shouldCloseOnEsc?: boolean;
}

export const Modal: FunctionComponent<ModalProps> = (props) => {
  const [open, setOpen] = useState(false);
  const [closeClass, setCloseClass] = useState('');

  useEffect(() => {
    if (typeof props.open !== 'undefined') {
      setOpen(props.open);
    }
  }, [props.open]);

  const close = () => {
    setCloseClass('ReactModal__Content--after-close');
    setTimeout(() => {
      setOpen(false);
      props.onClose!();
      setCloseClass('');
    }, 150);
  };

  return (
    <>
      <ReactModal
        isOpen={open}
        onRequestClose={close}
        ariaHideApp={false}
        shouldCloseOnEsc={props.shouldCloseOnEsc || false}
        className={
          classNames(
            "justify-center",
            closeClass
          )
        }
        shouldCloseOnOverlayClick={props.shouldCloseOnOverlayClick}
        style={{overlay: {backgroundColor: 'rgba(0,0,0,0.5)'}}}
      >
        <div>
          <button
            onClick={close}
            className="absolute top-2 right-2 btn-close"
            type="button"
          >
          </button>
          <div className="p-5">
            <h3 className="text-2xl">{props?.title}</h3>
          </div>
          <div className="p-5 pt-0 pb-12">
            {props.children}
          </div>
        </div>
      </ReactModal>
    </>
  );
};
