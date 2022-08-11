/* eslint-disable @typescript-eslint/no-empty-function */
import React, { FC, useContext, useMemo } from "react";
import { BackHandler } from "react-native";
import { Location, Router } from "react-router";
import {
  GoConfig,
  NestedHistory,
  PrefixIndexes,
} from "../history/nativeHistory";

import useNativeHistory from "../history/useNativeHistory";

const NativeRouterContext = React.createContext<{
  history: NestedHistory;
  go: (config?: GoConfig) => void;
  getHistoryForPrefix: (prefix: string) => Location[];
  removePrefix: (prefix: string) => void;
  resetPrefix: (prefix: string) => void;
  applyPrefixIndexesToHistory: (prefixIndexes: PrefixIndexes) => void;
  getHistoryWithIndexesForPrefix: (
    prefix: string
  ) => { location: Location; prefixIndexes: PrefixIndexes }[];
}>({
  history: {
    segments: {
      "/": {
        index: 0,
        segments: [
          {
            hash: "",
            search: "",
            type: "leaf",
            key: "default",
            state: {},
          },
        ],
      },
    },
  },
  go: () => {}, // deprecated, use go from router instead
  getHistoryForPrefix: () => [],
  removePrefix: () => {},
  resetPrefix: () => {},
  getHistoryWithIndexesForPrefix: () => [],
  applyPrefixIndexesToHistory: () => {},
});

export const useNestedHistoryContext = () => useContext(NativeRouterContext);

const NativeRouter: FC<{
  initialHistory?: NestedHistory;
  webURLRootPrefix?: string;
}> = ({ children, initialHistory, webURLRootPrefix }) => {
  const {
    location,
    go,
    push,
    replace,
    history,
    getHistoryForPrefix,
    getHistoryWithIndexesForPrefix,
    applyPrefixIndexesToHistory,
    removePrefix,
    resetPrefix,
  } = useNativeHistory({ initialHistory, webURLRootPrefix });
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
      removePrefix,
      resetPrefix,
    }),
    [
      applyPrefixIndexesToHistory,
      getHistoryForPrefix,
      getHistoryWithIndexesForPrefix,
      go,
      history,
      removePrefix,
      resetPrefix,
    ]
  );
  return (
    <NativeRouterContext.Provider value={contextValue}>
      <Router
        location={location}
        navigator={{
          go: (delta: number) => {
            go({
              count: Math.abs(delta),
              direction: delta < 0 ? "back" : "forward",
            });
          },
          push,
          replace,
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
