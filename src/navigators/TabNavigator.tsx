import React, {
  ComponentProps,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import {
  createRoutesFromChildren,
  matchRoutes,
  Routes,
  UNSAFE_RouteContext,
  useNavigate,
} from "react-router";
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
  const navigate = useNavigate();
  const routeMatch = parentMatches[parentMatches.length - 1];
  const parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";
  const basenamePrefix = prependSlash(
    parentPathnameBase.replace(/(\/|\*)*$/g, "")
  );
  const tabHistory = getHistoryForPrefix(basenamePrefix);
  const currentTabIndex = Math.max(
    0,
    routes.findIndex((r) =>
      last(
        matchRoutes([r], {
          pathname: prependSlash(
            (last(tabHistory) || "").slice(basenamePrefix.length) || "/"
          ),
        }) || []
      )
    )
  );
  const tabs = routes.map((r, idx) => ({
    tabLink: `${surroundSlash(combineUrlSegments(parentPathnameBase, r.path))}${
      currentTabIndex === idx ? "" : "*"
    }`,
    active: idx === currentTabIndex,
    ...tabsConfig?.[r.path || ""],
  }));

  const ref = useRef<PagerView>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.setPage(currentTabIndex || 0);
    }
  }, [currentTabIndex]);

  if (routes.length <= currentTabIndex) return null;

  return (
    <View style={{ flex: 1 }}>
      <PagerView
        style={{ flex: 1 }}
        ref={ref}
        key={routes.map((r) => r.path).join("-")}
        initialPage={currentTabIndex}
        onPageSelected={(event) => {
          const route = routes[event.nativeEvent.position];
          navigate(route.path || "/");
        }}
      >
        {routes.map((route, idx) => {
          const match = last(
            matchRoutes(routes, {
              pathname: prependSlash(route.path || "/"),
            }) || []
          );
          if (!match) {
            return (
              <View
                key="empty"
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            );
          }
          return (
            <View
              style={{
                width: "100%",
                height: "100%",
              }}
              // eslint-disable-next-line react/no-array-index-key
              key={`${match.pathname}-${idx}`}
            >
              <UNSAFE_RouteContext.Provider
                // figure out how to get the memoing to work
                // eslint-disable-next-line react/jsx-no-constructed-context-values
                value={{
                  matches: parentMatches.concat(match),
                  outlet: null,
                }}
              >
                <FocusContext.Provider
                  // eslint-disable-next-line react/jsx-no-constructed-context-values
                  value={{
                    isFocused: isParentFocused && idx === currentTabIndex,
                  }}
                >
                  {match.route.element}
                </FocusContext.Provider>
              </UNSAFE_RouteContext.Provider>
            </View>
          );
        })}
      </PagerView>
      <View style={{ height: 70, flexDirection: "row", width: "100%" }}>
        <BottomTabsComponent tabs={tabs} />
      </View>
    </View>
  );
}
export default TabNavigator;
