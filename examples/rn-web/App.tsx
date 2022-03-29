import { useState } from "react";

import { StatusBar } from "expo-status-bar";
import {
  Button,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Feed from "./Feed";
// import PostCreationSheet from "./PostCreationSheet";
import {
  StackOrRoutes,
  TabOrRoutes,
  PlatformSpecificRouter,
  Route,
  Navigate,
  Link,
  Outlet,
} from "./combinedexports";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(true);
  return (
    <View style={styles.container}>
      <PlatformSpecificRouter>
        <>
          <StackOrRoutes
            defaultScreenConfig={{
              stackHeaderConfig: { hidden: true },
              containerStyle: { backgroundColor: "#fff" },
            }}
          >
            <Route
              path="/"
              element={
                <>
                  <Text>Layout</Text>
                  <Link to="/app/feed">
                    <Text>link</Text>
                  </Link>
                  {/* {loggedIn ? (
                    <Navigate to="/app/feed" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )} */}
                  <Outlet />
                </>
              }
            >
              <Route
                path="login"
                element={
                  <View
                    style={{
                      padding: 20,
                      backgroundColor: "white",
                      flex: 1,
                    }}
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
                  <TabOrRoutes
                    tabsConfig={{
                      "feed/*": { title: "Feed" },
                      profile: { title: "Profile" },
                    }}
                  >
                    <Route path="feed/*" element={<Feed />} />
                    <Route
                      path="profile"
                      element={
                        <View style={{ padding: 30 }}>
                          <Text>Profile</Text>
                          <Button
                            onPress={() => setLoggedIn(false)}
                            title="Logout"
                          />
                          {!loggedIn && <Navigate to="/login" replace />}
                        </View>
                      }
                    />
                  </TabOrRoutes>
                }
              />
            </Route>
          </StackOrRoutes>
          {/* <PostCreationSheet /> */}
        </>
      </PlatformSpecificRouter>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "stretch",
    justifyContent: "center",
  },
});
