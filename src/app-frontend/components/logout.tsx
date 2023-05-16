import React, {FC} from "react";
import {Button} from "../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPowerOff} from "@fortawesome/free-solid-svg-icons";
import {useLogout} from "../../duck/auth/hooks/useLogout";

export const Logout: FC = () => {
  const [state, action] = useLogout();

  const logoutAction = async () => {
    action();
  };

  return (
    <>
      <Button variant="danger" className="w-24" size="lg" onClick={logoutAction} tabIndex={-1}>
        <FontAwesomeIcon icon={faPowerOff} />
      </Button>
    </>
  );
};
