import React, { FC } from "react";
import { Pressable, ViewStyle } from "react-native";
import { useNavigate } from "react-router";

const Link: FC<
  (
    | {
        to: string;
        back?: never;
        state?: unknown;
        replace?: boolean;
        onPress?: never;
      }
    | {
        back: true;
        to?: undefined;
        state?: never;
        replace?: never;
        onPress?: never;
      }
    | {
        back?: undefined;
        to?: undefined;
        state?: never;
        replace?: never;
        onPress?: () => void;
      }
  ) & {
    style?: ViewStyle;
  }
> = ({ children, to, back, style, state, replace, onPress }) => {
  const navigate = useNavigate();
  return (
    <Pressable
      style={({ pressed }) => (pressed ? [{ opacity: 0.85 }, style] : style)}
      onPress={
        onPress ||
        (() => (back ? navigate(-1) : navigate(to || "", { state, replace })))
      }
    >
      {children}
    </Pressable>
  );
};
export default Link;
