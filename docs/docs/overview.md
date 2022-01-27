---
sidebar_position: 1
---

# Overview

If you're familiar with [React Router](https://reactrouter.com/docs/en/v6/getting-started/overview), this page serves as a quick introduction to React Native Url Router.

It aims to mirror the overview page of React Router, with minimal explanations and lots of code.

## Installation

```
expo install react-native-url-router react-native-pager-view react-native-screens react-router
```

For regular react native read the installation page.

## History

On mobile, we need to store previously visited screens in memory we manage ourselves if we want to allow users to go back to a previous screen.

React Native Url Router treats allmost all navigation actions as just opening a URL.

Deep links are also treated as clicked URLs (just coming outside of the app).

Mobile patterns unfortunately make the memory model more complex than in a web browser.

In short, we don't have a single visited URL stack, but this should be transparent and behave just as a regular web browser navigation. If you need access to the underlying model if edge cases occur, it is exposed and easy to understand.

Read more on the Nested history docs.

<!-- add link -->

## Setting up Native Router

The NativeRouter component should be used just as the BrowserRouter or MemoryRouter components from react-router and should surround your entire tree.

```tsx
import * as React from "react";
import { NativeRouter } from "react-native-url-router";
export default function App() {
  return <NativeRouter>... your navigation structure comes here</NativeRouter>;
}
```

It works as an uncontrolled component, exposing the URL and history by context if needed. You use Navigators, Links or hooks provided by react-router to interact with it.

## Setting up Stack Navigators

```SnackPlayer name=StackNavigators&dependencies=react-native-url-router,react-native-pager-view,react-native-screens,react-router&platform=ios&supportedPlatforms=ios,android&loading=lazy

import * as React from "react";
import { Text, View, StyleSheet } from "react-native";
import { NativeRouter, StackNavigator, Link } from "react-native-url-router";
import { Route } from "react-router";
export default function App() {
  return (
    <NativeRouter>
      <StackNavigator>
        <Route
          path="/"
          element={
            <>
              <Text>Your root</Text>
              <Link to="feed">
                <Text>Go to feed</Text>
              </Link>
            </>
          }
        />
        <Route
          path="feed"
          element={
            <>
              <Text>Your feed</Text>
              <Link back>
                <Text>Go back</Text>
              </Link>
            </>
          }
        />
      </StackNavigator>
    </NativeRouter>
  );
}
```

## Setting up Tab Navigators

A tab navigator is an another native navigation pattern - the screens are arranged left to right, and changed either by swiping or tapping on an icon placed on a bottom bar.

```SnackPlayer name=TabNavigators&dependencies=react-native-url-router,react-native-pager-view,react-native-screens,react-router&platform=ios&supportedPlatforms=ios,android&loading=lazy
import * as React from "react";
import { Text, View, StyleSheet } from "react-native";
import { NativeRouter, TabNavigator, Link } from "react-native-url-router";
import { Route } from "react-router";
export default function App() {
  return (
    <NativeRouter>
      <TabNavigator>
        <Route
          path="feed"
          element={
            <View style={{ padding: 50 }}>
              <Text>Your feed</Text>
              <Link to="/profile">
                <Text>Go to profile</Text>
              </Link>
            </View>
          }
        />
        <Route
          path="profile"
          element={
            <>
              <Text style={{ padding: 50 }}>Your profile</Text>
            </>
          }
        />
      </TabNavigator>
    </NativeRouter>
  );
}
```

Bottom tabs are just `<Link>` components. If you don't provide a tab title (see Styling) the default tab label shows a URL that the tab press will navigate to.

## Navigation

You can use `<Link>` components everywhere you want to navigate on user click. You can also navigate imperatively (so after something like submitting a form goes through) using the useNavigate hook from react-router.

Links can be either relative or absolute (prefixed with /).

If you need to redirect users on render (like for auth) use the NavigateIfFocused component. It acts just as Navigate from react-router, except it will not navigate unless the screen it is rendered in is currently in focus.

```tsx
<Link to="/feed">
  <Text>Go to feed</Text>
</Link>;

const navigate = useNavigate();
const submit = async () => {
  const result = await form.submit();
  if (result.ok) {
    navigate("formSubmitted");
  }
};

loggedIn ? (
  <NavigateIfFocused to="/app" replace />
) : (
  <NavigateIfFocused to="/login" replace />
);
```

## Styling Tabs

Tabs can be styled by providing a `tabsConfig` prop to the TabNavigator.

```tsx
const mainTabsConfig = {
  feed: {
    title: "My feed"
    icon: ({active, color, size}) => <FeedIcon active={active} color={color} size={size} />
  },
  profile: {
    title: "My profile"
    icon: ({active, color, size}) => <ProfileIcon active={active} color={color} size={size} />
  },
};

<TabNavigator tabsConfig={mainTabsConfig}>
```

If you need more styling options you can override the BottomTabsComponent according to the API docs.
Additional props passed in tabConfig will be provided to the custom tabs component.
Check the [DefaultBottomTabs](https://github.com/software-mansion-labs/react-native-url-router/blob/main/src/components/DefaultBottomTabs.tsx) implementation for details.

```tsx
const myTabsConfig = {
  feed: {
    title: "My feed"
    rounded: true
  },
  profile: {
    title: "My profile"
    rounded: false
  },
};
<TabNavigator BottomTabsComponent={MyBottomTabs} tabsConfig={myTabsConfig}>
```

## Styling the Stack Navigator

Stack Navigator can be styled by providing defaultScreenConfig or screensConfig props. When configuration for a specific path is not provided in the screensConfig under a correct key, the default one is used as fallback. These configurations are shallow merged.

```tsx
const screensConfig = {
  feed: {
    title: "My feed"
    stackHeaderConfig: { hidden: true },
    containerStyle: { backgroundColor: "#fff" },
    stackConfig: { gestureEnabled: false }
  },
};

const defaultScreenConfig = { title: "Other screens" }

<StackNavigator screensConfig={screensConfig} defaultScreenConfig={defaultScreenConfig}/>
```

There's a bit more to explain here.

The `containerStyle` is a regular styles prop passed onto the root container.

The `stackConfig` defines customization options from `react-native-screens` passed onto the native ScreenStack.
[Read this props list](https://github.com/software-mansion/react-native-screens/blob/main/guides/GUIDE_FOR_LIBRARY_AUTHORS.md#screenstack) for details.

The `stackHeaderConfig` is spread into the [ `<ScreenStackHeaderConfig>`](https://github.com/software-mansion/react-native-screens/blob/main/guides/GUIDE_FOR_LIBRARY_AUTHORS.md#screenstackheaderconfig) from react-native-screens.

On stackHeaderConfig you can define props like `hidden`, `autoFocus` and others.

If you need to fully customize your header, you can provide `stackHeaderConfig.children` to style the special child views like `ScreenStackHeaderCenterView`.

```tsx
stackHeaderConfig = {
  children: <>
    <ScreenStackHeaderCenterView>
      <CustomCenterText/>
    <ScreenStackHeaderCenterView/>
  </>
}
```

## What if an opened URL is not found?

Well... Nothing. Screens still remain at their old order, tabs don't switch and you don't see a 404 screen.

This allows us to do nifty stuff like botom modals and side by side views.

As long as the two layers (screens behind the modal and the modal itself) have different URL prefixes (see nested history), it works automagically.

<!-- link -->

<!-- Styling
Debug url bar
TODO

404s don't exist -->
