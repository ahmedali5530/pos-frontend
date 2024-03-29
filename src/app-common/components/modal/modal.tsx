import React, {
  FunctionComponent,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState,
} from "react";
import ReactModal from "react-modal";
import classNames from "classnames";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ModalProps extends PropsWithChildren {
  open?: boolean;
  onClose?: Function;
  title?: ReactNode;
  shouldCloseOnOverlayClick?: boolean;
  shouldCloseOnEsc?: boolean;
  hideCloseButton?: boolean;
  transparentContainer?: boolean;
  header?: ReactNode;
  size?: "full" | "bottom-sheet" | "sm";
  backdrop?: boolean;
}

export const Modal: FunctionComponent<ModalProps> = (props) => {
  const [open, setOpen] = useState(false);
  const [closeClass, setCloseClass] = useState("");

  useEffect(() => {
    if (typeof props.open !== "undefined") {
      setOpen(props.open);
    }
  }, [props.open]);

  const close = () => {
    setCloseClass("ReactModal__Content--after-close");
    // setTimeout(() => {
    setOpen(false);
    props.onClose!();
    setCloseClass("");
    // }, 100);
  };

  return (
    <>
      <ReactModal
        isOpen={open}
        onRequestClose={close}
        ariaHideApp={false}
        shouldCloseOnEsc={props.shouldCloseOnEsc || false}
        className={classNames(
          "justify-center",
          closeClass,
          props.size === "full" && "modal-full",
          props.size === "bottom-sheet" && "modal-bottom-sheet",
          props.size === "sm" && "modal-sm",
          !props.backdrop && 'no-backdrop'
        )}
        shouldCloseOnOverlayClick={props.shouldCloseOnOverlayClick}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 70, 254, 0.01)",
            backdropFilter: "blur(10px)",
          },
        }}
      >
        <div>
          {!props.hideCloseButton && (
            <button
              onClick={close}
              className="bg-gray-100 absolute top-2 right-2 hover:bg-gray-200 active:bg-gray-300 w-12 h-12 rounded inline-flex justify-center items-center"
              type="button">
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          )}

          <div className="p-5 border-b-2 border-gray-200 bg-white/40">
            <h3 className="text-2xl">{props?.title}</h3>
            {props.header && props.header}
          </div>
          <div
            className={classNames(
              "pb-5 overflow-y-auto modal-container px-5 py-3",
              "bg-white"
            )}>
            {props.children}
          </div>
        </div>
      </ReactModal>
    </>
  );
};
