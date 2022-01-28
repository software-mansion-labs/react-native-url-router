# React Native Url Router

## [Documentation page](https://software-mansion-labs.github.io/react-native-url-router/docs/overview)

## Motivation

React Native Url Router aims to simplify native navigation patterns.

It allows for native navigation UI that feels natural on mobile together with easy navigation by opening URLs.

It exports Stack and Tab Navigators same as react-navigation, but they are usually closely mapped with an app-wide URL structure.

Being designed to work seamlessly with react-router and it should feel immidiately intuitive to people who used react-router on web.

React Router provides the routing logic, route ranking, matching, params support and more.

React Native Url Router provides a powerful new abstraction over a regular web history stack.
It also integrates with react-native-screens providing a fully native stack behavior, and relies on react-native-pager-view for swipeable Tabs.

## Usage

```tsx
<StackNavigator>
    <Route
        path="/"
        element={<NavigateWhenFocused to={loggedIn ? "/app" : "/login" replace />}}
    />
    <Route
        path="/login"
        element={
            <>
            {loggedIn && <NavigateWhenFocused to="/app" replace />}
            <Button onPress={() => setLoggedIn(true)} title="Login" />
            </>
        }
    />
    <Route
        path="/app"
        element={
            <>
            {!loggedIn && <NavigateWhenFocused to="/login" replace />}
            <Button onPress={() => setLoggedIn(false)} title="Logout" />
            </>
        }
    />
</StackNavigator>
```

## Installation

For expo:

```
expo install react-native-url-router react-native-pager-view react-native-screens react-router
```

For regular react native >=0.60:

```
yarn add react-native-url-router react-native-pager-view react-native-screens react-router

```

Also follow https://github.com/software-mansion/react-native-screens#installation for android

## Documentation

https://software-mansion-labs.github.io/react-native-url-router/docs/overview

## Examples

Check out `examples/` for a quick start into using react-native-url-router in your own project.

## License

React Native Url Router library is licensed under The MIT License.
