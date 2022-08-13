import { ReactElement, ReactNode } from "react";

export type TabConfig<AdditionalTabConfig = Record<string, unknown>> = {
  title?: string;
  icon?: (props: { active: boolean; color: string; size: number }) => ReactNode;
} & AdditionalTabConfig;

export type TabsConfig<AdditionalTabConfig extends Record<string, unknown>> = {
  [path: string]: TabConfig<AdditionalTabConfig>;
};

export type Tabs<AdditionalTabConfig extends Record<string, unknown>> = ({
  tabLink: string;
  active: boolean;
} & TabConfig<AdditionalTabConfig>)[];

export type TabNavigatorProps<
  AdditionalTabConfig extends Record<string, unknown> = Record<string, unknown>
> = {
  tabsConfig?: TabsConfig<AdditionalTabConfig>;
  // defaultTabUrl?: string; // A relative URL to the default tab, TabNavigator calls navigateOnPrefix if the TabNavigator is rendered but the URL doesn't point to any of the tabs
  BottomTabsComponent?: (props: {
    tabs: Tabs<AdditionalTabConfig>;
  }) => ReactElement;
};
