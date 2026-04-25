import {Button} from "../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBarcode, faCheckCircle, faCircle} from "@fortawesome/free-solid-svg-icons";
import {Tooltip} from "antd";
import {Modal} from "../../../app-common/components/modal/modal";
import {useEffect, useState} from "react";
import {useAtom} from "jotai";
import {appState} from "../../../store/jotai";
import QRCode from "react-qr-code";
import {useDB} from "../../../api/db/db";
import {Tables} from "../../../api/db/tables";
import {toRecordId} from "../../../api/model/common";

export const AppConnect = () => {
  const [modal, setModal] = useState(false);
  const [{user, store, terminal, appConnected, connectedDevice}, setApp] = useAtom(appState);
  const db = useDB();

  useEffect(() => {
    let isMounted = true;
    let queryId: any = null;

    const runLiveQuery = async () => {
      try {
        const result = await db.live(Tables.app_connection, (action: string, result) => {
          if (!isMounted) return;

          if (
            result.store.toString() === store?.id.toString() &&
            result.terminal.toString() === terminal?.id?.toString() &&
            result.user.toString() === user?.id?.toString()
          ) {
            // Only process CREATE actions for new orders
            if (action === "CREATE") {
              setApp(prev => ({
                ...prev,
                appConnected: true,
                connectedDevice: result.device
              }));
            } else if (action === "DELETE") {
              // Also refresh on updates in case status changes
              setApp(prev => ({
                ...prev,
                appConnected: false,
                connectedDevice: undefined
              }));
            }
          }
        });

        if (isMounted) {
          queryId = result;
          // setLiveQuery(result);
        }
      } catch (error) {
        console.error("Error setting up live query:", error);
      }
    };

    runLiveQuery();

    return () => {
      isMounted = false;
      if (queryId) {
        db.db.kill(queryId).catch(console.error);
      }
    };
  }, [appConnected]);

  const removeApp = async () => {
    await db.query(`DELETE ${Tables.app_connection} where user = $user and store = $store and terminal = $terminal`, {
      store: toRecordId(store?.id),
      terminal: toRecordId(terminal?.id),
      user: toRecordId(user?.id)
    });

    setApp(prev => ({
      ...prev,
      appConnected: false
    }));
  }

  return (
    <>
      <Tooltip title="Connect Scanner App">
        <Button
          variant="secondary"
          type="button"
          size="lg"
          iconButton
          onClick={() => {
            setModal(true)
          }}
          className="relative"
        >
          {appConnected && (
            <FontAwesomeIcon icon={faCircle} className="text-success-500 absolute -top-2 -left-2"/>
          )}
          <FontAwesomeIcon icon={faBarcode} size="xl"/>
        </Button>
      </Tooltip>

      <Modal
        title="Connect Scanner App"
        shouldCloseOnEsc
        size="sm"
        open={modal}
        onClose={() => setModal(false)}>
        <div className="flex justify-center items-center h-[400px]">
          {appConnected ? (
            <div className="text-center flex flex-col gap-[48px] items-center">
              <FontAwesomeIcon icon={faCheckCircle} size="6x" className="text-success-500"/>
              <h4 className="text-2xl">
                Connected on {connectedDevice}
              </h4>
              <Button
                onClick={removeApp}
                variant="danger"
                className="btn-flat"
                size="lg"
              >Remove app?</Button>
            </div>
          ) : (
            <QRCode value={`appCode-${user?.id?.toString()}-${store?.id?.toString()}-${terminal?.id?.toString()}`}/>
          )}
        </div>
      </Modal>
    </>
  );
}