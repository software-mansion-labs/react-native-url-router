import React, { ComponentProps, FC, ReactNode, useContext } from "react";
import {
  createRoutesFromChildren,
  matchRoutes,
  Routes,
  UNSAFE_RouteContext,
  UNSAFE_LocationContext,
} from "react-router";
import {
  Screen,
  ScreenStack,
  ScreenStackHeaderConfig,
} from "react-native-screens";
import { SafeAreaView, ViewStyle } from "react-native";
import { last, prependSlash, uniqueBy } from "../utils";
import { useNestedHistoryContext } from "../routers/NativeRouter";
import { PrefixIndexes } from "../history/nativeHistory";
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
  // const parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";
  const basenamePrefix = prependSlash(
    parentMatches.map((pm) => pm.pathname.replace(/(\/|\*)*$/g, "")).join("")
  );
  const historyWithPrefixes = getHistoryWithIndexesForPrefix(basenamePrefix);
  const flattenedMatches = (
    historyWithPrefixes.length > 0
      ? historyWithPrefixes
      : [{ url: "/", prefixIndexes: {} as PrefixIndexes }]
  ).map((historyItem) => ({
    match: last(
      // TODO: performance can be increased by adding a limit to getHistoryWithIndexesForPrefix to only get
      // into N levels of segments where N = max number of segments of any route segment
      matchRoutes(routes, {
        pathname: prependSlash(
          historyItem.url.slice(basenamePrefix.length) || "/"
        ),
      }) || []
    ),
    ...historyItem,
  }));
  const uniqueMatches = uniqueBy(
    flattenedMatches.filter((m) => !!m.match?.pathnameBase),
    (m) => m.match?.pathnameBase
  );
  if (uniqueMatches.length === 0) return null;
  const filteredMatches = uniqueMatches.filter((r) => !!r.match);

  return (
    <ScreenStack style={{ flex: 1, alignSelf: "stretch" }} {...stackConfig}>
      {filteredMatches.map((r, idx) => {
        const historyItemForPreviousScreen = uniqueMatches
          .slice(0, idx)
          .reverse()
          .find((i) => !!i.match); // find previous non null match
        let activityState: 0 | 1 | 2 = 0;
        if (idx === filteredMatches.length - 2) activityState = 1;
        if (idx === filteredMatches.length - 1) activityState = 2;
        return (
          <Screen
            // if index is different, two separate instances should render
            // eslint-disable-next-line react/no-array-index-key
            key={`${r.match.pathnameBase}-${idx}`}
            onDismissed={() => {
              if (historyItemForPreviousScreen) {
                applyPrefixIndexesToHistory(
                  historyItemForPreviousScreen.prefixIndexes
                );
              }
            }}
            activityState={activityState}
            stackAnimation="slide_from_right"
          >
            <SafeAreaView
              style={[
                { flex: 1 },
                screensConfig?.[r.match.route?.path || ""]?.containerStyle ??
                  defaultScreenConfig?.containerStyle,
              ]}
            >
              <UNSAFE_RouteContext.Provider
                // figure out what to do with this
                // eslint-disable-next-line react/jsx-no-constructed-context-values
                value={{
                  matches: parentMatches.concat(r.match),
                  outlet: null,
                }}
              >
                <FocusContext.Provider
                  // eslint-disable-next-line react/jsx-no-constructed-context-values
                  value={{
                    isFocused:
                      isParentFocused && idx === filteredMatches.length - 1,
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
