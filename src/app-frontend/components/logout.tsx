import React, {FC} from "react";
import {Button} from "../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSignOut} from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "antd";
import {LOGIN, POS} from "../routes/frontend.routes";
import {useNavigate} from "react-router";
import {useAtom} from "jotai";
import {appState} from "../../store/jotai";

export const Logout: FC = () => {
  const navigate = useNavigate();
  const [, setApp] = useAtom(appState);

  const logoutAction = async () => {
    // await action();
    setApp(prev => ({
      ...prev,
      loggedIn: false,
      terminal: undefined,
      store: undefined,
      user: undefined
    }));

    navigate(LOGIN);
  };

  return (
    <Tooltip title="Logout">
      <Button variant="danger" className="btn-square" size="lg" onClick={logoutAction} tabIndex={-1}>
        <FontAwesomeIcon icon={faSignOut} />
      </Button>
    </Tooltip>
  );
};
