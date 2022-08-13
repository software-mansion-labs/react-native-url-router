import React, { ComponentProps, FC, useContext } from "react";
import { matchRoutes, Routes, UNSAFE_RouteContext } from "react-router";
import {
  Screen,
  ScreenStack,
  ScreenStackHeaderConfig,
} from "react-native-screens";
import { SafeAreaView, View, ViewStyle } from "react-native";
import {
  combineUrlSegments,
  last,
  prependSlash,
  uniqueBy,
  uniqueByIfConsequtive,
} from "../../utils";
import { useNestedHistoryContext } from "../../routers/NativeRouter";
import { FocusContext } from "../../contexts/FocusContext";
import createRoutesFromChildren, {
  RouteObjectWithConfig,
} from "../../utils/createRoutesFromChildrenPatched";
import { ScreenConfig } from "./commons";

const StackNavigator: FC<
  ComponentProps<typeof Routes> & {
    defaultScreenConfig?: ScreenConfig;
    stackConfig?: ComponentProps<typeof ScreenStack>;
  }
> = ({ children, defaultScreenConfig, stackConfig }) => {
  const { getHistoryWithIndexesForPrefix, applyPrefixIndexesToHistory } =
    useNestedHistoryContext();
  const routes = createRoutesFromChildren(children);
  const { isFocused: isParentFocused } = useContext(FocusContext);

  const { matches: parentMatches } = useContext(UNSAFE_RouteContext);
  const routeMatch = parentMatches[parentMatches.length - 1];
  const parentParams = routeMatch ? routeMatch.params : {};

  const parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";
  const basenamePrefix = prependSlash(parentPathnameBase);

  const historyWithPrefixes = getHistoryWithIndexesForPrefix(basenamePrefix);
  // It will contain serveral entries that should match to a single screen.
  // This is because it returns multiple entries for each of the child entries, that are a concern of nested navigators instead of this one.
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
      const uniquenessKeyForThisNavigator =
        m.location.key?.split("/").slice(0, pathnameSegmentsCount).join("/") ||
        "default";
      return { ...m, uniquenessKeyForThisNavigator };
    });
  const uniqueMatchesForThisNavigator = uniqueBy(
    flattenedMatches,
    (m) => m.uniquenessKeyForThisNavigator
  );

  // It can still contain screens that are the same screen, just duplicated to several parent entries.
  // To fix this we also filter out screens that are side by side and have the same key of the last segment.
  const matches = uniqueByIfConsequtive(uniqueMatchesForThisNavigator, (m) =>
    m.location.key.split("/").at(-1)
  );

  if (matches.length === 0) return null;
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
            <View
              style={[
                { flex: 1, backgroundColor: "#fff" },
                (r.match.route as RouteObjectWithConfig)?.additional
                  ?.containerStyle ?? defaultScreenConfig?.containerStyle,
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
            </View>
            <ScreenStackHeaderConfig
              title={
                (r.match.route as RouteObjectWithConfig)?.additional?.title ??
                defaultScreenConfig?.title ??
                r.match.route.path
              }
              {...defaultScreenConfig?.stackHeaderConfig}
              {...(r.match.route as RouteObjectWithConfig)?.additional
                ?.stackHeaderConfig}
            />
          </Screen>
        );
      })}
    </ScreenStack>
  );
};

export default StackNavigator;
