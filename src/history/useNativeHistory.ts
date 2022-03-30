import { useState, useMemo } from "react";
import {
  getLocationFromHistory,
  pushLocationToHistory,
  NestedHistory,
  getHistoryForPrefix,
  go,
  getHistoryWithIndexesForPrefix,
  PrefixIndexes,
  applyPrefixIndexesToHistory,
} from "./nativeHistory";

const useNestedHistory = () => {
  const [history, setHistory] = useState<NestedHistory>({
    segments: {
      "/": {
        index: 0,
        segments: [
          { hash: "", search: "", type: "leaf", key: "default", state: {} },
        ],
      },
    },
  });
  const location = useMemo(() => getLocationFromHistory(history), [history]);
  console.log({ history, location });

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
    location,
    history,
    push: (to: Location, state: object) =>
      setHistory((h) => pushLocationToHistory(h, to, false, state)),
    replace: (to: Location, state: object) =>
      setHistory((h) => pushLocationToHistory(h, to, true, state)),
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
