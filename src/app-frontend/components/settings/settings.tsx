import {Button} from "../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCog} from "@fortawesome/free-solid-svg-icons";
import {Tooltip} from "antd";
import React, {useState} from "react";
import {Modal} from "../../../app-common/components/modal/modal";
import {GeneralSetting} from "./general/general";

export const Settings = () => {
  const [modal, setModal] = useState(false);

  return (
    <>
      <Tooltip title="Settings">
        <Button
          variant="secondary"
          size="lg"
          onClick={() => {
            setModal(true);
          }}
          tabIndex={-1}
          className="gap-3"
        >
          <FontAwesomeIcon icon={faCog}/> Settings
        </Button>
      </Tooltip>

      {modal && (
        <Modal
          open={modal}
          onClose={() => {
            setModal(false);
          }}
          title="Settings"
          size="full"
          transparentContainer={false}>
          <GeneralSetting/>
        </Modal>
      )}
    </>
  )
}