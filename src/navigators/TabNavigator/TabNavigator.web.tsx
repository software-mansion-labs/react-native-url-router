import React, { ComponentProps, useContext } from "react";
import { View } from "react-native";
import { matchRoutes, Routes, UNSAFE_RouteContext } from "react-router";
import { useNestedHistoryContext } from "../../routers/NativeRouter";
import {
  combineUrlSegments,
  last,
  prependSlash,
  surroundSlash,
} from "../../utils";
import DefaultBottomTabs from "../../components/DefaultBottomTabs";
import { FocusContext } from "../../contexts/FocusContext";
import { TabNavigatorProps } from "./commons";
import createRoutesFromChildren from "../../utils/createRoutesFromChildrenPatched";

const alwaysFocused = {
  isFocused: true,
};

function TabNavigator({
  children,
  BottomTabsComponent = DefaultBottomTabs,
}: ComponentProps<typeof Routes> & TabNavigatorProps) {
  const { getHistoryForPrefix } = useNestedHistoryContext();
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
    ...r?.additional,
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
            <FocusContext.Provider value={alwaysFocused}>
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
