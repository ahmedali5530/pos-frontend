import React from "react";
import { Button } from "../../../../app-common/components/input/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { PRODUCT_DOWNLOAD } from "../../../../api/routing/routes/backend.app";
import { QueryString } from "../../../../lib/location/query.string";
import Cookies from "js-cookie";

export const ExportItems = () => {
  const onClick = async () => {
    const url = new URL(PRODUCT_DOWNLOAD);
    url.search = QueryString.stringify({
      bearer: Cookies.get("JWT"),
    });

    window.open(url.toString(), "_blank");
  };

  return (
    <>
      <Button type="button" variant="primary" onClick={onClick}>
        <FontAwesomeIcon icon={faDownload} className="mr-2" /> Export items
      </Button>
    </>
  );
};
