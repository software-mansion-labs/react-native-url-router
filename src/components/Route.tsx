import { ComponentProps } from "react";
import { Route as RRRoute } from "react-router";
import { ScreenConfig } from "../navigators/StackNavigator/commons";
import { TabConfig } from "../navigators/TabNavigator/commons";

export type RouteConfig = TabConfig<unknown> & ScreenConfig;

type RouteProps = ComponentProps<typeof RRRoute> & RouteConfig;
const Route: (props: RouteProps) => JSX.Element | null = RRRoute;
export default Route;
