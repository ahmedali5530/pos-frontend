import { useState } from "react";
import { Button } from "../../../app-common/components/input/button";
import { Modal } from "../../../app-common/components/modal/modal";
import { useAtom } from "jotai";
import {appState, defaultData, defaultState, PosModes} from "../../../store/jotai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import {AppConnect} from "./app.connect";
import {useDB} from "../../../api/db/db";

export const TopbarRight = () => {
  const [defaultAppState, setDefaultAppState] = useAtom(defaultData);
  const { defaultMode } = defaultAppState;

  const [, setAppState] = useAtom(defaultState);

  const [modal, setModal] = useState(false);

  const options = [
    { label: "Pos", value: PosModes.pos },
    { label: "Order only", value: PosModes.order },
    { label: "Payment only", value: PosModes.payment },
    { label: "Quotation mode", value: PosModes.quote },
  ];

  return (
    <div className="flex gap-3">
      {(defaultMode === PosModes.pos || defaultMode === PosModes.order) && (
        <AppConnect />
      )}

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
        <div className="list-group border-2 rounded-lg border-gray-500">
          {options.map((item, index) => (
            <button
              key={item.label}
              className={classNames(
                "w-full p-3", 'border-0', 'border-gray-500',
                index === 0 ? '!border-b-0' : '!border-t-2',
                item.value === defaultMode && 'bg-primary-100 text-primary-500'
              )}
              onClick={() => {
                setDefaultAppState((prev) => ({
                  ...prev,
                  defaultMode: item.value,
                }));

                setAppState(prev => ({
                  ...prev,
                  added: [],
                  orderId: undefined
                }));

                setModal(false);
              }}
              >
              {item.value === defaultMode && (
                <FontAwesomeIcon icon={faCheck} className="mr-3"/>
              )}
              {item.label}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};
