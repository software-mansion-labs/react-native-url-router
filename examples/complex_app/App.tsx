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
  Navigate,
} from "react-native-url-router";
import { Route } from "react-router";
import Feed from "./Feed";
import PostCreationSheet from "./PostCreationSheet";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(true);
  console.log({ loggedIn });
  return (
    <View style={styles.container}>
      <NativeRouter>
        <>
          <StackNavigator
            defaultScreenConfig={{
              stackHeaderConfig: { hidden: true },
              containerStyle: { backgroundColor: "#fff" },
            }}
          >
            <Route
              path="/"
              element={
                loggedIn ? (
                  <Navigate to="/app" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="login"
              element={
                <View
                  style={{ padding: 20, backgroundColor: "white", flex: 1 }}
                >
                  <Text>Login screen</Text>
                  <TextInput value="username" />
                  <TextInput value="password" />
                  {loggedIn && <Navigate to="/app" replace />}
                  <Button onPress={() => setLoggedIn(true)} title="Login" />
                </View>
              }
            />
            <Route
              path="app/*"
              element={
                <TabNavigator
                  tabsConfig={{
                    "feed/*": { title: "Feed" },
                    profile: { title: "Profile" },
                  }}
                >
                  <Route path="feed/*" element={<Feed />} />
                  <Route
                    path="profile"
                    element={
                      <>
                        <Text>Profile</Text>
                        <Button
                          onPress={() => setLoggedIn(false)}
                          title="Logout"
                        />
                        {!loggedIn && <Navigate to="/login" replace />}
                      </>
                    }
                  />
                </TabNavigator>
              }
            />
          </StackNavigator>
          {/* breaks logout */}
          <PostCreationSheet />
        </>
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
