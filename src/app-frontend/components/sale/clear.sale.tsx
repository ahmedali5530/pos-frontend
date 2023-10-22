import React, { FC } from "react";
import { Button } from "../../../app-common/components/input/button";
import localforage from "../../../lib/localforage/localforage";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Shortcut } from "../../../app-common/components/input/shortcut";
import { useAtom } from "jotai";
import { defaultState } from "../../../store/jotai";

interface Props {}

export const ClearSale: FC<Props> = ({}) => {
  const [appState, setAppState] = useAtom(defaultState);
  const { added } = appState;
  const cancel = () => {
    setAppState((prev) => ({
      ...prev,
      added: [],
      customer: undefined,
      adjustment: 0,
      tax: undefined,
      discount: undefined,
      discountAmount: undefined,
    }));

    localforage.getItem("defaultDiscount").then((data: any) => {
      if (data) {
        setAppState((prev) => ({
          ...prev,
          discount: data,
        }));
      } else {
        setAppState((prev) => ({
          ...prev,
          discount: undefined,
          discountAmount: undefined,
        }));
      }
    });

    //set default options
    localforage.getItem("defaultTax").then((data: any) => {
      if (data) {
        setAppState((prev) => ({
          ...prev,
          tax: data,
        }));
      } else {
        setAppState((prev) => ({
          ...prev,
          tax: undefined,
        }));
      }
    });
  };
  return (
    <Button
      className="w-full"
      size="lg"
      variant="danger"
      disabled={added.length === 0}
      onClick={cancel}
      type="button">
      <FontAwesomeIcon icon={faTimes} size="lg" />
      <Shortcut shortcut="ctrl+x" handler={cancel} />
    </Button>
  );
};
