/* eslint-disable @typescript-eslint/no-empty-function */
import React, { FC, useContext, useMemo } from "react";
import { BackHandler } from "react-native";
import { Location, Router, To } from "react-router";
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
  getHistoryWithIndexesForPrefix: () => [],
  applyPrefixIndexesToHistory: () => {},
});

export const useNestedHistoryContext = () => useContext(NativeRouterContext);

const NativeRouter: FC<{ navigateOnMount?: To }> = ({
  children,
  navigateOnMount,
}) => {
  const {
    location,
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
  // React.useEffect(() => {
  //   console.log("PUSHING");
  //   push(navigateOnMount);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);
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
