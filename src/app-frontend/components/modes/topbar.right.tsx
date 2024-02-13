import { useState } from "react";
import { Button } from "../../../app-common/components/input/button";
import { Modal } from "../../../app-common/components/modal/modal";
import { useAtom } from "jotai";
import { defaultData, defaultState, PosModes } from "../../../store/jotai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";

export const TopbarRight = () => {
  const [defaultAppState, setDefaultAppState] = useAtom(defaultData);
  const { defaultMode } = defaultAppState;

  const [appState, setAppState] = useAtom(defaultState);

  const [modal, setModal] = useState(false);

  const options = [
    { label: "Pos", value: PosModes.pos },
    { label: "Order only", value: PosModes.order },
    { label: "Payment only", value: PosModes.payment },
  ];

  return (
    <>
      <Button size="lg" variant="primary" onClick={() => setModal(true)}>
        <FontAwesomeIcon icon={faPenToSquare} className="mr-3"/>
        {defaultMode} mode
      </Button>

      <Modal
        title="Select a mode"
        shouldCloseOnEsc
        size="sm"
        open={modal}
        onClose={() => setModal(false)}>
        <div className="list-group">
          {options.map((item) => (
            <Button
              key={item.label}
              variant={item.value === defaultMode ? "primary" : "secondary"}
              className={classNames("w-full")}
              onClick={() => {
                setDefaultAppState((prev) => ({
                  ...prev,
                  defaultMode: item.value,
                }));

                setAppState(prev => ({
                  ...prev,
                  added: []
                }));

                setModal(false);
              }}
              size="lg">
              {item.value === defaultMode && (
                <FontAwesomeIcon icon={faCheck} className="mr-3"/>
              )}
              {item.label}
            </Button>
          ))}
        </div>
      </Modal>
    </>
  );
};
