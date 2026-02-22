import React from "react";
import {Button} from "../../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload} from "@fortawesome/free-solid-svg-icons";

export const ExportItems = () => {
  const onClick = async () => {
    //  TODO: download items list
  };

  return (
    <>
      <Button type="button" variant="primary" onClick={onClick}>
        <FontAwesomeIcon icon={faDownload} className="mr-2"/> Export items
      </Button>
    </>
  );
};
