import React, { ComponentProps, FC, useContext } from "react";
import { matchRoutes, Routes, UNSAFE_RouteContext } from "react-router";

import { SafeAreaView, View } from "react-native";
import { combineUrlSegments, last, prependSlash } from "../../utils";
import { useNestedHistoryContext } from "../../routers/NativeRouter";
import { FocusContext } from "../../contexts/FocusContext";
import createRoutesFromChildren, {
  RouteObjectWithConfig,
} from "../../utils/createRoutesFromChildrenPatched";
import { ScreenConfig } from "./commons";

const StackNavigator: FC<
  ComponentProps<typeof Routes> & {
    defaultScreenConfig?: ScreenConfig;
    stackConfig?: never;
  }
> = ({ children, defaultScreenConfig }) => {
  const { getHistoryWithIndexesForPrefix } = useNestedHistoryContext();
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
  const currentMatch = historyWithPrefixes
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
    .at(-1);

  // It can still contain screens that are the same screen, just duplicated to several parent entries.
  // To fix this we also filter out screens that are side by side and have the same key of the last segment.

  if (!currentMatch) return null;
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: "#fff",
          width: "100%",
        },
        (currentMatch.match.route as RouteObjectWithConfig)?.additional
          ?.containerStyle ?? defaultScreenConfig?.containerStyle,
      ]}
    >
      <UNSAFE_RouteContext.Provider
        // figure out what to do with this
        // eslint-disable-next-line react/jsx-no-constructed-context-values
        value={{
          matches: parentMatches.concat(
            currentMatch.allMatches.map((match) => ({
              ...match,
              params: { ...parentParams, ...match.params },
              pathname: combineUrlSegments(parentPathnameBase, match.pathname),
              pathnameBase:
                match.pathnameBase === "/"
                  ? parentPathnameBase
                  : combineUrlSegments(parentPathnameBase, match.pathnameBase),
            }))
          ),
          outlet: null,
        }}
      >
        <FocusContext.Provider
          // eslint-disable-next-line react/jsx-no-constructed-context-values
          value={{
            isFocused: isParentFocused,
          }}
        >
          {currentMatch.match.route.element}
        </FocusContext.Provider>
      </UNSAFE_RouteContext.Provider>
    </View>
  );
};

export default StackNavigator;
