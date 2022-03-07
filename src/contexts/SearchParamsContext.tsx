import { createContext, useContext } from "react";

export type SearchParams = Record<string, string>;

export const SearchParamsContext = createContext<SearchParams>({});

export const useSearchParams = () => {
  // TODO: add context existance check
  return useContext(SearchParamsContext);
};
