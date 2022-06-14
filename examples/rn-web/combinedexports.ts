import {
  NativeRouter,
  NavigateIfFocused,
  StackNavigator,
  Link as Link_,
  TabNavigator,
} from "react-native-url-router";
import {
  Route as Route_,
  useParams as useParams_,
  useNavigate as useNavigate_,
  Outlet as Outlet_,
} from "react-router";

export const StackOrRoutes = StackNavigator;
export const TabOrRoutes = TabNavigator;
export const PlatformSpecificRouter = NativeRouter;
export const Route = Route_;
export const Navigate = NavigateIfFocused;
export const useParams = useParams_;
export const Link = Link_;
export const useNavigate = useNavigate_;
export const Outlet = Outlet_;
