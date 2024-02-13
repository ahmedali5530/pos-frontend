import {
  ButtonHTMLAttributes,
  FunctionComponent,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useState,
} from "react";
import classNames from "classnames";
import ScrollContainer from "react-indiana-drag-scroll";
import { Button } from "../input/button";

export interface TabControlState {
  activeTab: string;
  isTabActive: (tab: string) => boolean;
}

export interface TabControlActions {
  setActiveTab: (tab: string) => void;
}

export interface UseTabControlProps {
  defaultTab: string;
}

export const useTabControl = (
  props: UseTabControlProps
): [TabControlState, TabControlActions] => {
  const { defaultTab } = props;
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  const isTabActive = useCallback(
    (tab: string) => activeTab === tab,
    [activeTab]
  );

  return [{ activeTab, isTabActive }, { setActiveTab }];
};

export interface RenderProps extends TabControlState, TabControlActions {}

export interface TabControlProps {
  defaultTab: string;
  render: (props: RenderProps) => ReactElement | null;
  position?: "top" | "left" | "right";
}

export const TabControl: FunctionComponent<TabControlProps> = (props) => {
  const [{ activeTab, isTabActive }, { setActiveTab }] = useTabControl(props);
  let classes = `tab-control flex gap-5 ${props?.position}`;
  if (props.position === "top") {
    classes = `tab-control flex gap-5 flex-col ${props?.position}`;
  }

  return (
    <div className={classes}>
      {props.render({ activeTab, setActiveTab, isTabActive })}
    </div>
  );
};

interface TabNavProps extends PropsWithChildren {
  position?: "top" | "left" | "right";
}
export const TabNav = (props: TabNavProps) => {
  let classes =
    "flex flex-col w-[220px] flex-shrink-0 ml-[-20px] bg-primary-500 py-5 pl-3 min-h-[100ex]";

  if (props.position === "top") {
    classes = "flex flex-shrink-0 p-1 rounded-lg";
    return (
      <div className="bg-gray-100 rounded-full">
        <ScrollContainer horizontal nativeMobileScroll={true}>
          <div className={classes}>{props.children}</div>
        </ScrollContainer>
      </div>
    );
  }

  return <div className={classes}>{props.children}</div>;
};

interface TabProps
  extends PropsWithChildren,
    ButtonHTMLAttributes<HTMLButtonElement> {
  isActive: boolean;
}
export const Tab = (props: TabProps) => {
  const { isActive, ...rest } = props;
  return (
    <button
      {...rest}
      type="button"
      className={classNames(
        "p-3 px-5 flex-shrink-0 text-left rounded-full relative sidebar-btn",
        isActive ? "text-primary-500 bg-white active shadow shadow-lg" : "text-white"
      )}>
      <span></span>
      {props.children}
    </button>
  );
};

interface TabContentProps extends PropsWithChildren {
  isActive: boolean;
  holdState?: boolean;
}
export const TabContent = (props: TabContentProps) => {
  if (!props.isActive && !props.holdState) {
    return <></>;
  }

  return (
    <div
      className={classNames(
        "py-5 flex-grow-1 w-full",
        !props.isActive && "hidden"
      )}>
      {props.children}
    </div>
  );
};
