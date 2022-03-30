// import { createContext, useContext } from "react";

import { useCallback, useMemo, useRef } from "react";
import { NavigateOptions, useLocation, useNavigate } from "react-router";
import URLSearchParamsPoly from "@ungap/url-search-params";
// FROM react-router-native
export type ParamKeyValuePair = [string, string];

export type URLSearchParamsInit =
  | string
  | ParamKeyValuePair[]
  | Record<string, string | string[]>
  | URLSearchParams;

export function createSearchParams(
  init: URLSearchParamsInit = ""
): URLSearchParams {
  return new URLSearchParamsPoly(
    typeof init === "string" ||
    Array.isArray(init) ||
    init instanceof URLSearchParams
      ? init
      : Object.keys(init).reduce((memo, key) => {
          const value = init[key];
          return memo.concat(
            Array.isArray(value) ? value.map((v) => [key, v]) : [[key, value]]
          );
        }, [] as ParamKeyValuePair[])
  );
}

type SetURLSearchParams = (
  nextInit?: URLSearchParamsInit | undefined,
  navigateOpts?: NavigateOptions | undefined
) => void;

// It seems that the RN polyfill doesn't really return anything usable as a plain object
// This is probably a convoluted approach, so I'm thinking about switching back to a minimal string parser.
export function useSearchParams(
  defaultInit?: URLSearchParamsInit
): [object, SetURLSearchParams] {
  const defaultSearchParamsRef = useRef(createSearchParams(defaultInit));

  const location = useLocation();
  const searchParams = useMemo(() => {
    const params = createSearchParams(location.search);
    // eslint-disable-next-line no-restricted-syntax
    defaultSearchParamsRef.current.forEach((_, key) => {
      if (!params.has(key)) {
        defaultSearchParamsRef.current.getAll(key).forEach((value) => {
          params.append(key, value);
        });
      }
    });

    return params;
  }, [location.search]);

  const navigate = useNavigate();
  const setSearchParams: SetURLSearchParams = useCallback(
    (nextInit, navigateOpts) => {
      navigate(`?${createSearchParams(nextInit)}`, navigateOpts);
    },
    [navigate]
  );

  return [searchParams, setSearchParams];
}
