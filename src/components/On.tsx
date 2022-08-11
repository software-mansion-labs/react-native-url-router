import React, { ReactNode, useContext } from "react";
import { UNSAFE_RouteContext } from "react-router";
import { combineUrlSegments } from "../utils";
import { FocusContext } from "../contexts/FocusContext";

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
  return (
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
  );
}
export default On;
