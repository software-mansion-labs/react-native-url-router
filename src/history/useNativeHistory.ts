import { useState, useMemo } from "react";
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
} from "./nativeHistory";

const useNestedHistory = () => {
  const [history, setHistory] = useState<NestedHistory>({
    segments: {
      "/": {
        index: 0,
        segments: [{ type: "branch", key: "default", pathnamePart: "app" }],
      },
      "/app": {
        index: 0,
        segments: [
          { hash: "", search: "", type: "leaf", key: "default", state: {} },
        ],
      },
    },
  });

  const attemptGo = (config?: {
    onPath?: string;
    direction?: "forward" | "back";
    count?: number;
  }) => {
    const goResult = go(history, config);
    if (goResult.handled) setHistory(() => goResult.history);
    return goResult.handled;
  };

  return {
    location: getLocationFromHistory(history),
    history,
    go: attemptGo,
    push: (to: To, state?: unknown) =>
      setHistory((h) => pushLocationToHistory(h, to, false, state)),
    replace: (to: To, state?: unknown) =>
      setHistory((h) => pushLocationToHistory(h, to, true, state)),
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
