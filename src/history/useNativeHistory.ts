import { BrowserHistory, createBrowserHistory } from "history";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { To } from "react-router";
import {
  getLocationFromHistory,
  pushLocationToHistory,
  NestedHistory,
  getHistoryForPrefix,
  go,
  getHistoryWithIndexesForPrefix,
  PrefixIndexes,
  applyPrefixIndexesToHistory,
  removePrefix,
  resetPrefix,
  defaultNestedHistory,
  getInitialHistoryForPath,
} from "./nativeHistory";

const useWebLocation = () => {
  if (Platform.OS === "web") {
    return window.location;
  }
  return null;
};

const useNestedHistory = ({
  initialHistory,
  webURLRootPrefix = "/",
}: {
  initialHistory?: NestedHistory;
  webURLRootPrefix?: string;
}) => {
  const location = useWebLocation();
  const [history, setHistory] = useState<NestedHistory>(
    location?.pathname && location.pathname !== "/"
      ? getInitialHistoryForPath(`${webURLRootPrefix}${location.pathname}`)
      : initialHistory || defaultNestedHistory
  );
  const historyRef = useRef<BrowserHistory>();

  if (Platform.OS === "web") {
    if (historyRef.current == null) {
      historyRef.current = createBrowserHistory({ window });
    }
  }
  const webHistory = historyRef.current;

  const attemptGo = useCallback(
    (config?: {
      onPath?: string;
      direction?: "forward" | "back";
      count?: number;
    }) => {
      const goResult = go(history, config);
      if (goResult.handled) setHistory(() => goResult.history);
      return goResult.handled;
    },
    [history]
  );

  useLayoutEffect(
    () =>
      webHistory?.listen((evt) => {
        const newLocation = { ...evt.location };
        newLocation.pathname = `${webURLRootPrefix}${newLocation.pathname.replace(
          "/*",
          ""
        )}`;
        setHistory((h) => {
          const historyAfterRootReset = resetPrefix(h, webURLRootPrefix);
          return pushLocationToHistory(historyAfterRootReset, newLocation);
        });
      }),
    [webHistory, attemptGo, webURLRootPrefix]
  );

  return {
    location: getLocationFromHistory(history),
    history,
    go: (config?: any) => {
      return attemptGo(config);
    },
    push: (to: To, state?: unknown) => {
      setHistory((h) => pushLocationToHistory(h, to, false, state));
      if (Platform.OS === "web") {
        window.history.pushState(
          { history },
          null,
          (to as any).pathname.slice(webURLRootPrefix.length) +
            (to as any).search
        );
      }
    },
    replace: (to: To, state?: unknown) => {
      setHistory((h) => pushLocationToHistory(h, to, true, state));
      if (Platform.OS === "web") {
        window.history.replaceState(
          { history },
          null,
          (to as any).pathname.slice(webURLRootPrefix.length) +
            (to as any).search
        );
      }
    },
    removePrefix: (prefix: string) =>
      setHistory((h) => removePrefix(h, prefix)),
    resetPrefix: (prefix: string) => setHistory((h) => resetPrefix(h, prefix)),
    applyPrefixIndexesToHistory: (prefixIndexes: PrefixIndexes) =>
      setHistory((h) => applyPrefixIndexesToHistory(h, prefixIndexes)),
    getHistoryForPrefix: (prefix: string) =>
      getHistoryForPrefix(history, prefix),
    getHistoryWithIndexesForPrefix: (prefix: string) =>
      getHistoryWithIndexesForPrefix(history, prefix, {}),
  };
};
export default useNestedHistory;
