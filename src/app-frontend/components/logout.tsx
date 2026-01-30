import React, {FC} from "react";
import {Button} from "../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSignOut} from "@fortawesome/free-solid-svg-icons";
import {useLogout} from "../../duck/auth/hooks/useLogout";
import { Tooltip } from "antd";
import {LOGIN, POS} from "../routes/frontend.routes";
import {useNavigate} from "react-router";

export const Logout: FC = () => {
  const [, action] = useLogout();
  const navigate = useNavigate();

  const logoutAction = async () => {
    await action();

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
