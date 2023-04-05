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

  return (
    <div className="tab-control flex gap-5">
      {props.render({ activeTab, setActiveTab, isTabActive })}
    </div>
  );
};

interface TabNavProps extends PropsWithChildren{}
export const TabNav = (props: TabNavProps) => {
  return (
    // <ScrollContainer horizontal nativeMobileScroll={true}>
      <div className="flex flex-col w-[220px] flex-shrink-0 border-r ml-[-20px]">{props.children}</div>
    // </ScrollContainer>
  );
};

interface TabProps extends PropsWithChildren, ButtonHTMLAttributes<HTMLButtonElement>{
  isActive: boolean;
}
export const Tab = (props: TabProps) => {
  return (
    <button {...props} className={
      classNames(
        'p-3 px-5 flex-shrink-0 text-left hover:text-primary-500 hover:bg-primary-100 hover:shadow-[inset_-5px_0_0_0]',
        props.isActive ?
          'text-primary-500 bg-primary-100 shadow-[inset_-5px_0_0_0]' : ''
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
        'py-5 flex-grow-1 w-full',
        !props.isActive && 'hidden'
      )
    }>{props.children}</div>
  );
};
