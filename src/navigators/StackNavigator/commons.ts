import { ComponentProps } from "react";
import { ViewStyle } from "react-native";
import type { ScreenStackHeaderConfig } from "react-native-screens";

export type ScreenConfig = {
  title?: string;
  stackHeaderConfig?: ComponentProps<typeof ScreenStackHeaderConfig>;
  containerStyle?: ViewStyle;
};

export type ScreensConfig = {
  [path: string]: ScreenConfig;
};
