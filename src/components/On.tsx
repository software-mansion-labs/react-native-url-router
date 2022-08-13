import React, { ReactNode, useContext } from "react";
import { UNSAFE_LocationContext, UNSAFE_RouteContext } from "react-router";
import { Action } from "history";
import { combineUrlSegments } from "../utils";
import { FocusContext } from "../contexts/FocusContext";
import { useNestedHistoryContext } from "../routers/NativeRouter";

function On({ children, path }: { children: ReactNode; path: string }) {
  const { isFocused: isParentFocused } = useContext(FocusContext);
  const { matches: parentMatches } = useContext(UNSAFE_RouteContext);
  const routeMatch = parentMatches[parentMatches.length - 1];
  const parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";
  const parentPathname = routeMatch ? routeMatch.pathname : "/";
  const matchesNestedByPath = [
    ...parentMatches.slice(0, -1),
    {
      ...routeMatch,
      pathname: combineUrlSegments(parentPathname, path),
      pathnameBase: combineUrlSegments(parentPathnameBase, path),
    },
  ];
  const { getHistoryForPrefix } = useNestedHistoryContext();
  return (
    <UNSAFE_LocationContext.Provider
      // Needs a fix
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        location: getHistoryForPrefix(path).at(-1) || {
          pathname: path,
          hash: "",
          key: "default",
          search: "",
          state: null,
        },
        navigationType: Action.Pop,
      }}
    >
      <UNSAFE_RouteContext.Provider
        // figure out how to get the memoing to work
        // eslint-disable-next-line react/jsx-no-constructed-context-values
        value={{
          matches: matchesNestedByPath,
          outlet: null,
        }}
      >
        <FocusContext.Provider
          // eslint-disable-next-line react/jsx-no-constructed-context-values
          value={{
            isFocused: isParentFocused,
          }}
        >
          {children}
        </FocusContext.Provider>
      </UNSAFE_RouteContext.Provider>
    </UNSAFE_LocationContext.Provider>
  );
}
export default On;
