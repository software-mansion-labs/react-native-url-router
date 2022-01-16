import React, { ComponentProps } from "react";
import { Navigate } from "react-router";
import { useFocus } from "../contexts/FocusContext";

export default (props: ComponentProps<typeof Navigate>) => {
  const { isFocused } = useFocus();
  if (!isFocused) return null;
  return <Navigate {...props} />;
};
