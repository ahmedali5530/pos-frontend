import {Button} from "../../../app-common/components/input/button";
import {Modal} from "../../../app-common/components/modal/modal";
import React, {FC, PropsWithChildren, useEffect, useState} from "react";
import {HomeProps} from "../../../api/hooks/use.load.data";
import localforage from "localforage";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle} from "@fortawesome/free-solid-svg-icons";
import {Department} from "../../../api/model/department";
import { Tooltip } from "antd";

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
    const list: HomeProps['list']|null = await localforage.getItem('list');
    let departments: {[key: string]: Department} = {};
    if(list !== null) {
      list.list.forEach(item => {
        if(item.department) {
          departments[item.department.id] = item.department;
        }
      });
    }

    setList(Object.values(departments));
  };

  useEffect(() => {
    loadDepartmentsList();
  }, [modal]);

  const addRemoveDepartment = (department: Department) => {
    const newDepartment = {...departments};

    if(newDepartment[department.id] !== undefined){
      delete newDepartment[department.id];
    }else {
      newDepartment[department.id] = department;
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
            <span className="shrink-0 ml-1 bg-primary-500 text-white h-5 w-5 rounded-full text-sm font-bold">{Object.values(departments).length}</span>
          )}
        </Button>
      </Tooltip>
      <Modal open={modal} onClose={() => {
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
              {!!departments[department.id] && (
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
