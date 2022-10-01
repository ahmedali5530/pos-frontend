import React, {FC} from "react";
import {Button} from "./button";
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
      <Button variant="danger" className="w-24" size="lg" onClick={logoutAction}>
        <FontAwesomeIcon icon={faPowerOff} />
      </Button>
    </>
  );
};
