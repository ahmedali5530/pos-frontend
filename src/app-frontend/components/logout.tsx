import React, {FC} from "react";
import {Button} from "../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSignOut} from "@fortawesome/free-solid-svg-icons";
import {useLogout} from "../../duck/auth/hooks/useLogout";
import { Tooltip } from "antd";

export const Logout: FC = () => {
  const [state, action] = useLogout();

  const logoutAction = async () => {
    action();
  };

  return (
    <Tooltip title="Logout">
      <Button variant="danger" className="btn-square" size="lg" onClick={logoutAction} tabIndex={-1}>
        <FontAwesomeIcon icon={faSignOut} />
      </Button>
    </Tooltip>
  );
};
