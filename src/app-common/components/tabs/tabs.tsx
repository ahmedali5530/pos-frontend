import {ButtonHTMLAttributes, FunctionComponent, PropsWithChildren, ReactElement, useCallback, useState} from 'react';
import classNames from "classnames";
import ScrollContainer from 'react-indiana-drag-scroll';

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
  position?: 'top'|'left'|'right';
}

export const TabControl: FunctionComponent<TabControlProps> = (props) => {
  const [{ activeTab, isTabActive }, { setActiveTab }] = useTabControl(props);
  let classes = 'tab-control flex gap-5';
  if(props.position === 'top'){
    classes = 'tab-control flex gap-5 flex-col';
  }

  return (
    <div className={classes}>
      {props.render({ activeTab, setActiveTab, isTabActive })}
    </div>
  );
};

interface TabNavProps extends PropsWithChildren{
  position?: 'top'|'left'|'right';
}
export const TabNav = (props: TabNavProps) => {
  let classes = 'flex flex-col w-[220px] flex-shrink-0 border-r ml-[-20px] p-3 bg-gray-50';

  if(props.position === 'top'){
    classes = 'flex flex-shrink-0 p-1';
    return (
      <div className="bg-gray-100 rounded-full">
        <ScrollContainer horizontal nativeMobileScroll={true}>
          <div className={classes}>{props.children}</div>
        </ScrollContainer>
      </div>
    );
  }

  return (
    <div className={classes}>{props.children}</div>
  );
};

interface TabProps extends PropsWithChildren, ButtonHTMLAttributes<HTMLButtonElement>{
  isActive: boolean;
}
export const Tab = (props: TabProps) => {
  return (
    <button {...props} className={
      classNames(
        'p-3 px-5 flex-shrink-0 text-left rounded-full transition-all uppercase',
        props.isActive ?
          'text-white bg-primary-500' : ''
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
