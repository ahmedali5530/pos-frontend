import { Button } from "../../../app-common/components/input/button";
import { Modal } from "../../../app-common/components/modal/modal";
import React, { FC, PropsWithChildren, useEffect, useState } from "react";
import { Tax } from "../../../api/model/tax";
import { useLoadData } from "../../../api/hooks/use.load.data";
import { Shortcut } from "../../../app-common/components/input/shortcut";
import { CartItem } from "../../../api/model/cart.item";
import { useAtom } from "jotai";
import { defaultState } from "../../../store/jotai";
import {toRecordId} from "../../../api/model/common";

interface TaxProps extends PropsWithChildren {}

export const ApplyTax: FC<TaxProps> = ({ children }) => {
  const [appState, setAppState] = useAtom(defaultState);
  const { tax, added } = appState;
  const [modal, setModal] = useState(false);

  const [state, ] = useLoadData();


  return (
    <>
      <button
        className="block w-full text-left"
        onClick={() => {
          setModal(true);
        }}
        type="button"
        disabled={added.length === 0}>
        {children || "Taxes"}
        <Shortcut shortcut="ctrl+shift+q" handler={() => setModal(true)} />
      </button>
      <Modal
        open={modal}
        onClose={() => {
          setModal(false);
        }}
        title="Apply Tax"
        shouldCloseOnEsc={true}>
        <Button
          variant="danger"
          onClick={() => {
            setAppState((prev) => ({
              ...prev,
              tax: undefined,
            }));
            setModal(false);
          }}
          className="mr-3 mb-3"
          size="lg">
          Clear Tax
        </Button>

        {state.taxList.list.map((taxItem, index) => (
          <Button
            variant="primary"
            key={index}
            onClick={() => {
              setAppState((prev) => ({
                ...prev,
                tax: taxItem,
              }));

              setModal(false);
            }}
            className="mr-3 mb-3"
            active={toRecordId(taxItem.id).toString() === toRecordId(tax?.id)?.toString()}
            size="lg"
          >
            {taxItem.name} {taxItem.rate}%
          </Button>
        ))}
      </Modal>
    </>
  );
};
