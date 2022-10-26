import {Button} from "../../button";
import {Modal} from "../../modal";
import React, {FC, PropsWithChildren, useEffect, useState} from "react";
import {Tax} from "../../../../api/model/tax";
import {useLoadData} from "../../../../api/hooks/use.load.data";
import {Shortcut} from "../../../../app-common/components/input/shortcut";

interface TaxProps extends PropsWithChildren{
  setTax: (tax?: Tax) => void;
  tax?: Tax;
  buttonVariant?: string;
}

export const ApplyTax: FC<TaxProps> = ({setTax, tax, children, buttonVariant}) => {
  const [modal, setModal] = useState(false);
  const [taxList, setTaxList] = useState<Tax[]>([]);

  const [state, action] = useLoadData();

  const loadTaxList = async () => {
    if(state.taxList.list) {
      setTaxList(state.taxList.list);
    }
  };

  useEffect(() => {
    loadTaxList();
  }, [state.taxList]);

  return (
    <>
      <Button
        className="block w-full" variant={buttonVariant || "secondary"}
        onClick={() => {
          setModal(true);
        }}
        type="button"
      >
        {children || 'Taxes'}
        <Shortcut shortcut="ctrl+q" handler={() => setModal(true)} />
      </Button>
      <Modal open={modal} onClose={() => {
        setModal(false);
      }} title="Apply Tax">
        <Button variant="danger" onClick={() => {
          setTax(undefined);
          setModal(false);
        }} className="mr-3 mb-3" size="lg">Clear Tax</Button>

        {taxList.map((taxItem, index) => (
          <Button variant="primary" key={index} onClick={() => {
            setTax(taxItem);
            setModal(false);
          }} className="mr-3 mb-3" active={taxItem.id === tax?.id} size="lg">{taxItem.name} {taxItem.rate}%</Button>
        ))}
      </Modal>
    </>
  );
};
