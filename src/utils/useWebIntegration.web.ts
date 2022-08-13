import { BrowserHistory, createBrowserHistory, To } from "history";
import { useLayoutEffect, useRef } from "react";
import { Platform } from "react-native";
import {
  GoConfig,
  NestedHistory,
  pushLocationToHistory,
  resetPrefix,
} from "../history/nativeHistory";
import { getToPiecesAsString, prependSlash } from "../utils";

const useWebIntegration = ({
  go,
  attachWebURLOn,
  setHistory,
}: {
  go: (config: GoConfig) => boolean;
  attachWebURLOn?: string;
  setHistory: (setter: (h: NestedHistory) => NestedHistory) => void;
}) => {
  const historyRef = useRef<BrowserHistory>();
  if (Platform.OS === "web") {
    if (historyRef.current == null) {
      historyRef.current = createBrowserHistory({ window });
    }
  }
  const webHistory = historyRef.current;
  useLayoutEffect(
    () =>
      webHistory?.listen((evt) => {
        const newLocation = { ...evt.location };
        newLocation.pathname = `${
          attachWebURLOn || ""
        }${newLocation.pathname.replace("/*", "")}`;
        setHistory((h) => {
          const historyAfterRootReset = resetPrefix(h, attachWebURLOn);
          return pushLocationToHistory(historyAfterRootReset, newLocation);
        });
      }),
    [webHistory, go, attachWebURLOn, setHistory]
  );
  return {
    navigate: (replace: boolean, to: To | null, state: unknown) => {
      if (Platform.OS === "web" && to) {
        const url = getToPiecesAsString(to);
        if (attachWebURLOn.length > 0 && !url.startsWith(attachWebURLOn))
          return;
        window.history[replace ? "replaceState" : "pushState"](
          state,
          null,
          prependSlash(url.slice(attachWebURLOn.length))
        );
      }
    },
  };
};
export default useWebIntegration;
