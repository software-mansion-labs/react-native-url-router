import { useState } from "react";

import { StatusBar } from "expo-status-bar";
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  NativeRouter,
  StackNavigator,
  TabNavigator,
  NavigateIfFocused,
} from "react-native-url-router";
import { Route, Navigate } from "react-router";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  return (
    <View style={styles.container}>
      <NativeRouter>
        <StackNavigator
          defaultScreenConfig={{
            stackHeaderConfig: { hidden: true },
            containerStyle: { backgroundColor: "#fff" },
          }}
          screensConfig={{
            "/": { title: "" },
            login: { title: "Login" },
          }}
        >
          <Route
            path="/"
            element={
              loggedIn ? (
                <NavigateIfFocused to="/app" replace />
              ) : (
                <NavigateIfFocused to="/login" replace />
              )
            }
          />
          <Route
            path="login"
            element={
              <View style={{ padding: 20, backgroundColor: "white", flex: 1 }}>
                <Text>Login screen</Text>
                <TextInput value="username" />
                <TextInput value="password" />
                {loggedIn && <NavigateIfFocused to="/app" replace />}
                <Button onPress={() => setLoggedIn(true)} title="Login" />
              </View>
            }
          />
          <Route
            path="app"
            element={
              <View style={{ padding: 20, backgroundColor: "white", flex: 1 }}>
                <Text>App</Text>
                <Button onPress={() => setLoggedIn(false)} title="Logout" />
                {!loggedIn && <NavigateIfFocused to="/login" replace />}
              </View>
            }
          />
        </StackNavigator>
      </NativeRouter>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
