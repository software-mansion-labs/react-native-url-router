import React, { FC } from "react";
import { Pressable, ViewStyle } from "react-native";
import { useNavigate } from "react-router";

const Link: FC<
  ({ to: string; back?: undefined } | { back: boolean; to?: undefined }) & {
    style: ViewStyle;
  }
> = ({ children, to, back, style }) => {
  const navigate = useNavigate();
  return (
    <Pressable
      style={({ pressed }) => (pressed ? [{ opacity: 0.85 }, style] : style)}
      onPress={() => (back ? navigate(-1) : navigate(to || ""))}
    >
      {children}
    </Pressable>
  );
};
export default Link;
