import React, {
  ComponentProps,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Text, View } from "react-native";
import PagerView from "react-native-pager-view";
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
import { SearchParamsContext } from "../contexts/SearchParamsContext";

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
  const parentParams = routeMatch ? routeMatch.params : {};

  const parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";
  const basenamePrefix = prependSlash(
    parentPathnameBase.replace(/(\/|\*)*$/g, "")
  );
  const tabHistory = getHistoryForPrefix(basenamePrefix);
  const url = prependSlash(
    (last(tabHistory) || "").slice(basenamePrefix.length) || "/"
  );
  const currentTabIndex = Math.max(
    0,
    routes.findIndex((r) =>
      last(
        matchRoutes([r], {
          pathname: url.split("?")[0],
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
          if (event.nativeEvent.position === currentTabIndex) return;
          const route = routes[event.nativeEvent.position];
          navigate(route.path || "/");
        }}
      >
        {routes.map((route, idx) => {
          const allMatches =
            matchRoutes(routes, {
              pathname: prependSlash(route.path || "/"),
            }) || [];
          const match = last(allMatches);
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
            // <Freeze
            //   freeze={!(isParentFocused && idx === currentTabIndex)}
            //   // eslint-disable-next-line react/no-array-index-key
            //   key={`${match.pathname}-${idx}`}
            // >
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
                  matches: parentMatches.concat(
                    allMatches.map((m) => ({
                      ...m,
                      params: { ...parentParams, ...m.params },
                      pathname: combineUrlSegments(
                        parentPathnameBase,
                        m.pathname
                      ),
                      pathnameBase:
                        m.pathnameBase === "/"
                          ? parentPathnameBase
                          : combineUrlSegments(
                              parentPathnameBase,
                              m.pathnameBase
                            ),
                    }))
                  ),
                  outlet: null,
                }}
              >
                <FocusContext.Provider
                  // eslint-disable-next-line react/jsx-no-constructed-context-values
                  value={{
                    isFocused: isParentFocused && idx === currentTabIndex,
                  }}
                >
                  <SearchParamsContext.Provider
                    // eslint-disable-next-line react/jsx-no-constructed-context-values
                    value={Object.fromEntries(
                      url
                        .split("?")?.[1]
                        ?.split("&")
                        .map((p) => {
                          const [k, v] = p.split("=");
                          return [k, v];
                        }) || []
                    )}
                  >
                    {match.route.element}
                  </SearchParamsContext.Provider>
                </FocusContext.Provider>
              </UNSAFE_RouteContext.Provider>
            </View>
            // </Freeze>
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
