/* eslint-disable @typescript-eslint/no-empty-function */
import React, { FC, useContext, useMemo } from "react";
import { BackHandler } from "react-native";
import { Router, To } from "react-router";
import {
  GoConfig,
  NestedHistory,
  PrefixIndexes,
} from "../history/nativeHistory";

import useNativeHistory from "../history/useNativeHistory";

const NativeRouterContext = React.createContext<{
  history: NestedHistory;
  go: (config?: GoConfig) => void;
  getHistoryForPrefix: (prefix: string) => string[];
  applyPrefixIndexesToHistory: (prefixIndexes: PrefixIndexes) => void;
  getHistoryWithIndexesForPrefix: (
    prefix: string
  ) => { url: string; prefixIndexes: PrefixIndexes }[];
}>({
  history: { prefixes: { "/": { index: 0, segments: ["$"] } } },
  go: () => {}, // deprecated, use go from router instead
  getHistoryForPrefix: () => [],
  getHistoryWithIndexesForPrefix: () => [],
  applyPrefixIndexesToHistory: () => {},
});

export const useNestedHistoryContext = () => useContext(NativeRouterContext);

const NativeRouter: FC = ({ children }) => {
  const {
    url,
    go,
    push,
    replace,
    history,
    getHistoryForPrefix,
    getHistoryWithIndexesForPrefix,
    applyPrefixIndexesToHistory,
  } = useNativeHistory();
  React.useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () =>
      go()
    );
    return () => subscription.remove();
  }, [go]);
  const contextValue = useMemo(
    () => ({
      history,
      go,
      getHistoryForPrefix,
      getHistoryWithIndexesForPrefix,
      applyPrefixIndexesToHistory,
    }),
    [
      applyPrefixIndexesToHistory,
      getHistoryForPrefix,
      getHistoryWithIndexesForPrefix,
      go,
      history,
    ]
  );
  return (
    <NativeRouterContext.Provider value={contextValue}>
      <Router
        location={url}
        navigator={{
          go: (delta: number) => {
            go({
              count: Math.abs(delta),
              direction: delta < 0 ? "back" : "forward",
            });
          },
          push: (pushUrl: To) => {
            push(
              typeof pushUrl === "string"
                ? pushUrl
                : pushUrl.pathname + pushUrl.search || ""
            );
          },
          replace: (replaceUrl: To) => {
            replace(
              typeof replaceUrl === "string"
                ? replaceUrl
                : replaceUrl.pathname || ""
            );
          },
          createHref: () => {
            // eslint-disable-next-line no-console
            console.warn("not supported yet");
            return "";
          },
        }}
      >
        {children}
      </Router>
    </NativeRouterContext.Provider>
  );
};
export default NativeRouter;
