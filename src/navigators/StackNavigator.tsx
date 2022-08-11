import React, { ComponentProps, FC, useContext } from "react";
import {
  createRoutesFromChildren,
  matchRoutes,
  Routes,
  UNSAFE_RouteContext,
} from "react-router";
import {
  Screen,
  ScreenStack,
  ScreenStackHeaderConfig,
} from "react-native-screens";
import { SafeAreaView, ViewStyle } from "react-native";
import { combineUrlSegments, last, prependSlash, uniqueBy } from "../utils";
import { useNestedHistoryContext } from "../routers/NativeRouter";
import { FocusContext } from "../contexts/FocusContext";

export type ScreenConfig = {
  title?: string;
  stackHeaderConfig?: ComponentProps<typeof ScreenStackHeaderConfig>;
  containerStyle?: ViewStyle;
};

export type ScreensConfig = {
  [path: string]: ScreenConfig;
};

const StackNavigator: FC<
  ComponentProps<typeof Routes> & {
    screensConfig?: ScreensConfig;
    defaultScreenConfig?: ScreenConfig;
    stackConfig?: ComponentProps<typeof ScreenStack>;
  }
> = ({ children, screensConfig, defaultScreenConfig, stackConfig }) => {
  const { getHistoryWithIndexesForPrefix, applyPrefixIndexesToHistory } =
    useNestedHistoryContext();
  const routes = createRoutesFromChildren(children);
  const { isFocused: isParentFocused } = useContext(FocusContext);

  const { matches: parentMatches } = useContext(UNSAFE_RouteContext);
  const routeMatch = parentMatches[parentMatches.length - 1];
  const parentParams = routeMatch ? routeMatch.params : {};

  const parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";
  const basenamePrefix = prependSlash(parentPathnameBase);
  // .replace(/(\/|\*)*$/g, "")
  // const parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";
  const historyWithPrefixes = getHistoryWithIndexesForPrefix(basenamePrefix);

  const flattenedMatches = historyWithPrefixes
    .map((historyItem) => {
      const matches =
        matchRoutes(routes, historyItem.location.pathname, basenamePrefix) ||
        [];
      return {
        match: last(
          // TODO: performance can be increased by adding a limit to getHistoryWithIndexesForPrefix to only get
          // into N levels of segments where N = max number of segments of any route segment
          matches
        ),
        allMatches: matches,
        ...historyItem,
      };
    })
    .filter((m) => !!m.match && !!m.match.pathnameBase)
    .map((m) => {
      const pathnameSegmentsCount = m.match?.pathnameBase.split("/").length;
      const keyForNavigator =
        m.location.key?.split("/").slice(0, pathnameSegmentsCount).join("/") ||
        "default";
      return { ...m, keyForNavigator };
    });

  const matches = uniqueBy(flattenedMatches, (m) => m.keyForNavigator);
  if (matches.length === 0) return null;
  // const filteredMatches = uniqueMatches.filter((r) => !!r.match);
  return (
    <ScreenStack style={{ flex: 1, alignSelf: "stretch" }} {...stackConfig}>
      {matches.map((r, idx) => {
        let activityState: 0 | 1 | 2 = 0;
        if (idx === matches.length - 2) activityState = 1;
        if (idx === matches.length - 1) activityState = 2;
        return (
          <Screen
            // if index is different, two separate instances should render
            // eslint-disable-next-line react/no-array-index-key
            key={`${r.location.pathname}-${idx}`}
            onDismissed={(e) => {
              const { dismissCount } = e.nativeEvent;
              if (flattenedMatches[idx - dismissCount]?.prefixIndexes) {
                applyPrefixIndexesToHistory(
                  flattenedMatches[idx - dismissCount]?.prefixIndexes
                );
              }
            }}
            activityState={activityState}
            stackAnimation="slide_from_right"
          >
            <SafeAreaView
              style={[
                { flex: 1, backgroundColor: "#fff" },
                screensConfig?.[r.match.route?.path || ""]?.containerStyle ??
                  defaultScreenConfig?.containerStyle,
              ]}
            >
              <UNSAFE_RouteContext.Provider
                // figure out what to do with this
                // eslint-disable-next-line react/jsx-no-constructed-context-values
                value={{
                  matches: parentMatches.concat(
                    r.allMatches.map((match) => ({
                      ...match,
                      params: { ...parentParams, ...match.params },
                      pathname: combineUrlSegments(
                        parentPathnameBase,
                        match.pathname
                      ),
                      pathnameBase:
                        match.pathnameBase === "/"
                          ? parentPathnameBase
                          : combineUrlSegments(
                              parentPathnameBase,
                              match.pathnameBase
                            ),
                    }))
                  ),
                  outlet: null,
                }}
              >
                <FocusContext.Provider
                  // eslint-disable-next-line react/jsx-no-constructed-context-values
                  value={{
                    isFocused: isParentFocused && idx === matches.length - 1,
                  }}
                >
                  {r.match.route.element}
                </FocusContext.Provider>
              </UNSAFE_RouteContext.Provider>
            </SafeAreaView>
            <ScreenStackHeaderConfig
              title={
                screensConfig?.[r.match.route?.path || ""]?.title ??
                defaultScreenConfig?.title ??
                r.match.route.path
              }
              {...defaultScreenConfig?.stackHeaderConfig}
              {...screensConfig?.[r.match.route?.path || ""]?.stackHeaderConfig}
            />
          </Screen>
        );
      })}
    </ScreenStack>
  );
};

export default StackNavigator;
