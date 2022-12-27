import {ButtonHTMLAttributes, FunctionComponent, PropsWithChildren, ReactElement, useCallback, useState} from 'react';
import classNames from "classnames";
import ScrollContainer from "react-indiana-drag-scroll";

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
    <ScrollContainer horizontal nativeMobileScroll={true}>
      <div className="flex justify-start items-center">{props.children}</div>
    </ScrollContainer>
  );
};

interface TabProps extends PropsWithChildren, ButtonHTMLAttributes<HTMLButtonElement>{
  isActive: boolean;
}
export const Tab = (props: TabProps) => {
  return (
    <button {...props} className={
      classNames(
        'p-3 px-5 flex-shrink-0 border-b',
        props.isActive ?
          'text-primary-500 border-primary-500 shadow-[inset_0px_-2px_0_0]' : ''
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
