import {ButtonHTMLAttributes, FunctionComponent, PropsWithChildren, ReactElement, useCallback, useState} from 'react';
import classNames from "classnames";

export interface TabControlState {
  activeTab: string;
  isTabActive: (tab: string) => boolean
}

export interface TabControlActions {
  setActiveTab: (tab: string) => void;
}

export interface UseTabControlProps {
  defaultTab: string;
}

export const useTabControl = (props: UseTabControlProps): [TabControlState, TabControlActions] => {
  const {defaultTab} = props;
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  const isTabActive = useCallback(
    (tab: string) => activeTab === tab,
    [activeTab]
  );

  return [{ activeTab, isTabActive }, { setActiveTab }];
};


export interface RenderProps extends TabControlState, TabControlActions {
}

export interface TabControlProps {
  defaultTab: string;
  render: (props: RenderProps) => ReactElement | null;
}

export const TabControl: FunctionComponent<TabControlProps> = (props) => {
  const [{ activeTab, isTabActive }, { setActiveTab }] = useTabControl(props);

  return props.render({ activeTab, setActiveTab, isTabActive });
};

interface TabNavProps extends PropsWithChildren{}
export const TabNav = (props: TabNavProps) => {
  return (
    <div className="flex justify-start items-center gap-3 flex-wrap">{props.children}</div>
  );
};

interface TabProps extends PropsWithChildren, ButtonHTMLAttributes<HTMLButtonElement>{
  isActive: boolean;
}
export const Tab = (props: TabProps) => {
  return (
    <button {...props} className={
      classNames(
        'btn btn-primary rounded-[999px_!important] lg px-[1.5rem_!important]',
        props.isActive ?
          'active' :
          ''
      )
    }>{props.children}</button>
  );
};


interface TabContentProps extends PropsWithChildren{
  isActive: boolean;
  holdState?: boolean;
}
export const TabContent = (props: TabContentProps) => {
  if(!props.isActive && !props.holdState){
    return (<></>);
  }

  return (
    <div className={
      classNames(
        'py-5',
        !props.isActive && 'hidden'
      )
    }>{props.children}</div>
  );
};
