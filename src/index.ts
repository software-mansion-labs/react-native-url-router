// Router used as a replacement for the InMemoryRouter from react-router
export { getInitialHistoryForPath } from "./history/nativeHistory";

export {
  default as NativeRouter,
  useNestedHistoryContext,
} from "./routers/NativeRouter";
// Two navigators that provide corresponding behavior while being history-aware.
// Need to be used in conjunction with the NativeRouter.
export { default as TabNavigator } from "./navigators/TabNavigator/TabNavigator.web";
export { default as StackNavigator } from "./navigators/StackNavigator/StackNavigator.web";
export { default as Route } from "./components/Route";

export { default as Link } from "./components/Link";
export { default as On } from "./components/On";

export { default as NavigateIfFocused } from "./components/NavigateIfFocused";

export { default as UNSAFE_useNativeHistory } from "./history/useNativeHistory";

export { useSearchParams } from "./contexts/useSearchParams";
