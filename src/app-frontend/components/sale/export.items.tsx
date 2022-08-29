import React from "react";
import {Button} from "../button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload} from "@fortawesome/free-solid-svg-icons";
import {PRODUCT_DOWNLOAD} from "../../../api/routing/routes/backend.app";
import {QueryString} from "../../../lib/location/query.string";

export const ExportItems = () => {
  const onClick = async () => {
    const url = new URL(PRODUCT_DOWNLOAD);
    url.search = QueryString.stringify({
      bearer: sessionStorage.getItem('jwt')
    });

    window.open(url.toString(), '_blank');
  };

  return (
    <>
      <Button type="button" variant="success" onClick={onClick} size="lg"><FontAwesomeIcon icon={faDownload} className="mr-2" /> Export items</Button>
    </>
  );
};
