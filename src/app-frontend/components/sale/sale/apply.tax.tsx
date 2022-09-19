import {Button} from "../../button";
import {Modal} from "../../modal";
import React, {FC, PropsWithChildren, useEffect, useState} from "react";
import localforage from "../../../../lib/localforage/localforage";
import {Tax} from "../../../../api/model/tax";
import {HomeProps} from "../../../../api/hooks/use.load.data";
import {Shortcut} from "../../../../app-common/components/input/shortcut";

interface TaxProps extends PropsWithChildren{
  setTax: (tax?: Tax) => void;
  tax?: Tax;
}

export const ApplyTax: FC<TaxProps> = ({setTax, tax, children}) => {
  const [modal, setModal] = useState(false);
  const [taxList, setTaxList] = useState<Tax[]>([]);

  const loadTaxList = async () => {
    const list: HomeProps['taxList']|null = await localforage.getItem('taxList');
    if(list !== null) {
      setTaxList(list.list);
    }
  };

  useEffect(() => {
    loadTaxList();
  }, []);

  return (
    <>
      <Button
        className="block w-full" variant="secondary" size="lg"
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
