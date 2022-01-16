import { createContext, useContext } from "react";

export type Focus = {
  isFocused: boolean;
};

export const FocusContext = createContext<Focus>({ isFocused: true });

export const useFocus = () => {
  // TODO: add context existance check
  return useContext(FocusContext);
};
