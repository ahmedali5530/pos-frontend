import React, {useState} from "react";
import {faUpload} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Button} from "../../button";
import {request} from "../../../../api/request/request";
import {PRODUCT_UPLOAD} from "../../../../api/routing/routes/backend.app";

export const ImportItems = () => {
  const [loading, setLoading] = useState(false);

  const onChange = async (event: any) => {
    setLoading(true);
    const data = new FormData();
    if (event.target.files.length > 0) {
      data.append('file', event.target.files[0]);
    }else{
      //no file chosen
      return false;
    }

    try {
      await request(PRODUCT_UPLOAD, {
        body: data,
        method: 'POST',
      });
    } catch (e) {
      throw e;
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Button variant="success" type={"button"} disabled={loading}>
        <label
          htmlFor="file"
        ><FontAwesomeIcon icon={faUpload} className="mr-2"/> {loading ? 'Uploading...' : 'Upload Items'}
        </label>
        <input type="file" id="file" accept="text/csv" hidden onChange={onChange}/>
      </Button>
    </>
  );
};
