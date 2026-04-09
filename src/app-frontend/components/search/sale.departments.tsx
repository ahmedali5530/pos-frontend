import {Button} from "../../../app-common/components/input/button";
import {Modal} from "../../../app-common/components/modal/modal";
import React, {FC, PropsWithChildren, useEffect, useState} from "react";
import {HomeProps} from "../../../api/hooks/use.load.data";
import localforage from "localforage";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle} from "@fortawesome/free-solid-svg-icons";
import {Department} from "../../../api/model/department";
import { Tooltip } from "antd";
import {toRecordId} from "../../../api/model/common";

interface SaleDepartmentsProps extends PropsWithChildren{
  departments:  {[key: string]: Department} ;
  setDepartments: (departments:  {[key: string]: Department} ) => void;
}

export const SaleDepartments: FC<SaleDepartmentsProps> = ({
  children, departments, setDepartments
}) => {
  const [modal, setModal] = useState(false);
  const [list, setList] = useState<Department[]>([]);

  const loadDepartmentsList = async () => {
    const l: HomeProps['list']|null = await localforage.getItem('list');
    let departments: {[key: string]: Department} = {};
    if(l !== null) {
      l.list.forEach(item => {
        if(item.department) {
          departments[toRecordId(item.department.id).toString()] = item.department;
        }
      });
    }

    setList(Object.values(departments));
  };

  useEffect(() => {
    if(modal) {
      loadDepartmentsList();
    }
  }, [modal]);

  const addRemoveDepartment = (department: Department) => {
    const newDepartment = {...departments};

    if(newDepartment[toRecordId(department.id).toString()] !== undefined){
      delete newDepartment[toRecordId(department.id).toString()];
    }else {
      newDepartment[toRecordId(department.id).toString()] = department;
    }

    setDepartments(newDepartment);
  };

  return (
    <>
      <Tooltip title="Filter by Departments">
        <Button
          className="block min-w-[48px]" variant="primary"
          onClick={() => {
            setModal(true);
          }}
          type="button"
          size="lg"
        >
          {children || 'Departments'}
          {Object.values(departments).length > 0 && (
            <span className="inline-block shrink-0 ml-1 bg-primary-500 text-white h-5 w-5 rounded-full text-sm font-bold">{Object.values(departments).length}</span>
          )}
        </Button>
      </Tooltip>
      <Modal shouldCloseOnOverlayClick open={modal} onClose={() => {
        setModal(false);
      }} title="Filter by departments">
        <div className="flex justify-center items-center gap-5">
          {list.map((department, index) => (
            <Button variant="primary"
                    key={index}
                    onClick={() => addRemoveDepartment(department)}
                    className="mr-3 mb-3 h-[100px_!important] min-w-[150px] relative"
            >
              {department.name}
              {!!departments[toRecordId(department.id).toString()] && (
                <span className="absolute top-1 right-1">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-primary-500" size="lg" />
                </span>
              )}
            </Button>
          ))}
        </div>
      </Modal>
    </>
  );
};
