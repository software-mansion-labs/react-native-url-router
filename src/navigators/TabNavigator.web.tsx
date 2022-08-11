import React, {
  ComponentProps,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import { View } from "react-native";
import {
  createRoutesFromChildren,
  matchRoutes,
  Routes,
  UNSAFE_RouteContext,
  useNavigate,
} from "react-router";
// import { Freeze } from "react-freeze";
import { useNestedHistoryContext } from "../routers/NativeRouter";
import {
  combineUrlSegments,
  last,
  prependSlash,
  surroundSlash,
} from "../utils";
import DefaultBottomTabs from "../components/DefaultBottomTabs";
import { FocusContext } from "../contexts/FocusContext";

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

export type Props<
  AdditionalTabConfig extends Record<string, unknown> = Record<string, unknown>
> = {
  tabsConfig?: TabsConfig<AdditionalTabConfig>;
  // defaultTabUrl?: string; // A relative URL to the default tab, TabNavigator calls navigateOnPrefix if the TabNavigator is rendered but the URL doesn't point to any of the tabs
  BottomTabsComponent?: (props: {
    tabs: Tabs<AdditionalTabConfig>;
  }) => ReactElement;
};

function TabNavigator({
  children,
  tabsConfig,
  BottomTabsComponent = DefaultBottomTabs,
}: ComponentProps<typeof Routes> & Props) {
  const { getHistoryForPrefix } = useNestedHistoryContext();
  const { isFocused: isParentFocused } = useContext(FocusContext);

  const routes = createRoutesFromChildren(children);
  const { matches: parentMatches } = useContext(UNSAFE_RouteContext);
  const routeMatch = parentMatches[parentMatches.length - 1];
  const parentParams = routeMatch ? routeMatch.params : {};

  const parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";
  const basenamePrefix = prependSlash(
    parentPathnameBase.replace(/(\/|\*)*$/g, "")
  );
  const tabHistory = getHistoryForPrefix(basenamePrefix);
  const url = prependSlash(
    (last(tabHistory)?.pathname || "").slice(basenamePrefix.length) || "/"
  );
  const currentTabIndex = routes.findIndex((r) =>
    last(
      matchRoutes([r], {
        pathname: url.split("?")[0],
      }) || []
    )
  ); // can be -1 if no tab is selected
  const tabs = routes.map((r, idx) => ({
    tabLink: `${surroundSlash(combineUrlSegments(parentPathnameBase, r.path))}${
      currentTabIndex === idx ? "" : "*"
    }`,
    active: idx === currentTabIndex,
    ...tabsConfig?.[r.path || ""],
  }));

  if (routes.length <= currentTabIndex) return null;
  const currentRoute = routes[currentTabIndex];
  if (!(currentTabIndex >= 0 && currentTabIndex < routes.length)) return null;
  const allMatches =
    matchRoutes(routes, {
      pathname: prependSlash(currentRoute.path || "/"),
    }) || [];
  const match = last(allMatches);
  if (!match)
    return (
      <View
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    );

  return (
    <View style={{ flex: 1, width: "100%" }}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            width: "100%",
            height: "100%",
          }}
          // eslint-disable-next-line react/no-array-index-key
        >
          <UNSAFE_RouteContext.Provider
            // figure out how to get the memoing to work
            // eslint-disable-next-line react/jsx-no-constructed-context-values
            value={{
              matches: parentMatches.concat(
                allMatches.map((m) => ({
                  ...m,
                  params: { ...parentParams, ...m.params },
                  pathname: combineUrlSegments(parentPathnameBase, m.pathname),
                  pathnameBase:
                    m.pathnameBase === "/"
                      ? parentPathnameBase
                      : combineUrlSegments(parentPathnameBase, m.pathnameBase),
                }))
              ),
              outlet: null,
            }}
          >
            <FocusContext.Provider
              // eslint-disable-next-line react/jsx-no-constructed-context-values
              value={{
                isFocused: true,
              }}
            >
              {match.route.element}
            </FocusContext.Provider>
          </UNSAFE_RouteContext.Provider>
        </View>
      </View>
      <View style={{ height: 70, flexDirection: "row", width: "100%" }}>
        <BottomTabsComponent tabs={tabs} />
      </View>
    </View>
  );
}
export default TabNavigator;
