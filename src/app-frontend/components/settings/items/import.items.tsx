import React, {useState} from "react";
import {faUpload} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Button} from "../../../../app-common/components/input/button";

export const ImportItems = () => {
  const [loading, setLoading] = useState(false);

  const onChange = async (event: any) => {
    // TODO: add items upload feature
  };
  return (
    <>
      <Button variant="primary" type={"button"} disabled={loading}>
        <label htmlFor="file">
          <FontAwesomeIcon icon={faUpload} className="mr-2"/>{" "}
          {loading ? "Uploading..." : "Upload Items"}
        </label>
        <input
          type="file"
          id="file"
          accept="text/csv"
          hidden
          onChange={onChange}
        />
      </Button>
    </>
  );
};
