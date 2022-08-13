import { useCallback, useState } from "react";
import { Platform } from "react-native";
import { To } from "react-router";
import { prependSlash } from "../utils";
import useWebIntegration from "../utils/useWebIntegration.web";
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
  GoConfig,
} from "./nativeHistory";

const useWebLocation = () => {
  if (Platform.OS === "web") {
    return window.location;
  }
  return null;
};

const useNestedHistory = ({
  initialHistory,
  attachWebURLOn = "",
}: {
  initialHistory?: NestedHistory;
  attachWebURLOn?: string;
}) => {
  const location = useWebLocation();
  const [history, setHistory] = useState<NestedHistory>(
    location?.pathname && location.pathname !== "/"
      ? getInitialHistoryForPath(
          prependSlash(`${attachWebURLOn}${location.pathname}`)
        )
      : initialHistory || defaultNestedHistory
  );

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

  const { navigate: webNavigate } = useWebIntegration({
    setHistory,
    go: attemptGo,
    attachWebURLOn,
  });

  const getNavigateAction =
    (replace?: boolean) => (to: To, state?: unknown) => {
      setHistory((h) => pushLocationToHistory(h, to, replace, state));
      webNavigate(
        replace,
        getHistoryForPrefix(
          pushLocationToHistory(history, to, replace, state),
          attachWebURLOn || "/"
        ).at(-1),
        state
      );
    };

  return {
    location: getLocationFromHistory(history),
    history,
    go: (config?: GoConfig) => {
      return attemptGo(config);
    },
    push: getNavigateAction(false),
    replace: getNavigateAction(true),
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
