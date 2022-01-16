import { useState, useMemo } from "react";
import {
  getCurrentUrlFromHistory,
  pushUrlToHistory,
  NestedHistory,
  getHistoryForPrefix,
  go,
  getHistoryWithIndexesForPrefix,
  PrefixIndexes,
  applyPrefixIndexesToHistory,
} from "./nativeHistory";

const useNestedHistory = () => {
  const [history, setHistory] = useState<NestedHistory>({
    prefixes: {
      "/": { index: 0, segments: ["$"] },
    },
  });
  const url = useMemo(() => getCurrentUrlFromHistory(history), [history]);
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
    url,
    history,
    push: (pushUrl: string) =>
      setHistory((h) => pushUrlToHistory(h, pushUrl, false)),
    replace: (replaceUrl: string) =>
      setHistory((h) => pushUrlToHistory(h, replaceUrl, true)),
    go: attemptGo,
    getHistoryForPrefix: (prefix: string) =>
      getHistoryForPrefix(history, prefix),
    getHistoryWithIndexesForPrefix: (prefix: string) =>
      getHistoryWithIndexesForPrefix(history, prefix, {}),
    applyPrefixIndexesToHistory: (prefixIndexes: PrefixIndexes) =>
      setHistory((h) => applyPrefixIndexesToHistory(h, prefixIndexes)),
  };
};
export default useNestedHistory;
